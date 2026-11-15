-- 0013 — Networking: attendees directory, friend requests, direct messages.
--
-- Additive only. Adds:
--   1. connection_status enum + connections table (RLS-gated)
--   2. direct_messages table (Realtime, RLS-gated to accepted, unblocked pairs)
--   3. can_message_connection() access helper
--   4. read models: get_event_attendees, get_conversations, get_direct_messages,
--      get_incoming_requests, get_connection_partner
--
-- The attendee directory must read OTHER users' tickets, so get_event_attendees
-- is SECURITY DEFINER and first checks has_event_access() before returning rows.

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'connection_status'
  ) then
    create type public.connection_status as enum ('pending', 'accepted', 'rejected');
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Friend requests.
-- ---------------------------------------------------------------------------
create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  receiver_id uuid not null references public.profiles (id) on delete cascade,
  status public.connection_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint connections_no_self check (requester_id <> receiver_id)
);

drop trigger if exists set_updated_at on public.connections;
create trigger set_updated_at
  before update on public.connections
  for each row execute function public.set_updated_at();

-- One active (pending) request per unordered pair, so neither duplicates nor
-- two-way simultaneous requests are possible.
create unique index if not exists connections_pending_unique
  on public.connections (least(requester_id, receiver_id), greatest(requester_id, receiver_id))
  where status = 'pending';

create index if not exists connections_receiver_idx on public.connections (receiver_id, status);
create index if not exists connections_requester_idx on public.connections (requester_id, status);

alter table public.connections enable row level security;

drop policy if exists "connections_insert_self" on public.connections;
create policy "connections_insert_self"
  on public.connections for insert
  to authenticated
  with check (requester_id = (select auth.uid()) and status = 'pending');

drop policy if exists "connections_select_involved" on public.connections;
create policy "connections_select_involved"
  on public.connections for select
  to authenticated
  using (requester_id = (select auth.uid()) or receiver_id = (select auth.uid()));

drop policy if exists "connections_update_receiver" on public.connections;
create policy "connections_update_receiver"
  on public.connections for update
  to authenticated
  using (receiver_id = (select auth.uid()))
  with check (receiver_id = (select auth.uid()) and status in ('accepted', 'rejected'));

-- ---------------------------------------------------------------------------
-- Can the caller message this connection? (accepted + not blocked either way)
-- ---------------------------------------------------------------------------
create or replace function public.can_message_connection(p_connection_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.connections c
    where c.id = p_connection_id
      and c.status = 'accepted'
      and (c.requester_id = (select auth.uid()) or c.receiver_id = (select auth.uid()))
      and not exists (
        select 1
        from public.user_blocks b
        where (b.blocker_id = c.requester_id and b.blocked_id = c.receiver_id)
           or (b.blocker_id = c.receiver_id and b.blocked_id = c.requester_id)
      )
  );
$$;

