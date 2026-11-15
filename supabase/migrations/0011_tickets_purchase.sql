-- 0011 — Ticket purchase: Fidibo code verification + payment references.
--
-- Additive only. Adds:
--   1. valid_fidibo_codes  (admin pre-uploaded codes for instant verification)
--   2. tickets.payment_reference + unique index (webhook idempotency)
--   3. ticket_verify_attempts (per-user brute-force throttle)
--   4. verify_fidibo_code() security-definer function
--
-- Tickets are NEVER inserted by end users directly (see 0004). Fidibo codes are
-- consumed by the function below, which runs as the caller (auth.uid()) but
-- reads the admin-only codes table as definer.

create table if not exists public.valid_fidibo_codes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  code text not null
    check (char_length(code) between 4 and 64),
  ticket_type public.ticket_type not null,
  is_used boolean not null default false,
  used_by uuid references public.profiles (id) on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  constraint valid_fidibo_codes_event_code_unique unique (event_id, code)
);

create index if not exists valid_fidibo_codes_event_idx
  on public.valid_fidibo_codes (event_id, is_used);

alter table public.valid_fidibo_codes enable row level security;

-- Only admins read/write the code list; regular users never see the codes.
drop policy if exists "valid_fidibo_codes_admin_all" on public.valid_fidibo_codes;
create policy "valid_fidibo_codes_admin_all"
  on public.valid_fidibo_codes for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Payment reference for webhook idempotency (Stripe session id / PayPal order
-- id). The partial unique index rejects a duplicate delivery without a second
-- ticket.
-- ---------------------------------------------------------------------------
alter table public.tickets add column if not exists payment_reference text;

create unique index if not exists tickets_payment_reference_idx
  on public.tickets (payment_reference)
  where payment_reference is not null;

-- ---------------------------------------------------------------------------
-- Per-user verification attempts for the brute-force throttle.
-- Locked: no direct access, only verify_fidibo_code() (security definer) writes.
-- ---------------------------------------------------------------------------
create table if not exists public.ticket_verify_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists ticket_verify_attempts_user_idx
  on public.ticket_verify_attempts (user_id, created_at desc);

alter table public.ticket_verify_attempts enable row level security;

-- ---------------------------------------------------------------------------
-- Consumes a Fidibo code and creates a VERIFIED ticket in one atomic step.
--
-- SECURITY DEFINER so it can read valid_fidibo_codes (admin-only) and write the
-- attempt log; the ticket itself is always issued to auth.uid(). Concurrency is
-- handled with SELECT ... FOR UPDATE SKIP LOCKED, so two people cannot claim the
-- same code. A failed attempt is recorded, and more than 10 failures in 15
-- minutes returns 'rate_limited'.
-- ---------------------------------------------------------------------------
create or replace function public.verify_fidibo_code(p_event_id uuid, p_code text)
returns table (status text, ticket_type public.ticket_type, ticket_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_code text := upper(btrim(p_code));
  v_code_id uuid;
  v_ticket_type public.ticket_type;
  v_ticket_id uuid;
  v_amount numeric;
  v_attempts int;
begin
  if v_uid is null then
    return query select 'not_authenticated'::text, null::public.ticket_type, null::uuid;
    return;
  end if;

  if v_code is null or char_length(v_code) < 4 or char_length(v_code) > 64 then
    return query select 'not_found'::text, null::public.ticket_type, null::uuid;
    return;
  end if;

  select count(*) into v_attempts
  from public.ticket_verify_attempts a
  where a.user_id = v_uid
    and a.created_at > now() - interval '15 minutes';

  if v_attempts >= 10 then
    return query select 'rate_limited'::text, null::public.ticket_type, null::uuid;
    return;
  end if;

  -- Claim the code atomically. A concurrent call skips the locked row.
  select c.id, c.ticket_type
  into v_code_id, v_ticket_type
  from public.valid_fidibo_codes c
  where c.event_id = p_event_id
    and c.code = v_code
    and c.is_used = false
  order by c.id
  for update skip locked
  limit 1;

  if v_code_id is null then
    insert into public.ticket_verify_attempts (user_id) values (v_uid);
    return query select 'not_found'::text, null::public.ticket_type, null::uuid;
    return;
  end if;

  update public.valid_fidibo_codes
  set is_used = true, used_by = v_uid, used_at = now()
  where id = v_code_id;

  select case v_ticket_type
           when 'in_person' then e.price_in_person_irr
           when 'online' then e.price_online_irr
           when 'recording_only' then e.recording_price_irr
         end
  into v_amount
  from public.events e
  where e.id = p_event_id;

  insert into public.tickets (
    user_id, event_id, ticket_type, payment_gateway, currency,
    amount_paid, external_ticket_code, status
  )
  values (
    v_uid, p_event_id, v_ticket_type, 'fidibo', 'IRR',
    v_amount, v_code, 'verified'
  )
  on conflict (user_id, event_id, ticket_type) do nothing
  returning id into v_ticket_id;

  if v_ticket_id is null then
    select t.id into v_ticket_id
    from public.tickets t
    where t.user_id = v_uid
      and t.event_id = p_event_id
      and t.ticket_type = v_ticket_type
    order by t.created_at desc
    limit 1;
  end if;

  return query select 'verified'::text, v_ticket_type, v_ticket_id;
end;
$$;

revoke all on function public.verify_fidibo_code(uuid, text) from public;
grant execute on function public.verify_fidibo_code(uuid, text) to authenticated;
