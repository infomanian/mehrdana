import { normalizeDigits, isUuid, type FieldErrors } from "@/lib/validation";
import { parseTehranDateTimeInput } from "@/lib/format";
import type { EventStatus } from "@/types/database";

const MAX_TOMAN = 99_999_999_999;
const MAX_USD = 99_999_999.99;
const MAX_URL_LENGTH = 1000;

export type EventWriteInput = {
  title: string;
  description: string | null;
  category_id: string | null;
  speaker_id: string | null;
  status: EventStatus;
  event_date: string;
  location_address: string | null;
  fidibo_url: string | null;
  price_in_person_irr: number | null;
  price_online_irr: number | null;
  price_in_person_usd: number | null;
  price_online_usd: number | null;
  recording_price_irr: number | null;
  recording_price_usd: number | null;
};

export type EventAccessInput = {
  skyroom_link: string | null;
  recording_media_url: string | null;
};

function text(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

function optionalText(
  value: FormDataEntryValue | null,
  max: number,
  label: string,
  key: string,
  errors: FieldErrors,
): string | null {
  const trimmed = text(value);
  if (!trimmed) return null;
  if (trimmed.length > max) {
    errors[key] = `${label} حداکثر ${max} نویسه می‌تواند باشد.`;
    return null;
  }
  return trimmed;
}

function httpsUrl(
  value: FormDataEntryValue | null,
  label: string,
  key: string,
  errors: FieldErrors,
): string | null {
  const raw = text(value);
  if (!raw) return null;

  if (raw.length > MAX_URL_LENGTH) {
    errors[key] = `${label} بیش از حد طولانی است.`;
    return null;
  }

  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") {
      errors[key] = `${label} باید با https:// شروع شود.`;
      return null;
    }
    return url.toString();
  } catch {
    errors[key] = `${label} آدرس معتبری نیست.`;
    return null;
  }
}

/**
 * Reads a money input in Persian or English digits. Toman values are converted
 * to the Rial amounts stored by the database; USD keeps two decimals.
 */
function money(
  value: FormDataEntryValue | null,
  {
    label,
    key,
    errors,
    max,
    scale = 1,
    decimals = false,
  }: {
    label: string;
    key: string;
    errors: FieldErrors;
    max: number;
    scale?: number;
    decimals?: boolean;
  },
): number | null {
  const raw = normalizeDigits(text(value))
    .replace(/[,\u066c\s]/g, "")
    .replace(/\u066b/g, ".");

  if (!raw) return null;

  const pattern = decimals ? /^\d+(\.\d{1,2})?$/ : /^\d+$/;
  if (!pattern.test(raw)) {
    errors[key] = decimals
      ? `${label} باید عدد باشد (حداکثر دو رقم اعشار).`
      : `${label} باید عدد صحیح باشد.`;
    return null;
  }

  const numeric = Number(raw);
  if (!Number.isFinite(numeric) || numeric > max) {
    errors[key] = `${label} بیش از حد مجاز است.`;
    return null;
  }

  return decimals
    ? Math.round(numeric * 100) / 100
    : Math.round(numeric * scale);
}

