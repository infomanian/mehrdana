-- 0004 — Tickets.
--
-- Access-control rule: tickets are created only by trusted server code or an
-- admin. There is intentionally NO insert policy for end users, otherwise a
-- user could grant themselves access to a paid event chat room.

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  ticket_type public.ticket_type not null,
  payment_gateway public.payment_gateway not null,
  amount_paid numeric(12, 2) check (amount_paid >= 0),
  currency public.currency_code not null,
  external_ticket_code text
    check (external_ticket_code is null or char_length(external_ticket_code) between 4 and 64),
  status public.ticket_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tickets_unique_per_type unique (user_id, event_id, ticket_type),
  constraint tickets_gateway_currency check (
    (payment_gateway = 'fidibo' and currency = 'IRR')
    or (payment_gateway in ('stripe', 'paypal') and currency = 'USD')
  )
);

drop trigger if exists set_updated_at on public.tickets;
create trigger set_updated_at
  before update on public.tickets
  for each row execute function public.set_updated_at();

alter table public.tickets enable row level security;

drop policy if exists "tickets_select_own" on public.tickets;
create policy "tickets_select_own"
  on public.tickets for select
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "tickets_admin_all" on public.tickets;
create policy "tickets_admin_all"
  on public.tickets for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
