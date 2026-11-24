-- 0016_trigger_admin_context.sql
--
-- The profile guards compare the caller against `public.is_admin()`, which reads
-- `auth.uid()`. Outside a user request (SQL editor, service-role scripts, data
-- migrations) that value is null, so provisioning the first admin was blocked
-- with "only an admin can change a profile role".
--
-- Trusted database roles are now exempt; end users still need to be admins.
-- `current_user` reflects the role PostgREST switched to (anon / authenticated /
-- service_role), so an anonymous update can never take this branch.
--
-- Safe to re-run.

create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.id <> old.id then
    raise exception 'profiles.id is immutable';
  end if;

  if new.role is distinct from old.role
     and current_user not in ('postgres', 'supabase_admin', 'service_role')
     and not public.is_admin() then
    raise exception 'only an admin can change a profile role';
  end if;

  if new.created_at is distinct from old.created_at then
    new.created_at := old.created_at;
  end if;

  return new;
end;
$$;

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
  ) and current_user not in ('postgres', 'supabase_admin', 'service_role')
    and not public.is_admin() then
    raise exception 'only an admin can change ban fields';
  end if;

  return new;
end;
$$;

revoke all on function public.protect_profile_fields() from public;
revoke all on function public.protect_ban_fields() from public;

grant execute on function public.protect_profile_fields() to service_role;
grant execute on function public.protect_ban_fields() to service_role;
grant execute on function public.is_admin() to service_role;
