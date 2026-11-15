-- 0005 — Protected event access (Skyroom link + recording URL).
--
-- Why a separate table?
--   Events are public marketing pages. If the Skyroom link or the paid video
--   URL lived on public.events, any visitor could read them from the REST API.
--   Here the table is locked for everyone except admins, and ticket holders get
--   the values through get_event_access(), which first verifies a ticket.

create table if not exists public.event_access (
  event_id uuid primary key references public.events (id) on delete cascade,
  skyroom_link text check (skyroom_link is null or skyroom_link ~ '^https://'),
  recording_media_url text
    check (recording_media_url is null or recording_media_url ~ '^https://'),
  updated_at timestamptz not null default now()
);

comment on table public.event_access is
  'Private links. Readable only through public.get_event_access(event_id).';

drop trigger if exists set_updated_at on public.event_access;
create trigger set_updated_at
  before update on public.event_access
  for each row execute function public.set_updated_at();

alter table public.event_access enable row level security;

-- Admins manage the links; nobody reads the table directly.
drop policy if exists "event_access_admin_all" on public.event_access;
create policy "event_access_admin_all"
  on public.event_access for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Does the caller hold access to this event?
-- (verified ticket holder, the event speaker, or an admin)
-- ---------------------------------------------------------------------------
create or replace function public.has_event_access(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    public.is_admin()
    or exists (
      select 1
      from public.events e
      where e.id = p_event_id
        and e.speaker_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.tickets t
      where t.event_id = p_event_id
        and t.user_id = (select auth.uid())
        and t.status = 'verified'
    );
$$;

revoke all on function public.has_event_access(uuid) from public;
grant execute on function public.has_event_access(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- The only way to read the links. Returns an empty result when access is
-- denied, so callers cannot tell "no link" apart from "no access".
-- ---------------------------------------------------------------------------
create or replace function public.get_event_access(p_event_id uuid)
returns table (skyroom_link text, recording_media_url text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.has_event_access(p_event_id) then
    return;
  end if;

  return query
    select ea.skyroom_link, ea.recording_media_url
    from public.event_access ea
    where ea.event_id = p_event_id;
end;
$$;

revoke all on function public.get_event_access(uuid) from public;
grant execute on function public.get_event_access(uuid) to authenticated;
