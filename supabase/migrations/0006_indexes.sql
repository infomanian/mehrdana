-- 0006 — Indexes for the queries the app will actually run.
-- Every foreign key used in filters or joins is indexed, so the database does
-- not fall back to sequential scans as data grows.

create index if not exists events_category_id_idx on public.events (category_id);
create index if not exists events_speaker_id_idx on public.events (speaker_id);
create index if not exists events_status_date_idx on public.events (status, event_date);
create index if not exists events_date_idx on public.events (event_date desc);

create index if not exists tickets_user_id_idx on public.tickets (user_id);
create index if not exists tickets_event_id_idx on public.tickets (event_id);
create index if not exists tickets_event_status_idx on public.tickets (event_id, status);
create index if not exists tickets_external_code_idx on public.tickets (external_ticket_code)
  where external_ticket_code is not null;

-- Interest filtering on the attendee directory (array containment queries).
create index if not exists profiles_interests_idx on public.profiles using gin (interests);

-- Small, cheap index: only non-default roles are worth looking up.
create index if not exists profiles_privileged_role_idx on public.profiles (role)
  where role <> 'user';
