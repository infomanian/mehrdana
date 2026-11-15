/**
 * Server-side input validation and normalisation.
 *
 * Every rule here mirrors a database constraint (see supabase/migrations) so a
 * malformed value produces a friendly Persian message instead of a raw
 * PostgreSQL error. Values are never truncated silently.
 */

export type FieldErrors = Partial<Record<string, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Persian (۰-۹) and Arabic-Indic (٠-٩) digits to ASCII. */
export function normalizeDigits(value: string): string {
  return value
    .replace(/[\u06f0-\u06f9]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 0x0660));
}

export function normalizeEmail(value: FormDataEntryValue | null): string {
  return normalizeDigits(String(value ?? ""))
    .trim()
    .toLowerCase();
}

export function validateEmail(email: string): string | null {
  if (!email) return "ایمیل را وارد کنید.";
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return "ایمیل معتبر نیست. نمونه: name@example.com";
  }
  return null;
}

/** Keeps only ASCII digits so "۱۲۳۴۵۶" and "123 456" both work. */
export function normalizeOtp(value: FormDataEntryValue | null): string {
  return normalizeDigits(String(value ?? "")).replace(/\D/g, "");
}

export function validateOtp(code: string): string | null {
  if (!code) return "کد ارسال‌شده را وارد کنید.";
  if (!/^\d{6}$/.test(code)) return "کد باید ۶ رقم باشد.";
  return null;
}

/**
 * Only same-site paths are allowed as a post-login destination.
 * Blocks "//evil.com", "/\evil.com" and control characters, which browsers may
 * interpret as an external host (open redirect).
 */
export function safeNextPath(value: unknown): string {
  const fallback = "/profile";
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  if (/[\u0000-\u001f\u007f\\]/.test(raw)) return fallback;
  // Sending a signed-in user back to the login page would loop forever.
  if (raw === "/login" || raw.startsWith("/login?") || raw.startsWith("/login/")) {
    return fallback;
  }
  return raw;
}

// ---------------------------------------------------------------------------
// Profile form
// ---------------------------------------------------------------------------

export type SocialLinks = {
  instagram?: string;
  linkedin?: string;
  telegram?: string;
  website?: string;
};

export type ProfileInput = {
  full_name: string | null;
  profession: string | null;
  bio: string | null;
  interests: string[];
  social_links: SocialLinks;
};

const MAX_INTERESTS = 10;

function text(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

function optionalText(
  value: FormDataEntryValue | null,
  max: number,
  label: string,
  errors: FieldErrors,
  key: string,
): string | null {
  const trimmed = text(value);
  if (!trimmed) return null;
  if (trimmed.length > max) {
    errors[key] = `${label} حداکثر ${max} نویسه می‌تواند باشد.`;
    return null;
  }
  return trimmed;
}

/** Accepts "@name", "name" or a full profile URL and stores a plain handle/URL. */
function normalizeHandle(value: FormDataEntryValue | null): string {
  return text(value).replace(/^@+/, "");
}

function normalizeWebsite(value: FormDataEntryValue | null): string {
  const raw = text(value);
  if (!raw) return "";
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withScheme;
}

export function parseProfileForm(formData: FormData): {
  data: ProfileInput;
  errors: FieldErrors;
} {
  const errors: FieldErrors = {};

  const fullName = optionalText(formData.get("full_name"), 80, "نام و نام خانوادگی", errors, "full_name");
  const profession = optionalText(formData.get("profession"), 80, "تخصص یا شغل", errors, "profession");
  const bio = optionalText(formData.get("bio"), 600, "درباره من", errors, "bio");

  const rawInterests = formData
    .getAll("interests")
    .map((item) => text(item))
    .filter(Boolean);

  const interests = Array.from(new Set(rawInterests));
  if (interests.length > MAX_INTERESTS) {
    errors.interests = `حداکثر ${MAX_INTERESTS} علاقه‌مندی می‌توانید انتخاب کنید.`;
  }
  for (const interest of interests) {
    if (interest.length > 40) {
      errors.interests = "هر علاقه‌مندی حداکثر ۴۰ نویسه می‌تواند باشد.";
      break;
    }
  }

  const instagram = normalizeHandle(formData.get("instagram"));
  const telegram = normalizeHandle(formData.get("telegram"));
  const linkedin = normalizeHandle(formData.get("linkedin"));
  const website = normalizeWebsite(formData.get("website"));

  for (const [key, value, label] of [
    ["instagram", instagram, "اینستاگرام"],
    ["telegram", telegram, "تلگرام"],
    ["linkedin", linkedin, "لینکدین"],
    ["website", website, "وب‌سایت"],
  ] as const) {
    if (value.length > 200) errors[key] = `${label} حداکثر ۲۰۰ نویسه می‌تواند باشد.`;
  }

  if (website && !errors.website) {
    try {
      const url = new URL(website);
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        errors.website = "آدرس وب‌سایت باید با http یا https شروع شود.";
      }
    } catch {
      errors.website = "آدرس وب‌سایت معتبر نیست.";
    }
  }

  const socialLinks: SocialLinks = {};
  if (instagram && !errors.instagram) socialLinks.instagram = instagram;
  if (telegram && !errors.telegram) socialLinks.telegram = telegram;
  if (linkedin && !errors.linkedin) socialLinks.linkedin = linkedin;
  if (website && !errors.website) socialLinks.website = website;

  return {
    data: {
      full_name: fullName,
      profession,
      bio,
      interests,
      social_links: socialLinks,
    },
    errors,
  };
}