export function parseEventForm(formData: FormData): {
  data: EventWriteInput | null;
  errors: FieldErrors;
} {
  const errors: FieldErrors = {};

  const title = text(formData.get("title"));
  if (title.length < 3 || title.length > 160) {
    errors.title = "عنوان رویداد باید بین ۳ تا ۱۶۰ نویسه باشد.";
  }

  const description = optionalText(
    formData.get("description"),
    20_000,
    "توضیحات رویداد",
    "description",
    errors,
  );
  const location = optionalText(
    formData.get("location_address"),
    300,
    "نشانی محل برگزاری",
    "location_address",
    errors,
  );

  const categoryId = text(formData.get("category_id"));
  if (categoryId && !isUuid(categoryId)) {
    errors.category_id = "دسته‌بندی انتخاب‌شده معتبر نیست.";
  }

  const speakerId = text(formData.get("speaker_id"));
  if (speakerId && !isUuid(speakerId)) {
    errors.speaker_id = "سخنران انتخاب‌شده معتبر نیست.";
  }

  const statusRaw = text(formData.get("status"));
  const status: EventStatus =
    statusRaw === "live" || statusRaw === "past" ? statusRaw : "upcoming";

  const dateInput = text(formData.get("event_date"));
  let eventDate: Date | null = null;
  if (!dateInput) {
    errors.event_date = "تاریخ و ساعت رویداد را وارد کنید.";
  } else {
    eventDate = parseTehranDateTimeInput(dateInput);
    if (!eventDate) errors.event_date = "تاریخ یا ساعت واردشده معتبر نیست.";
  }

  const fidiboUrl = httpsUrl(formData.get("fidibo_url"), "لینک فیدیبو", "fidibo_url", errors);

  const priceInPersonIrr = money(formData.get("price_in_person_toman"), {
    label: "قیمت حضوری (تومان)",
    key: "price_in_person_toman",
    errors,
    max: MAX_TOMAN,
    scale: 10,
  });
  const priceOnlineIrr = money(formData.get("price_online_toman"), {
    label: "قیمت آنلاین (تومان)",
    key: "price_online_toman",
    errors,
    max: MAX_TOMAN,
    scale: 10,
  });
  const recordingPriceIrr = money(formData.get("recording_price_toman"), {
    label: "قیمت ضبط (تومان)",
    key: "recording_price_toman",
    errors,
    max: MAX_TOMAN,
    scale: 10,
  });

  const priceInPersonUsd = money(formData.get("price_in_person_usd"), {
    label: "قیمت حضوری (دلار)",
    key: "price_in_person_usd",
    errors,
    max: MAX_USD,
    decimals: true,
  });
  const priceOnlineUsd = money(formData.get("price_online_usd"), {
    label: "قیمت آنلاین (دلار)",
    key: "price_online_usd",
    errors,
    max: MAX_USD,
    decimals: true,
  });
  const recordingPriceUsd = money(formData.get("recording_price_usd"), {
    label: "قیمت ضبط (دلار)",
    key: "recording_price_usd",
    errors,
    max: MAX_USD,
    decimals: true,
  });

  if (Object.keys(errors).length > 0 || !eventDate) {
    return { data: null, errors };
  }

  return {
    data: {
      title,
      description,
      category_id: categoryId || null,
      speaker_id: speakerId || null,
      status,
      event_date: eventDate.toISOString(),
      location_address: location,
      fidibo_url: fidiboUrl,
      price_in_person_irr: priceInPersonIrr,
      price_online_irr: priceOnlineIrr,
      price_in_person_usd: priceInPersonUsd,
      price_online_usd: priceOnlineUsd,
      recording_price_irr: recordingPriceIrr,
      recording_price_usd: recordingPriceUsd,
    },
    errors,
  };
}

export function parseEventAccessForm(formData: FormData): {
  data: EventAccessInput | null;
  errors: FieldErrors;
} {
  const errors: FieldErrors = {};

  const skyroom = httpsUrl(
    formData.get("skyroom_link"),
    "لینک اسکایروم",
    "skyroom_link",
    errors,
  );
  const recording = httpsUrl(
    formData.get("recording_media_url"),
    "لینک ویدیوی ضبط‌شده",
    "recording_media_url",
    errors,
  );

  if (Object.keys(errors).length > 0) return { data: null, errors };

  return {
    data: { skyroom_link: skyroom, recording_media_url: recording },
    errors,
  };
}

export function formUuid(formData: FormData, key: string): string | null {
  const value = text(formData.get(key));
  return isUuid(value) ? value : null;
}

/** Only the exact files the uploader writes are accepted by the server action. */
export function isEventCoverPath(eventId: string, path: string): boolean {
  return (
    path === `${eventId}/cover.jpg` ||
    path === `${eventId}/cover.png` ||
    path === `${eventId}/cover.webp`
  );
}
