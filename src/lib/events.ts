import "server-only";

import { cache } from "react";

import { getServerClient, type ServerClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";
import type { EventStatus, TicketStatus, TicketType } from "@/types/database";

export const EVENT_PAGE_SIZE = 24;

export type EventCategorySummary = {
  name: string;
  slug: string;
};

export type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

export type EventSpeakerSummary = {
  full_name: string | null;
  avatar_url: string | null;
  profession: string | null;
};

export type EventCardRow = {
  id: string;
  title: string;
  status: EventStatus;
  event_date: string;
  location_address: string | null;
  cover_image_url: string | null;
  fidibo_url: string | null;
  price_in_person_irr: number | null;
  price_online_irr: number | null;
  price_in_person_usd: number | null;
  price_online_usd: number | null;
  recording_price_irr: number | null;
  recording_price_usd: number | null;
  categories: EventCategorySummary | null;
  profiles: EventSpeakerSummary | null;
};

export type EventDetailRow = EventCardRow & {
  description: string | null;
  category_id: string | null;
  speaker_id: string | null;
  created_at: string;
  updated_at: string;
};

export type EventShellRow = {
  id: string;
  title: string;
  status: EventStatus;
  event_date: string;
  cover_image_url: string | null;
};

export type OwnTicketRow = {
  ticket_type: TicketType;
  status: TicketStatus;
  created_at: string;
};

export type EventAccessLinks = {
  skyroom_link: string | null;
  recording_media_url: string | null;
};

const CARD_FIELDS = [
  "id",
  "title",
  "status",
  "event_date",
  "location_address",
  "cover_image_url",
  "fidibo_url",
  "price_in_person_irr",
  "price_online_irr",
  "price_in_person_usd",
  "price_online_usd",
  "recording_price_irr",
  "recording_price_usd",
].join(", ");

const CARD_RELATIONS = "categories(name, slug), profiles(full_name, avatar_url, profession)";

const DETAIL_FIELDS = [
  CARD_FIELDS,
  "description",
  "category_id",
  "speaker_id",
  "created_at",
  "updated_at",
].join(", ");

export function isEventId(value: string): boolean {
  return isUuid(value);
}

export type EventListFilter = {
  status: "upcoming" | "past";
  categorySlug?: string;
  page: number;
};

export async function listEvents(
  supabase: ServerClient,
  filter: EventListFilter,
): Promise<{ items: EventCardRow[]; hasNext: boolean }> {
  const from = (filter.page - 1) * EVENT_PAGE_SIZE;
  const relations = filter.categorySlug
    ? CARD_RELATIONS.replace("categories(", "categories!inner(")
    : CARD_RELATIONS;

  let query = supabase
    .from("events")
    .select(`${CARD_FIELDS}, ${relations}`)
    .order("event_date", { ascending: filter.status !== "past" })
    .range(from, from + EVENT_PAGE_SIZE);

  if (filter.status === "past") {
    query = query.eq("status", "past");
  } else {
    query = query.in("status", ["upcoming", "live"]);
  }

  if (filter.categorySlug) {
    query = query.eq("categories.slug", filter.categorySlug);
  }

  const { data, error } = await query;
  if (error) throw new Error("events-unavailable");

  const rows = (data ?? []) as unknown as EventCardRow[];
  return {
    items: rows.slice(0, EVENT_PAGE_SIZE),
    hasNext: rows.length > EVENT_PAGE_SIZE,
  };
}

export const listCategories = cache(async (): Promise<CategoryOption[]> => {
  const supabase = await getServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");

  if (error) throw new Error("categories-unavailable");
  return data ?? [];
});

export const listSpeakers = cache(
  async (): Promise<
    { id: string; full_name: string | null; avatar_url: string | null; profession: string | null }[]
  > => {
    const supabase = await getServerClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, profession")
      .eq("role", "speaker")
      .order("full_name");

    if (error) throw new Error("speakers-unavailable");
    return data ?? [];
  },
);

export const getEventDetail = cache(async (id: string): Promise<EventDetailRow | null> => {
  const supabase = await getServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("events")
    .select(`${DETAIL_FIELDS}, ${CARD_RELATIONS}`)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error("event-unavailable");
  return (data as unknown as EventDetailRow | null) ?? null;
});

export const getEventShell = cache(async (id: string): Promise<EventShellRow | null> => {
  const supabase = await getServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("events")
    .select("id, title, status, event_date, cover_image_url")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error("event-unavailable");
  return data ?? null;
});

export async function getMyEventTickets(
  supabase: ServerClient,
  userId: string,
  eventId: string,
): Promise<OwnTicketRow[]> {
  const { data, error } = await supabase
    .from("tickets")
    .select("ticket_type, status, created_at")
    .eq("user_id", userId)
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  // A failed ticket lookup must never unlock anything, but it should not break
  // the public event page either; the access panel simply stays locked.
  if (error) return [];
  return (data ?? []) as unknown as OwnTicketRow[];
}

/**
 * Returns the protected links only when the database grants access (verified
 * ticket, event speaker or admin). Any error is treated as "no access".
 */
export async function getEventAccess(
  supabase: ServerClient,
  eventId: string,
): Promise<EventAccessLinks | null> {
  const { data, error } = await supabase.rpc("get_event_access", {
    p_event_id: eventId,
  });

  if (error || !data || data.length === 0) return null;

  const row = data[0];
  return {
    skyroom_link: row.skyroom_link,
    recording_media_url: row.recording_media_url,
  };
}
