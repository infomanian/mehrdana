-- 0014 — Admin panel completion: user bans + report actor ids.
--
-- Additive only. Adds:
--   1. profiles.is_banned / banned_at / banned_by (with an audit trail)
--   2. is_banned() security-definer helper
--   3. a trigger so only an admin can change ban fields (blocks self-unban)
--   4. ban enforcement in RLS for chat, DMs, friend requests and reports
--   5. get_reports() also returns reported_user_id (for the ban button)

-- ---------------------------------------------------------------------------
-- Ban columns (audit trail included).
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists is_banned boolean not null default false,
  add column if not exists banned_at timestamptz,
  add column if not exists banned_by uuid references public.profiles (id) on delete set null;

-- ---------------------------------------------------------------------------
-- Is the current user banned?
-- ---------------------------------------------------------------------------
create or replace function public.is_banned()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select p.is_banned from public.profiles p where p.id = (select auth.uid())), false);
$$;

revoke all on function public.is_banned() from public;
grant execute on function public.is_banned() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Defense in depth: a normal user can never change their own ban fields (a
-- user must not be able to un-ban themselves through the REST API).
-- ---------------------------------------------------------------------------
create or replace function public.protect_ban_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (
    new.is_banned is distinct from old.is_banned
    or new.banned_at is distinct from old.banned_at
    or new.banned_by is distinct from old.banned_by
  ) and not public.is_admin() then
    raise exception 'only an admin can change ban fields';
  end if;

  return new;
end;
$$;

revoke all on function public.protect_ban_fields() from public;

drop trigger if exists protect_ban_fields on public.profiles;
create trigger protect_ban_fields
  before update on public.profiles
  for each row execute function public.protect_ban_fields();

-- ---------------------------------------------------------------------------
-- Ban enforcement: a suspended user can still browse, but cannot send chat
-- messages, direct messages, friend requests or reports.
-- ---------------------------------------------------------------------------
drop policy if exists "event_messages_insert_access" on public.event_messages;
create policy "event_messages_insert_access"
  on public.event_messages for insert
  to authenticated
  with check (public.has_event_access(event_id) and not public.is_banned());

drop policy if exists "connections_insert_self" on public.connections;
create policy "connections_insert_self"
  on public.connections for insert
  to authenticated
  with check (requester_id = (select auth.uid()) and status = 'pending' and not public.is_banned());

drop policy if exists "reports_insert_self" on public.reports;
create policy "reports_insert_self"
  on public.reports for insert
  to authenticated
  with check (reporter_id = (select auth.uid()) and not public.is_banned());

drop policy if exists "direct_messages_insert" on public.direct_messages;
create policy "direct_messages_insert"
  on public.direct_messages for insert
  to authenticated
  with check (
    sender_id = (select auth.uid())
    and public.can_message_connection(connection_id)
    and not public.is_banned()
  );

-- ---------------------------------------------------------------------------
-- Reports read model now exposes the reported user id (for the ban action).
-- The return type changes, so the function must be dropped before recreation.
-- ---------------------------------------------------------------------------
drop function if exists public.get_reports();
create function public.get_reports()
returns table (
  id uuid,
  reason text,
  note text,
  status public.report_status,
  created_at timestamptz,
  reporter_name text,
  reported_name text,
  reported_user_id uuid,
  reported_banned boolean,
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
    r.reported_user_id,
    coalesce(reported.is_banned, false) as reported_banned,
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
