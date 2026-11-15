-- Security self-check for the database foundation.
-- Run this file in the Supabase SQL Editor after applying the migrations.
-- Each query is read-only or wrapped in a rolled-back transaction.

-- CHECK 1 — Every table in `public` must have RLS enabled.
-- Expected: no rows.
select c.relname as table_without_rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and not c.relrowsecurity
order by 1;

-- CHECK 2 — Secret links must NOT live on the public events table.
-- Expected: no rows.
select column_name as leaked_secret_column
from information_schema.columns
where table_schema = 'public'
  and table_name = 'events'
  and column_name in ('skyroom_link', 'recording_media_url');

-- CHECK 3 — Policy inventory (informational, read it once and confirm each
-- table has the policies described in the migrations).
select tablename, cmd, policyname, roles
from pg_policies
where schemaname = 'public'
order by tablename, cmd, policyname;

-- CHECK 4 — Anonymous visitors cannot read protected tables.
-- Expected: event_access_rows = 0 and ticket_rows = 0.
-- ("permission denied" is also a pass — it means access is even stricter.)
begin;
set local role anon;
select
  (select count(*) from public.event_access) as event_access_rows,
  (select count(*) from public.tickets) as ticket_rows;
rollback;

-- CHECK 5 — Anonymous visitors cannot see profiles that opted out.
-- Expected: private_profiles_visible = 0.
begin;
set local role anon;
select count(*) as private_profiles_visible
from public.profiles
where is_public = false;
rollback;

-- CHECK 6 — Anonymous visitors must not be able to call the access function.
-- Expected: ERROR: permission denied for function get_event_access.
-- Uncomment and run alone:
-- begin;
-- set local role anon;
-- select * from public.get_event_access('00000000-0000-0000-0000-000000000000');
-- rollback;

-- CHECK 7 — Manual privilege-escalation test (run alone, needs a real user id).
-- Expected: ERROR: only an admin can change a profile role.
-- begin;
-- select set_config(
--   'request.jwt.claims',
--   '{"sub":"<USER-UUID>","role":"authenticated"}',
--   true
-- );
-- set local role authenticated;
-- update public.profiles set role = 'admin' where id = '<USER-UUID>';
-- rollback;

-- CHECK 8 — A user without a verified ticket gets no secret links.
-- Expected: 0 rows.
-- begin;
-- select set_config(
--   'request.jwt.claims',
--   '{"sub":"<USER-UUID>","role":"authenticated"}',
--   true
-- );
-- set local role authenticated;
-- select * from public.get_event_access('<EVENT-UUID>');
-- rollback;

-- CHECK 9 — The profile ticket history is not callable by anonymous visitors.
-- Expected: ERROR: permission denied for function get_my_ticket_history.
-- Uncomment and run alone:
-- begin;
-- set local role anon;
-- select * from public.get_my_ticket_history();
-- rollback;

-- CHECK 10 — A signed-in user only sees their own tickets through the function.
-- Expected: every returned row belongs to the JWT subject.
-- begin;
-- select set_config(
--   'request.jwt.claims',
--   '{"sub":"<USER-UUID>","role":"authenticated"}',
--   true
-- );
-- set local role authenticated;
-- select * from public.get_my_ticket_history();
-- rollback;
