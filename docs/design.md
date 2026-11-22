## UI/UX Design System (Inspired by InterNations)
Design the interface following the clean, trustworthy, community-first aesthetic of **InterNations**, adapted natively for Persian (RTL):

- **Color Palette & Mood:**
  - **Primary:** Deep Navy / Slate Blue (`#1B365D` or `#0F294A`) for headers, primary navigation, and trust elements.
  - **Accent / CTA:** Warm Coral / Terracotta (`#E85D4A` or `#F26444`) for primary action buttons ("خرید بلیت", "ارسال درخواست دوستی", "ورود به اتاق گفتگو").
  - **Secondary / Tag Highlights:** Soft Teal (`#2A9D8F`) for verified badges, "Live" indicators, and shared interest tags.
  - **Backgrounds:** Clean off-white / light warm gray (`#F7F8FA`) for page canvas, with crisp white (`#FFFFFF`) elevated cards and subtle borders (`#E5E7EB`).

- **Key UI Components & Patterns (InterNations Style):**
  1. **Community Event Cards:** Display cover image (16:9), status badge (حضوری / آنلاین / ضبط‌شده), category pill, date/time, speaker mini-avatar, and a **"Facepile" (overlapping circular avatars of 3-5 attendees + "+N نفر شرکت می‌کنند")** to emphasize social proof and community.
  2. **Tabbed Event Hub (`/events/[id]`):** Structure the event page like InterNations with a clean sticky sub-navigation bar containing tabs:
     - `توضیحات رویداد` (Overview, Speaker bio, Ticketing/Skyroom/VOD box)
     - `شرکت‌کنندگان` (Attendees grid with interest filter pills)
     - `اتاق گفتگو` (Real-time chat room)
  3. **Networking Member Cards (`/events/[id]/attendees`):** Clean grid cards featuring a centered circular avatar, Full Name, Profession/Headline, up to 3 Interest Pills (highlight interests that match the current user's profile), and a direct **"درخواست دوستی" (Connect)** action button.
  4. **Navigation Architecture:**
     - **Desktop:** Clean top header with Logo, Search/Explore Events, My Events, Messages/Connections icon (with unread badge), and User Avatar dropdown.
     - **Mobile / PWA:** Native-feeling fixed **Bottom Navigation Bar** (`رویدادها`, `رویدادهای من`, `پیام‌ها`, `پروفایل`) for one-handed use.
  5. **Typography & Spacing:** Use `Vazirmatn` font with generous whitespace, clear hierarchy, rounded corners (`rounded-xl` for cards, `rounded-full` for avatars and filter pills), and soft shadows.

## Homepage Art Direction (Warm Editorial)

The public homepage follows a warm, print-inspired editorial style. These tokens
live in `src/app/globals.css` and are the reference for any new public page:

| Token | Value | Use |
| --- | --- | --- |
| `cream` | `#F4EBDC` | Page background and light text on dark |
| `cream-deep` / `sand` | `#ECE0CC` / `#E4D5BB` | Alternating section and artwork fills |
| `sage` | `#DCE3D2` | Calm accent section |
| `charcoal` | `#1F1913` | Primary text, dark sections, footer |
| `clay` | `#B5452C` | Actions, links on hover, small accents |
| `rule` | `#D9CBB4` | Hairline dividers |

- **Type:** `font-display` (Noto Naskh Arabic) for headings and the wordmark;
  Vazirmatn for body and UI. Both fonts are self-hosted via Fontsource.
- **Layout:** wide asymmetrical grids, hairline rules, small numbered eyebrows
  (`۰۱ — درباره باشگاه`), generous vertical spacing and few rounded corners.
- **No stock photography:** artwork is drawn with CSS layers
  (`src/components/home/art.tsx`) so nothing is borrowed and the page stays light.
  Real event photos can replace those blocks without changing the layout.
