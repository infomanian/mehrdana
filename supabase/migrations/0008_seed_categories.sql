-- 0008 — Initial categories (matches the product brief).
-- Idempotent: re-running never duplicates rows.

insert into public.categories (name, slug)
values
  ('روان‌شناسی', 'psychology'),
  ('فلسفه', 'philosophy'),
  ('بیزنس', 'business'),
  ('نوروساینس', 'neuroscience')
on conflict (slug) do nothing;
