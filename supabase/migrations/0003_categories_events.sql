-- 0003 — Categories and events (public discovery data).
-- NOTE: secret access links live in public.event_access (migration 0005),
-- never in this table, so anonymous visitors can read event pages safely.

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 160),
  description text check (char_length(description) <= 20000),
  category_id uuid references public.categories (id) on delete set null,
  speaker_id uuid references public.profiles (id) on delete set null,
  status public.event_status not null default 'upcoming',
  event_date timestamptz not null,
  location_address text check (char_length(location_address) <= 300),
  fidibo_url text check (fidibo_url is null or fidibo_url ~ '^https://'),
  price_in_person_irr numeric(12, 0) check (price_in_person_irr >= 0),
  price_online_irr numeric(12, 0) check (price_online_irr >= 0),
  price_in_person_usd numeric(10, 2) check (price_in_person_usd >= 0),
  price_online_usd numeric(10, 2) check (price_online_usd >= 0),
  recording_price_irr numeric(12, 0) check (recording_price_irr >= 0),
  recording_price_usd numeric(10, 2) check (recording_price_usd >= 0),
  cover_image_url text check (cover_image_url is null or cover_image_url ~ '^https://'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.events is 'Public event listing. Secrets are stored in public.event_access.';

drop trigger if exists set_updated_at on public.events;
create trigger set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.events enable row level security;

drop policy if exists "categories_select_all" on public.categories;
create policy "categories_select_all"
  on public.categories for select
  to anon, authenticated
  using (true);

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write"
  on public.categories for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "events_select_all" on public.events;
create policy "events_select_all"
  on public.events for select
  to anon, authenticated
  using (true);

drop policy if exists "events_admin_write" on public.events;
create policy "events_admin_write"
  on public.events for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
