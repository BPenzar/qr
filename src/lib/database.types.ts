export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          plan_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id: string;
          plan_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string;
          plan_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      account_members: {
        Row: {
          id: string;
          account_id: string;
          user_id: string;
          role: "owner" | "admin" | "analyst";
          invited_at: string;
          accepted_at: string | null;
        };
        Insert: {
          id?: string;
          account_id: string;
          user_id: string;
          role?: "owner" | "admin" | "analyst";
          invited_at?: string;
          accepted_at?: string | null;
        };
        Update: {
          id?: string;
          account_id?: string;
          user_id?: string;
          role?: "owner" | "admin" | "analyst";
          invited_at?: string;
          accepted_at?: string | null;
        };
      };
      plans: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          monthly_price_cents: number;
          yearly_price_cents: number | null;
          limits: Json;
          is_default: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          monthly_price_cents?: number;
          yearly_price_cents?: number | null;
          limits?: Json;
          is_default?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          monthly_price_cents?: number;
          yearly_price_cents?: number | null;
          limits?: Json;
          is_default?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          account_id: string;
          name: string;
          description: string | null;
          is_archived: boolean;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          name: string;
          description?: string | null;
          is_archived?: boolean;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          name?: string;
          description?: string | null;
          is_archived?: boolean;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      forms: {
        Row: {
          id: string;
          account_id: string;
          project_id: string;
          name: string;
          description: string | null;
          channel: "qr" | "widget" | "link";
          status: "draft" | "published" | "paused" | "archived";
          thank_you_message: string | null;
          redirect_url: string | null;
          settings: Json;
          version: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          project_id: string;
          name: string;
          description?: string | null;
          channel?: "qr" | "widget" | "link";
          status?: "draft" | "published" | "paused" | "archived";
          thank_you_message?: string | null;
          redirect_url?: string | null;
          settings?: Json;
          version?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          project_id?: string;
          name?: string;
          description?: string | null;
          channel?: "qr" | "widget" | "link";
          status?: "draft" | "published" | "paused" | "archived";
          thank_you_message?: string | null;
          redirect_url?: string | null;
          settings?: Json;
          version?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      form_questions: {
        Row: {
          id: string;
          form_id: string;
          position: number;
          type:
            | "nps"
            | "rating"
            | "single_select"
            | "multi_select"
            | "short_text"
            | "long_text";
          label: string;
          description: string | null;
          placeholder: string | null;
          options: Json | null;
          is_required: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          form_id: string;
          position: number;
          type:
            | "nps"
            | "rating"
            | "single_select"
            | "multi_select"
            | "short_text"
            | "long_text";
          label: string;
          description?: string | null;
          placeholder?: string | null;
          options?: Json | null;
          is_required?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          form_id?: string;
          position?: number;
          type?:
            | "nps"
            | "rating"
            | "single_select"
            | "multi_select"
            | "short_text"
            | "long_text";
          label?: string;
          description?: string | null;
          placeholder?: string | null;
          options?: Json | null;
          is_required?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      form_qr_codes: {
        Row: {
          id: string;
          form_id: string;
          label: string;
          short_code: string;
          destination_url: string;
          scan_count: number;
          last_scanned_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          form_id: string;
          label: string;
          short_code: string;
          destination_url: string;
          scan_count?: number;
          last_scanned_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          form_id?: string;
          label?: string;
          short_code?: string;
          destination_url?: string;
          scan_count?: number;
          last_scanned_at?: string | null;
          created_at?: string;
        };
      };
      responses: {
        Row: {
          id: string;
          account_id: string;
          form_id: string;
          qr_code_id: string | null;
          link_id: string | null;
          submitted_at: string;
          channel: "qr" | "widget" | "link";
          location_name: string | null;
          attributes: Json;
          ip_hash: string | null;
          user_agent: string | null;
          sentiment: string | null;
          tags: string[] | null;
          rating: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          form_id: string;
          qr_code_id?: string | null;
          link_id?: string | null;
          submitted_at?: string;
          channel: "qr" | "widget" | "link";
          location_name?: string | null;
          attributes?: Json;
          ip_hash?: string | null;
          user_agent?: string | null;
          sentiment?: string | null;
          tags?: string[] | null;
          rating?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          form_id?: string;
          qr_code_id?: string | null;
          link_id?: string | null;
          submitted_at?: string;
          channel?: "qr" | "widget" | "link";
          location_name?: string | null;
          attributes?: Json;
          ip_hash?: string | null;
          user_agent?: string | null;
          sentiment?: string | null;
          tags?: string[] | null;
          rating?: number | null;
          created_at?: string;
        };
      };
      response_items: {
        Row: {
          id: string;
          response_id: string;
          question_id: string | null;
          value: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          response_id: string;
          question_id?: string | null;
          value: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          response_id?: string;
          question_id?: string | null;
          value?: Json;
          created_at?: string;
        };
      };
      usage_counters: {
        Row: {
          id: string;
          account_id: string;
          metric: string;
          period_start: string;
          period_end: string;
          value: number;
        };
        Insert: {
          id?: string;
          account_id: string;
          metric: string;
          period_start: string;
          period_end: string;
          value?: number;
        };
        Update: {
          id?: string;
          account_id?: string;
          metric?: string;
          period_start?: string;
          period_end?: string;
          value?: number;
        };
      };
    };
    Functions: {
      current_account_ids: {
        Args: Record<PropertyKey, never>;
        Returns: string[];
      };
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
