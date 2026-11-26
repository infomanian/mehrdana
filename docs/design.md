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

The public homepage follows a warm, print-inspired editorial style. The paper
tokens and the brand action colours both live here; see `src/app/globals.css`
for the token source of truth.

| Token | Value | Use |
| --- | --- | --- |
| `cream` / `cream-deep` / `sand` | `#F4EBDC` / `#ECE0CC` / `#E4D5BB` | Page background, alternating sections, artwork fills |
| `sage` | `#DCE3D2` | Calm accent section |
| `navy` / `navy-soft` | `#06253E` / `#0B3352` | Headings, dark sections, primary text (brand ink from the logo) |
| `teal` / `teal-strong` / `teal-deep` | `#00A69C` / `#007B73` / `#00605A` | Primary actions, verified badges, links (brand teal from the logo) |
| `gold` / `gold-strong` | `#C29B58` / `#8A6A32` | Accents, badges, underline highlights (brand gold from the logo) |
| `accent` | `#C8452F` | Errors and pending review states |

- **Type:** `font-display` (Noto Naskh Arabic) for headings and the wordmark;
  Vazirmatn for body and UI. Both fonts are self-hosted via Fontsource.
- **Layout:** wide asymmetrical grids, hairline rules, small numbered eyebrows
  (`۰۱ — درباره باشگاه`), generous vertical spacing and few rounded corners.
- **No stock photography:** artwork is drawn with CSS layers
  (`src/components/home/art.tsx`) so nothing is borrowed and the page stays light.
  Real event photos can replace those blocks without changing the layout.

## Brand Palette Source

The authoritative palette lives in `docs/palette/` (`colors.jpg`,
`logo-06.svg`). The SVG logo uses `navy #06253E` and `teal #00A69C`, which are
mapped onto the design tokens above (`navy`, `teal`, `gold`) for the rest of the
site. The lockup also carries the wordmark «مهر دانا» and the tagline
«هر نفر دانا، با هم مهربان», which is stored in `siteConfig.tagline`; the
header renders the emblem alone plus real text so the tagline stays legible.
