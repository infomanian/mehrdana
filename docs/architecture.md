# Project Specification: Hybrid Event & Social Networking Platform (Persian)

## 1. Project Overview & Core Goal
We are building a Persian-language (RTL) web platform and Progressive Web App (PWA) for hosting simultaneous in-person and online events (focused on Psychology, Philosophy, Business, Neuroscience, with expandable categories). 
Beyond event discovery and ticketing, the core value is social networking: ticket holders can enter dedicated event chat rooms (before, during, and after the event), browse fellow attendees filtered by interests, send connection/friend requests, and chat privately.

## 2. Tech Stack & Architecture
- **Framework:** Next.js 14+ (App Router), TypeScript, Tailwind CSS (configured for RTL `dir="rtl"` and Persian fonts like Vazirmatn).
- **PWA:** `next-pwa` for installable mobile web-app experience.
- **Backend & Database:** Supabase (PostgreSQL, Realtime subscriptions for chat, Auth, Storage for avatars/media).
- **Payments:** 
  - International: Stripe / PayPal checkout integration.
  - Domestic (Iran): Redirect to external ticketing platform (Fidibo) + Ticket Code verification system (Admin uploads valid Fidibo ticket codes or approves user-submitted receipts to unlock access).
- **Live Stream & VOD:** External Skyroom links for live online events; protected video/audio player (via ArvanCloud VOD or Supabase signed URLs) for paid past-event recordings.

## 3. User Roles & Authentication
- **Authentication:** 
  - Iranian users: Phone number + SMS OTP (via Kavenegar API).
  - International Iranian diaspora: Email + OTP (via Supabase Auth) to avoid international SMS delivery issues.
- **Roles:**
  1. `user` (Regular Attendee)
  2. `speaker` (Instructor/Speaker - highlighted badge, linked to events)
  3. `admin` (Event Manager - full CRUD on events, categories, ticket code imports, user moderation/reports)

### Email OTP setup (Supabase Dashboard)
The login form sends and verifies a **6-digit code** (`signInWithOtp` +
`verifyOtp({ type: "email" })`). Two dashboard settings must agree with that flow; neither
lives in the repository, so a fresh project has to be configured once.

1. **Authentication → URL Configuration**
   - `Site URL`: `http://localhost:3000` during development, the public domain after deploy.
   - `Redirect URLs`: add `http://localhost:3000/**` (and the production equivalent).
   - A stale Site URL (for example an old LAN address such as `http://10.7.146.182:3000`)
     makes every link in the email unreachable.
2. **Authentication → Emails → Magic Link and Confirm signup**
   - Both templates ship with `{{ .ConfirmationURL }}` only, which is a link, not a code.
   - Add `{{ .Token }}` so the email carries the 6-digit code the form asks for. New
     addresses receive the "Confirm signup" template, existing ones the "Magic Link"
     template, so both need the change.
3. **Authentication → Providers → Email**
   - "Email OTP Expiration" defaults to 3600 seconds; keep it between 5 and 60 minutes.
   - The built-in mailer is rate limited to a few messages per hour and often lands in
     spam. Configure custom SMTP (with SPF/DKIM) before launch.

Suggested "Magic Link" / "Confirm signup" body (user-facing copy, Persian):

```text
سلام،

کد ورود شما به مهر دانا:

{{ .Token }}

این کد چند دقیقه معتبر است. اگر شما درخواست ورود نداده‌اید، این ایمیل را نادیده بگیرید.

{{ .SiteURL }}/login
```


## 4. Database Schema (Supabase PostgreSQL)

### `profiles`
- `id` (uuid, PK, references `auth.users`)
- `full_name` (text)
- `avatar_url` (text)
- `bio` (text, short bio)
- `profession` (text, تخصص/شغل)
- `interests` (text[], array of tags e.g., ['روانشناسی', 'فلسفه', 'بیزنس', 'نوروساینس'])
- `social_links` (jsonb, e.g., `{instagram, linkedin, telegram, website}`)
- `role` (enum: `'user'`, `'speaker'`, `'admin'`, default `'user'`)
- `is_public` (boolean, default `true` - privacy toggle to hide profile from attendee lists)
- `created_at` (timestamptz)

### `categories`
- `id` (uuid, PK)
- `name` (text, e.g., روانشناسی، فلسفه، بیزنس، نوروساینس)
- `slug` (text, unique)

### `events`
- `id` (uuid, PK)
- `title` (text)
- `description` (text)
- `category_id` (uuid, FK -> `categories.id`)
- `speaker_id` (uuid, FK -> `profiles.id`)
- `status` (enum: `'upcoming'`, `'live'`, `'past'`)
- `event_date` (timestamptz)
- `location_address` (text, nullable for online-only)
- `skyroom_link` (text, visible ONLY to verified online/in-person ticket holders)
- `fidibo_url` (text, external redirect link for Iranian users)
- `price_in_person_irr` (numeric)
- `price_online_irr` (numeric)
- `price_in_person_usd` (numeric)
- `price_online_usd` (numeric)
- `recording_price_irr` (numeric, lower price for past event VOD)
- `recording_price_usd` (numeric)
- `recording_media_url` (text, protected audio/video URL for past events)
- `cover_image_url` (text)