revoke all on function public.can_message_connection(uuid) from public;
grant execute on function public.can_message_connection(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Direct messages.
-- ---------------------------------------------------------------------------
create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.connections (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists direct_messages_connection_created_idx
  on public.direct_messages (connection_id, created_at desc, id desc);

alter table public.direct_messages enable row level security;

drop policy if exists "direct_messages_select" on public.direct_messages;
create policy "direct_messages_select"
  on public.direct_messages for select
  to authenticated
  using (public.can_message_connection(connection_id));

drop policy if exists "direct_messages_insert" on public.direct_messages;
create policy "direct_messages_insert"
  on public.direct_messages for insert
  to authenticated
  with check (sender_id = (select auth.uid()) and public.can_message_connection(connection_id));

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'direct_messages'
  ) then
    alter publication supabase_realtime add table public.direct_messages;
  end if;
end
$$;

alter table public.direct_messages replica identity full;

-- ---------------------------------------------------------------------------
-- Read model: event attendees (public profiles with a verified ticket).
-- SECURITY DEFINER: it reads other users' tickets, so it verifies access first.
-- ---------------------------------------------------------------------------
create or replace function public.get_event_attendees(
  p_event_id uuid,
  p_interest text default null,
  p_common boolean default false
)
returns table (
  id uuid,
  full_name text,
  avatar_url text,
  profession text,
  bio text,
  interests text[],
  social_links jsonb,
  matched_interests text[]
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_my_interests text[];
begin
  if not public.has_event_access(p_event_id) then
    return;
  end if;

  select coalesce(p.interests, '{}'::text[]) into v_my_interests
  from public.profiles p
  where p.id = v_uid;

  return query
  select
    p.id,
    p.full_name,
    p.avatar_url,
    p.profession,
    p.bio,
    p.interests,
    p.social_links,
    array(
      select x
      from unnest(p.interests) as x
      where x = any(v_my_interests)
    ) as matched_interests
  from public.profiles p
  where p.is_public
    and p.id <> v_uid
    and exists (
      select 1
      from public.tickets t
      where t.event_id = p_event_id
        and t.user_id = p.id
        and t.status = 'verified'
    )
    and not exists (
      select 1
      from public.user_blocks b
      where b.blocker_id = v_uid and b.blocked_id = p.id
    )
    and (p_interest is null or p_interest = any(p.interests))
    and (
      not p_common
      or exists (select 1 from unnest(p.interests) x where x = any(v_my_interests))
    )
  order by
    (case when p_common then cardinality(array(
      select x from unnest(p.interests) x where x = any(v_my_interests)
    )) else 0 end) desc,
    p.full_name asc nulls last
  limit 200;
end;
$$;

revoke all on function public.get_event_attendees(uuid, text, boolean) from public;
grant execute on function public.get_event_attendees(uuid, text, boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- Read model: accepted conversations (with last message, excluding blocked).
-- SECURITY INVOKER so RLS on connections/profiles/direct_messages still applies.
-- ---------------------------------------------------------------------------
create or replace function public.get_conversations()
returns table (
  connection_id uuid,
  other_id uuid,
  other_name text,
  other_avatar text,
  other_profession text,
  last_message text,
  last_message_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    c.id as connection_id,
    case when c.requester_id = (select auth.uid()) then c.receiver_id else c.requester_id end as other_id,
    p.full_name as other_name,
    p.avatar_url as other_avatar,
    p.profession as other_profession,
    last.content as last_message,
    last.created_at as last_message_at
  from public.connections c
  join public.profiles p
    on p.id = case when c.requester_id = (select auth.uid()) then c.receiver_id else c.requester_id end
  left join lateral (
    select dm.content, dm.created_at
    from public.direct_messages dm
    where dm.connection_id = c.id
    order by dm.created_at desc, dm.id desc
    limit 1
  ) last on true
  where c.status = 'accepted'
    and (c.requester_id = (select auth.uid()) or c.receiver_id = (select auth.uid()))
    and not exists (
      select 1
      from public.user_blocks b
      where (b.blocker_id = c.requester_id and b.blocked_id = c.receiver_id)
         or (b.blocker_id = c.receiver_id and b.blocked_id = c.requester_id)
    )
  order by last_message_at desc nulls last;
$$;

revoke all on function public.get_conversations() from public;
grant execute on function public.get_conversations() to authenticated;

-- ---------------------------------------------------------------------------
-- Read model: incoming (pending) friend requests.
-- ---------------------------------------------------------------------------
create or replace function public.get_incoming_requests()
returns table (
  connection_id uuid,
  user_id uuid,
  full_name text,
  avatar_url text,
  profession text,
  created_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    c.id as connection_id,
    p.id as user_id,
    p.full_name,
    p.avatar_url,
    p.profession,
    c.created_at
  from public.connections c
  join public.profiles p on p.id = c.requester_id
  where c.receiver_id = (select auth.uid())
    and c.status = 'pending'
  order by c.created_at desc;
$$;

revoke all on function public.get_incoming_requests() from public;
grant execute on function public.get_incoming_requests() to authenticated;

-- ---------------------------------------------------------------------------
-- Read model: the other participant of an accepted connection (for the header).
-- ---------------------------------------------------------------------------
create or replace function public.get_connection_partner(p_connection_id uuid)
returns table (other_id uuid, other_name text, other_avatar text)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    case when c.requester_id = (select auth.uid()) then c.receiver_id else c.requester_id end,
    p.full_name,
    p.avatar_url
  from public.connections c
  join public.profiles p
    on p.id = case when c.requester_id = (select auth.uid()) then c.receiver_id else c.requester_id end
  where c.id = p_connection_id
    and c.status = 'accepted'
    and (c.requester_id = (select auth.uid()) or c.receiver_id = (select auth.uid()));
$$;

revoke all on function public.get_connection_partner(uuid) from public;
grant execute on function public.get_connection_partner(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Read model: a conversation's messages (oldest-first via p_before keyset).
-- ---------------------------------------------------------------------------
create or replace function public.get_direct_messages(
  p_connection_id uuid,
  p_before timestamptz default null,
  p_limit int default 50
)
returns table (
  id uuid,
  connection_id uuid,
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
    dm.id,
    dm.connection_id,
    dm.sender_id,
    dm.content,
    dm.created_at,
    p.full_name as sender_name,
    p.avatar_url as sender_avatar
  from public.direct_messages dm
  left join public.profiles p on p.id = dm.sender_id
  where dm.connection_id = p_connection_id
    and (p_before is null or dm.created_at < p_before)
  order by dm.created_at desc, dm.id desc
  limit least(greatest(p_limit, 1), 100);
$$;

revoke all on function public.get_direct_messages(uuid, timestamptz, int) from public;
grant execute on function public.get_direct_messages(uuid, timestamptz, int) to authenticated;
