/**
 * Hand-written Supabase types that mirror supabase/migrations.
 * Regenerate with the Supabase CLI once a live project is connected:
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "user" | "speaker" | "admin";
export type EventStatus = "upcoming" | "live" | "past";
export type TicketType = "in_person" | "online" | "recording_only";
export type PaymentGateway = "fidibo" | "stripe" | "paypal";
export type CurrencyCode = "IRR" | "USD";
export type TicketStatus = "pending" | "verified" | "rejected";
export type ReportStatus = "open" | "resolved";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          profession: string | null;
          interests: string[];
          social_links: Json;
          role: UserRole;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          profession?: string | null;
          interests?: string[];
          social_links?: Json;
          role?: UserRole;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          profession?: string | null;
          interests?: string[];
          social_links?: Json;
          role?: UserRole;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
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
          cover_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category_id?: string | null;
          speaker_id?: string | null;
          status?: EventStatus;
          event_date: string;
          location_address?: string | null;
          fidibo_url?: string | null;
          price_in_person_irr?: number | null;
          price_online_irr?: number | null;
          price_in_person_usd?: number | null;
          price_online_usd?: number | null;
          recording_price_irr?: number | null;
          recording_price_usd?: number | null;
          cover_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          category_id?: string | null;
          speaker_id?: string | null;
          status?: EventStatus;
          event_date?: string;
          location_address?: string | null;
          fidibo_url?: string | null;
          price_in_person_irr?: number | null;
          price_online_irr?: number | null;
          price_in_person_usd?: number | null;
          price_online_usd?: number | null;
          recording_price_irr?: number | null;
          recording_price_usd?: number | null;
          cover_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_speaker_id_fkey";
            columns: ["speaker_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      tickets: {
        Row: {
          id: string;
          user_id: string;
          event_id: string;
          ticket_type: TicketType;
          payment_gateway: PaymentGateway;
          amount_paid: number | null;
          currency: CurrencyCode;
          external_ticket_code: string | null;
          payment_reference: string | null;
          status: TicketStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_id: string;
          ticket_type: TicketType;
          payment_gateway: PaymentGateway;
          amount_paid?: number | null;
          currency: CurrencyCode;
          external_ticket_code?: string | null;
          payment_reference?: string | null;
          status?: TicketStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_id?: string;
          ticket_type?: TicketType;
          payment_gateway?: PaymentGateway;
          amount_paid?: number | null;
          currency?: CurrencyCode;
          external_ticket_code?: string | null;
          payment_reference?: string | null;
          status?: TicketStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tickets_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tickets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      valid_fidibo_codes: {
        Row: {
          id: string;
          event_id: string;
          code: string;
          ticket_type: TicketType;
          is_used: boolean;
          used_by: string | null;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          code: string;
          ticket_type: TicketType;
          is_used?: boolean;
          used_by?: string | null;
          used_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          code?: string;
          ticket_type?: TicketType;
          is_used?: boolean;
          used_by?: string | null;
          used_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "valid_fidibo_codes_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      event_messages: {
        Row: {
          id: string;
          event_id: string;
          sender_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          sender_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          sender_id?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_messages_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_blocks: {
        Row: {
          id: string;
          blocker_id: string;
          blocked_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          blocker_id: string;
          blocked_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          blocker_id?: string;
          blocked_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_user_id: string;
          message_id: string | null;
          reason: string;
          note: string | null;
          status: ReportStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reported_user_id: string;
          message_id?: string | null;
          reason: string;
          note?: string | null;
          status?: ReportStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          reported_user_id?: string;
          message_id?: string | null;
          reason?: string;
          note?: string | null;
          status?: ReportStatus;
          created_at?: string;
        };
        Relationships: [];
      };
      event_access: {
        Row: {
          event_id: string;
          skyroom_link: string | null;
          recording_media_url: string | null;
          updated_at: string;
        };
        Insert: {
          event_id: string;
          skyroom_link?: string | null;
          recording_media_url?: string | null;
          updated_at?: string;
        };
        Update: {
          event_id?: string;
          skyroom_link?: string | null;
          recording_media_url?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_access_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: true;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      has_event_access: {
        Args: { p_event_id: string };
        Returns: boolean;
      };
      get_event_access: {
        Args: { p_event_id: string };
        Returns: { skyroom_link: string | null; recording_media_url: string | null }[];
      };
      get_my_ticket_history: {
        Args: Record<string, never>;
        Returns: {
          ticket_id: string;
          event_id: string;
          event_title: string;
          event_date: string;
          cover_image_url: string | null;
          ticket_type: TicketType;
          status: TicketStatus;
          payment_gateway: PaymentGateway;
          amount_paid: number | null;
          currency: CurrencyCode;
          created_at: string;
        }[];
      };
      verify_fidibo_code: {
        Args: { p_event_id: string; p_code: string };
        Returns: {
          status: string;
          ticket_type: TicketType | null;
          ticket_id: string | null;
        }[];
      };
      get_event_messages: {
        Args: { p_event_id: string; p_before?: string | null; p_limit?: number };
        Returns: {
          id: string;
          event_id: string;
          sender_id: string;
          content: string;
          created_at: string;
          sender_name: string | null;
          sender_avatar: string | null;
        }[];
      };
      get_reports: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          reason: string;
          note: string | null;
          status: ReportStatus;
          created_at: string;
          reporter_name: string | null;
          reported_name: string | null;
          message_content: string | null;
          message_id: string | null;
          event_id: string | null;
          event_title: string | null;
        }[];
      };
    };
    Enums: {
      user_role: UserRole;
      event_status: EventStatus;
      ticket_type: TicketType;
      payment_gateway: PaymentGateway;
      currency_code: CurrencyCode;
      ticket_status: TicketStatus;
      report_status: ReportStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
