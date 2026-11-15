import type { Json } from "@/types/database";

/** Shared networking types (imported by server pages and client components). */

export type Attendee = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  profession: string | null;
  bio: string | null;
  interests: string[];
  social_links: Json;
  matched_interests: string[];
};

export type Conversation = {
  connection_id: string;
  other_id: string;
  other_name: string | null;
  other_avatar: string | null;
  other_profession: string | null;
  last_message: string | null;
  last_message_at: string | null;
};

export type IncomingRequest = {
  connection_id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  profession: string | null;
  created_at: string;
};

export type DmMessage = {
  id: string;
  connection_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_name: string | null;
  sender_avatar: string | null;
};

/** Connection state of a given user, as seen by the signed-in viewer. */
export type ConnectionState =
  | { kind: "none" }
  | { kind: "pending_sent" }
  | { kind: "pending_received"; connectionId: string }
  | { kind: "friends"; connectionId: string };
