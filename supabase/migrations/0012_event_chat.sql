-- 0012 — Real-time event chat + block + report.
--
-- Additive only. Adds:
--   1. event_messages   (Realtime, RLS-gated to ticket holders/speaker/admin)
--   2. user_blocks      (global, one-way hide)
--   3. reports          (message reports + admin moderation)
--   4. get_event_messages() and get_reports() read models
--
-- Realtime authorization is provided by the RLS select policy: Supabase only
-- broadcasts rows a subscriber is allowed to read.

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'report_status'
  ) then
    create type public.report_status as enum ('open', 'resolved');
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Event group chat.
-- ---------------------------------------------------------------------------
create table if not exists public.event_messages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists event_messages_event_created_idx
  on public.event_messages (event_id, created_at desc, id desc);

alter table public.event_messages enable row level security;

-- Read and write only for verified ticket holders, the event speaker or an admin.
drop policy if exists "event_messages_select_access" on public.event_messages;
create policy "event_messages_select_access"
  on public.event_messages for select
  to authenticated
  using (public.has_event_access(event_id));

drop policy if exists "event_messages_insert_access" on public.event_messages;
create policy "event_messages_insert_access"
  on public.event_messages for insert
  to authenticated
  with check (public.has_event_access(event_id));

-- Admins can also remove an offending message.
drop policy if exists "event_messages_admin_all" on public.event_messages;
create policy "event_messages_admin_all"
  on public.event_messages for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Realtime: publish changes and keep the old row so DELETE events carry the id.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'event_messages'
  ) then
    alter publication supabase_realtime add table public.event_messages;
  end if;
end
$$;

alter table public.event_messages replica identity full;

-- ---------------------------------------------------------------------------
-- Blocks (global, one-way: hides the blocked user's messages from the blocker).
-- ---------------------------------------------------------------------------
create table if not exists public.user_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint user_blocks_unique unique (blocker_id, blocked_id),
  constraint user_blocks_no_self check (blocker_id <> blocked_id)
);

create index if not exists user_blocks_blocker_idx on public.user_blocks (blocker_id);

alter table public.user_blocks enable row level security;

drop policy if exists "user_blocks_self" on public.user_blocks;
create policy "user_blocks_self"
  on public.user_blocks for all
  to authenticated
  using (blocker_id = (select auth.uid()))
  with check (blocker_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Reports (message-based, with preset reason + optional note).
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reported_user_id uuid not null references public.profiles (id) on delete cascade,
  message_id uuid references public.event_messages (id) on delete set null,
  reason text not null check (char_length(reason) between 1 and 100),
  note text check (note is null or char_length(note) <= 500),
  status public.report_status not null default 'open',
  created_at timestamptz not null default now()
);

create index if not exists reports_status_idx on public.reports (status, created_at desc);

alter table public.reports enable row level security;

drop policy if exists "reports_insert_self" on public.reports;
create policy "reports_insert_self"
  on public.reports for insert
  to authenticated
  with check (reporter_id = (select auth.uid()));

drop policy if exists "reports_select_self_or_admin" on public.reports;
create policy "reports_select_self_or_admin"
  on public.reports for select
  to authenticated
  using (reporter_id = (select auth.uid()) or public.is_admin());

drop policy if exists "reports_admin_update" on public.reports;
create policy "reports_admin_update"
  on public.reports for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Read model: chat messages joined with sender info, excluding blocked senders.
-- SECURITY INVOKER so RLS still decides access; the block filter is applied
-- in the database so a blocked user's messages are never sent to the client.
-- ---------------------------------------------------------------------------
create or replace function public.get_event_messages(
  p_event_id uuid,
  p_before timestamptz default null,
  p_limit int default 50
)
returns table (
  id uuid,
  event_id uuid,
  sender_id uuid,
  content text,
  created_at timestamptz,
  sender_name text,
  sender_avatar text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    m.id,
    m.event_id,
    m.sender_id,
    m.content,
    m.created_at,
    p.full_name as sender_name,
    p.avatar_url as sender_avatar
  from public.event_messages m
  left join public.profiles p on p.id = m.sender_id
  where m.event_id = p_event_id
    and (p_before is null or m.created_at < p_before)
    and not exists (
      select 1
      from public.user_blocks b
      where b.blocker_id = (select auth.uid())
        and b.blocked_id = m.sender_id
    )
  order by m.created_at desc, m.id desc
  limit least(greatest(p_limit, 1), 100);
$$;

revoke all on function public.get_event_messages(uuid, timestamptz, int) from public;
grant execute on function public.get_event_messages(uuid, timestamptz, int) to authenticated;

-- ---------------------------------------------------------------------------
-- Read model for the admin report list (joins names + message content).
-- ---------------------------------------------------------------------------
create or replace function public.get_reports()
returns table (
  id uuid,
  reason text,
  note text,
  status public.report_status,
  created_at timestamptz,
  reporter_name text,
  reported_name text,
  message_content text,
  message_id uuid,
  event_id uuid,
  event_title text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    r.id,
    r.reason,
    r.note,
    r.status,
    r.created_at,
    reporter.full_name as reporter_name,
    reported.full_name as reported_name,
    m.content as message_content,
    m.id as message_id,
    m.event_id as event_id,
    e.title as event_title
  from public.reports r
  left join public.profiles reporter on reporter.id = r.reporter_id
  left join public.profiles reported on reported.id = r.reported_user_id
  left join public.event_messages m on m.id = r.message_id
  left join public.events e on e.id = m.event_id
  order by r.created_at desc
  limit 200;
$$;

revoke all on function public.get_reports() from public;
grant execute on function public.get_reports() to authenticated;
