-- 0009 — Read model for the profile page ("tickets & payments" tab).
--
-- The profile page needs each ticket together with its event title, date and
-- cover image. The join runs inside the database so the browser makes exactly
-- one request instead of fetching two tables and combining them in JavaScript.
--
-- SECURITY INVOKER (the default, stated explicitly for clarity) is required:
-- the function runs with the caller's permissions, so the existing
-- "tickets_select_own" RLS policy decides which rows are visible. The explicit
-- user_id filter is a second, independent guard.

-- Serves the "newest first" listing without an in-memory sort.
create index if not exists tickets_user_created_idx
  on public.tickets (user_id, created_at desc);

create or replace function public.get_my_ticket_history()
returns table (
  ticket_id uuid,
  event_id uuid,
  event_title text,
  event_date timestamptz,
  cover_image_url text,
  ticket_type public.ticket_type,
  status public.ticket_status,
  payment_gateway public.payment_gateway,
  amount_paid numeric,
  currency public.currency_code,
  created_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    t.id as ticket_id,
    t.event_id,
    e.title as event_title,
    e.event_date,
    e.cover_image_url,
    t.ticket_type,
    t.status,
    t.payment_gateway,
    t.amount_paid,
    t.currency,
    t.created_at
  from public.tickets t
  join public.events e on e.id = t.event_id
  where t.user_id = (select auth.uid())
  order by t.created_at desc
  limit 100;
$$;

comment on function public.get_my_ticket_history() is
  'Own tickets joined with event details for the profile page. RLS applies.';

-- Only signed-in users may call it. Anonymous visitors get "permission denied"
-- instead of an empty list, so they cannot probe the function.
revoke all on function public.get_my_ticket_history() from public;
grant execute on function public.get_my_ticket_history() to authenticated;
