-- 0015_grants.sql
--
-- Newer Supabase projects no longer expose the `public` schema to the API roles
-- by default. Row Level Security alone is not enough: PostgREST also needs table,
-- sequence and schema privileges before it can even evaluate a policy, otherwise
-- every request fails with `permission denied for table ...` (42501).
--
-- These grants only open the door; the policies in 0002-0014 still decide which
-- rows each role may read or change.
--
--   anon          signed-out visitors: read-only, and RLS keeps private rows out
--   authenticated signed-in members: read/write, limited by RLS
--   service_role  trusted server code: full access, bypasses RLS entirely
--
-- Safe to re-run.

grant usage on schema public to anon, authenticated, service_role;

grant select on all tables in schema public to anon;

grant select, insert, update, delete on all tables in schema public to authenticated;

grant all privileges on all tables in schema public to service_role;

grant usage, select on all sequences in schema public to authenticated, service_role;

-- Tables added in later migrations should keep working without another grant pass.
alter default privileges in schema public grant select on tables to anon;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
  grant usage, select on sequences to authenticated, service_role;
