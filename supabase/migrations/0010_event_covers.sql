-- 0010 — Event cover storage and a filter-friendly index.
--
-- Covers are public files (they appear on public event pages), but only an
-- admin may upload or replace them. The bucket lives next to `avatars` so the
-- existing next.config.ts remote pattern already allows the images.
--
-- Additive only: no table is altered and no data is deleted.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-covers',
  'event-covers',
  true,
  4194304, -- 4 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "event_covers_public_read" on storage.objects;
create policy "event_covers_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'event-covers');

drop policy if exists "event_covers_admin_insert" on storage.objects;
create policy "event_covers_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'event-covers' and public.is_admin());

drop policy if exists "event_covers_admin_update" on storage.objects;
create policy "event_covers_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'event-covers' and public.is_admin())
  with check (bucket_id = 'event-covers' and public.is_admin());

drop policy if exists "event_covers_admin_delete" on storage.objects;
create policy "event_covers_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'event-covers' and public.is_admin());

-- The showcase always filters by status and (optionally) category, then sorts
-- by date. A covering index keeps that single query cheap as events grow.
create index if not exists events_category_status_date_idx
  on public.events (category_id, status, event_date);
