-- 0001 — Enum types and shared helpers.
-- Safe to run more than once.

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'user_role'
  ) then
    create type public.user_role as enum ('user', 'speaker', 'admin');
  end if;

  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'event_status'
  ) then
    create type public.event_status as enum ('upcoming', 'live', 'past');
  end if;

  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'ticket_type'
  ) then
    create type public.ticket_type as enum ('in_person', 'online', 'recording_only');
  end if;

  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'payment_gateway'
  ) then
    create type public.payment_gateway as enum ('fidibo', 'stripe', 'paypal');
  end if;

  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'currency_code'
  ) then
    create type public.currency_code as enum ('IRR', 'USD');
  end if;

  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'ticket_status'
  ) then
    create type public.ticket_status as enum ('pending', 'verified', 'rejected');
  end if;
end
$$;

-- Keeps updated_at accurate without trusting the client.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public;
