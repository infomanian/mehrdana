# Supabase setup (Module 1)

This folder contains the database foundation for MehrDana: the schema and the
Row Level Security (RLS) rules that protect it.

## What is included in this phase

| Table            | Purpose                                                        |
| ---------------- | -------------------------------------------------------------- |
| `profiles`       | Public profile, one row per `auth.users` row (auto-created).    |
| `categories`     | Psychology, Philosophy, Business, Neuroscience.                |
| `events`         | Public event data (title, prices, date, cover, Fidibo URL).     |
| `tickets`        | Purchased/verified tickets. Users read only their own.          |
| `event_access`   | Private Skyroom link + recording URL (locked, see below).       |

Event chat, connections, direct messages, blocks and reports are added in their
own phases (4 and 5).

## How to apply

1. Open your Supabase project → **SQL Editor**.
2. Run the files in `migrations/` **in numeric order** (0001 → 0008). Each file
   is safe to re-run.
3. Run `verify/verify_rls.sql` and confirm every check matches the expected
   result written above the query.
4. Copy the project URL and the **anon** key into `.env` (see `.env.example`).

With the Supabase CLI you can also run `supabase db push` once the project is
linked.

## Why secrets are not on `events`

Event pages are public, so anything stored on `events` can be read by anyone
with the public key. The Skyroom link and the paid recording URL therefore live
in `event_access`, which is readable only by admins. Ticket holders receive the
links through the `get_event_access(event_id)` function, which checks for a
**verified** ticket, the event speaker, or an admin first. If access is denied
the function returns an empty result, so an attacker cannot even tell whether a
link exists.

Client usage (from a signed-in session):

```ts
const { data } = await supabase.rpc("get_event_access", { p_event_id: eventId });
// data is [] when the user has no access
```

## Rules the application must respect

- **Never** insert tickets from the browser. Ticket rows are created by trusted
  server code (payment webhook / admin action), because a self-issued ticket
  would unlock a paid chat room.
- Roles are only changeable by an admin. A database trigger blocks self
  promotion even if a policy were misconfigured.
- Avatars are limited to 2 MB, `jpeg|png|webp`, and each user can only write
  inside `avatars/<their-own-user-id>/`.

## Creating the first admin

Run this once in the SQL Editor after the first user signs up (Module 2):

```sql
update public.profiles set role = 'admin' where id = '<USER-UUID>';
```

## Realtime

Realtime is intentionally **not** enabled yet. It will be turned on only for
`event_messages` and `direct_messages` in their phases, to avoid broadcasting
tables that do not need it.
