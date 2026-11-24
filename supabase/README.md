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

Module 3 adds the `event-covers` storage bucket (public read, admin-only write)
and a covering index for the showcase filters; see `migrations/0010_event_covers.sql`.

## How to apply

1. Open your Supabase project → **SQL Editor**.
2. Run the files in `migrations/` **in numeric order** (0001 → 0016). Each file
   is safe to re-run, except `0001`, `0012` and `0013` which create enum types
   and therefore fail if run twice.
3. Run `verify/verify_rls.sql` and confirm every check matches the expected
   result written above the query.
4. Copy the project URL (base only, without `/rest/v1/`), the **publishable/anon**
   key and the **secret/service_role** key into `.env` (see `.env.example`).

`0015_grants.sql` exists because recent Supabase projects no longer grant the
`public` schema to the API roles by default. Without it every request fails with
`permission denied for table ...` even though the RLS policies are correct.

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

## Authentication setup (Module 2)

Sign-in is passwordless: the user enters an email address and receives a
6-digit one-time code. Phone (SMS OTP via Kavenegar) is planned for a later
module and will use Supabase's **Send SMS Hook**; nothing in the current code
needs to change for it.

Apply `migrations/0009_ticket_history.sql` before opening `/profile`, because
the "tickets & payments" tab reads `get_my_ticket_history()`.

Then configure the Supabase dashboard:

1. **Authentication → Providers → Email**: keep it enabled.
2. **Authentication → Email Templates → Magic Link**: replace
   `{{ .ConfirmationURL }}` with `{{ .Token }}`. The app asks for a code, not a
   link, so the template must contain the 6-digit token.
3. **Authentication → Settings**:
   - OTP expiry: **120 seconds** or less (codes are short-lived by design).
   - OTP length: **6** (the form expects six digits).
   - Keep the built-in "minimum interval between OTP sends" at **60 seconds**
     or more; the login form also locks the resend button for 60 seconds.
   - Set the **Site URL** to the production domain and add the same domain to
     **Redirect URLs** if you later add magic links.
4. **Custom SMTP**: the default Supabase mailer only delivers to members of the
   project team and has a very low daily cap. Configure your own SMTP provider
   before inviting real users.

The app never logs codes, sessions or tokens, and the server always re-checks
the session inside each Server Action — a request that skips the UI cannot
update somebody else's profile.

## Realtime

Realtime is intentionally **not** enabled yet. It will be turned on only for
`event_messages` and `direct_messages` in their phases, to avoid broadcasting
tables that do not need it.