### `tickets`
- `id` (uuid, PK)
- `user_id` (uuid, FK -> `profiles.id`)
- `event_id` (uuid, FK -> `events.id`)
- `ticket_type` (enum: `'in_person'`, `'online'`, `'recording_only'`)
- `payment_gateway` (enum: `'fidibo'`, `'stripe'`, `'paypal'`)
- `amount_paid` (numeric)
- `currency` (enum: `'IRR'`, `'USD'`)
- `external_ticket_code` (text, for Fidibo verification)
- `status` (enum: `'pending'`, `'verified'`, `'rejected'`)
- `created_at` (timestamptz)

### `valid_fidibo_codes` (Admin pre-uploaded codes for instant auto-verification)
- `id` (uuid, PK)
- `event_id` (uuid, FK -> `events.id`)
- `code` (text, unique)
- `ticket_type` (enum: `'in_person'`, `'online'`)
- `is_used` (boolean, default `false`)

### `event_messages` (Event Group Chat Rooms)
- `id` (uuid, PK)
- `event_id` (uuid, FK -> `events.id`)
- `sender_id` (uuid, FK -> `profiles.id`)
- `content` (text)
- `created_at` (timestamptz)
*Security Rule (RLS): Only users with a `verified` ticket for `event_id` (or `admin`/`speaker`) can read/insert messages.*

### `connections` (Friend Requests)
- `id` (uuid, PK)
- `requester_id` (uuid, FK -> `profiles.id`)
- `receiver_id` (uuid, FK -> `profiles.id`)
- `status` (enum: `'pending'`, `'accepted'`, `'rejected'`)
- `created_at` (timestamptz)

### `direct_messages` (1-on-1 Private Chat between accepted connections)
- `id` (uuid, PK)
- `connection_id` (uuid, FK -> `connections.id`)
- `sender_id` (uuid, FK -> `profiles.id`)
- `content` (text)
- `created_at` (timestamptz)

### `user_blocks` & `reports`
- `user_blocks`: `blocker_id`, `blocked_id`, `created_at`
- `reports`: `id`, `reporter_id`, `reported_user_id`, `message_id` (nullable), `reason` (text), `status` (enum: `'open'`, `'resolved'`), `created_at`

## 5. Key Features & Pages Breakdown
1. **Home & Events Explorer (`/`, `/events`):** Filter by status (Upcoming, Live, Past) and dynamic Categories.
2. **Event Details Page (`/events/[id]`):**
   - Public view: Info, speaker profile, ticket options (In-person vs Online, or Recording if past).
   - Purchase flow: Button to redirect to Fidibo + input box "ثبت کد بلیت فیدیبو" (Verify Fidibo Code), OR Stripe/PayPal checkout button for international users.
   - Ticket-holder unlocked view: Skyroom link (if live/upcoming), Video/Audio player (if past & purchased), **"ورود به اتاق گفتگو" (Enter Event Chat)** button, and **"شرکت‌کنندگان رویداد" (Attendees)** tab.
3. **Event Chat Room (`/events/[id]/chat`):** Real-time simple text chat (Supabase Realtime). Accessible pre-event, during, and post-event for ticket holders. Includes Report & Block actions on users.
4. **Attendee Directory & Networking (`/events/[id]/attendees`):** Lists attendees with `is_public = true`. Filterable by `interests`. Users can click a profile to view bio/profession/socials and send a Friend Request.
5. **User Dashboard & Profile (`/profile`, `/dashboard`):**
   - Edit profile (Name, Avatar, Bio, Profession, Interests, Social Links, `is_public` toggle).
   - Tabs: My Tickets/Events, Payment History, Friend Requests, Private Messages (DMs), Blocked Users.
6. **Admin Panel (`/admin`):**
   - Create/Edit Events & Categories.
   - Bulk upload CSV/list of valid Fidibo ticket codes per event (or manually approve pending Fidibo tickets).
   - View User Reports and ban/suspend abusive users.

## 6. Development Phases (Instructions for Claude Code)
Execute this project step-by-step. Do not build everything at once:
- **Phase 1:** Initialize Next.js + Tailwind (RTL, Vazirmatn font) + PWA setup + Supabase client & SQL schema migrations with Row Level Security (RLS).
- **Phase 2:** Authentication (Phone OTP + Email OTP) & User Profile management (including `is_public` privacy toggle & payment/event history).
- **Phase 3:** Event CRUD, Categories, Event Detail page, Skyroom/VOD access control, and Dual Payment flow (Fidibo code verification + Stripe integration).
- **Phase 4:** Real-time Event Chat Room (restricted to verified ticket holders) + Report & Block system.
- **Phase 5:** Attendee discovery with interest filters, Friend Request system, and 1-on-1 Direct Messaging.
- **Phase 6:** Admin Dashboard for event management, Fidibo code bulk-import, and report moderation.