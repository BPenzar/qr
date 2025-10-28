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
        Relationships: [
          {
            foreignKeyName: "accounts_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "accounts_plan_id_fkey";
            columns: ["plan_id"];
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "account_members_account_id_fkey";
            columns: ["account_id"];
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "account_members_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: "projects_account_id_fkey";
            columns: ["account_id"];
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "forms_account_id_fkey";
            columns: ["account_id"];
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "forms_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "form_questions_form_id_fkey";
            columns: ["form_id"];
            referencedRelation: "forms";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "form_qr_codes_form_id_fkey";
            columns: ["form_id"];
            referencedRelation: "forms";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "responses_account_id_fkey";
            columns: ["account_id"];
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "responses_form_id_fkey";
            columns: ["form_id"];
            referencedRelation: "forms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "responses_qr_code_id_fkey";
            columns: ["qr_code_id"];
            referencedRelation: "form_qr_codes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "responses_link_id_fkey";
            columns: ["link_id"];
            referencedRelation: "form_links";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "response_items_response_id_fkey";
            columns: ["response_id"];
            referencedRelation: "responses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "response_items_question_id_fkey";
            columns: ["question_id"];
            referencedRelation: "form_questions";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "usage_counters_account_id_fkey";
            columns: ["account_id"];
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_account_ids: {
        Args: Record<PropertyKey, never>;
        Returns: string[];
      };
    };
    Enums: {
      form_channel: "qr" | "widget" | "link";
      question_type:
        | "nps"
        | "rating"
        | "single_select"
        | "multi_select"
        | "short_text"
        | "long_text";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
