export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type UploadSessionRow = {
  account_id: string;
  ar_item_id: string | null;
  asset_id: string | null;
  bytes_uploaded: number;
  completed_at: string | null;
  created_at: string;
  created_by: string;
  error_code: string | null;
  expires_at: string;
  group_id: string;
  id: string;
  idempotency_key: string;
  kind: string;
  metadata: Json;
  mime_type: string;
  original_file_name: string;
  project_id: string;
  size_bytes: number;
  status: Database["public"]["Enums"]["media_upload_status"];
  storage_bucket: string;
  storage_path: string;
  updated_at: string;
  version: number;
};

export type Database = {
  public: {
    Tables: {
      account_members: {
        Row: {
          accepted_at: string | null;
          account_id: string;
          created_at: string;
          id: string;
          invited_at: string;
          invited_by: string | null;
          is_active: boolean;
          permissions: Json;
          role: Database["public"]["Enums"]["member_role"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          accepted_at?: string | null;
          account_id: string;
          created_at?: string;
          id?: string;
          invited_at?: string;
          invited_by?: string | null;
          is_active?: boolean;
          permissions?: Json;
          role: Database["public"]["Enums"]["member_role"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          accepted_at?: string | null;
          account_id?: string;
          created_at?: string;
          id?: string;
          invited_at?: string;
          invited_by?: string | null;
          is_active?: boolean;
          permissions?: Json;
          role?: Database["public"]["Enums"]["member_role"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "account_members_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      accounts: {
        Row: {
          closed_at: string | null;
          created_at: string;
          id: string;
          logo_path: string | null;
          name: string;
          owner_user_id: string;
          settings: Json;
          slug: string;
          status: Database["public"]["Enums"]["account_status"];
          storage_used_bytes: number;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          closed_at?: string | null;
          created_at?: string;
          id?: string;
          logo_path?: string | null;
          name: string;
          owner_user_id: string;
          settings?: Json;
          slug: string;
          status?: Database["public"]["Enums"]["account_status"];
          storage_used_bytes?: number;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          closed_at?: string | null;
          created_at?: string;
          id?: string;
          logo_path?: string | null;
          name?: string;
          owner_user_id?: string;
          settings?: Json;
          slug?: string;
          status?: Database["public"]["Enums"]["account_status"];
          storage_used_bytes?: number;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ar_items: {
        Row: {
          account_id: string;
          audio_default: string;
          autoplay: boolean;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          description: string | null;
          expires_at: string | null;
          fallback_enabled: boolean;
          group_id: string;
          id: string;
          idempotency_key: string;
          loop_video: boolean;
          marker_asset_id: string | null;
          marker_height: number | null;
          marker_image_path: string | null;
          marker_lost_behavior: Database["public"]["Enums"]["marker_lost_behavior"];
          marker_preview_path: string | null;
          marker_quality_details: Json;
          marker_quality_overridden_at: string | null;
          marker_quality_overridden_by: string | null;
          marker_quality_override_reason: string | null;
          marker_quality_score: number | null;
          marker_width: number | null;
          project_id: string;
          public_slug: string;
          published_at: string | null;
          status: Database["public"]["Enums"]["ar_item_status"];
          title: string;
          tracking_dataset_path: string | null;
          tracking_status: Database["public"]["Enums"]["tracking_status"] | null;
          updated_at: string;
          version: number;
          video_asset_id: string | null;
          video_duration_seconds: number | null;
          video_path: string | null;
          video_thumbnail_path: string | null;
          visibility: Database["public"]["Enums"]["content_visibility"];
        };
        Insert: {
          account_id: string;
          audio_default?: string;
          autoplay?: boolean;
          created_at?: string;
          created_by: string;
          deleted_at?: string | null;
          description?: string | null;
          expires_at?: string | null;
          fallback_enabled?: boolean;
          group_id: string;
          id?: string;
          idempotency_key?: string;
          loop_video?: boolean;
          marker_asset_id?: string | null;
          marker_height?: number | null;
          marker_image_path?: string | null;
          marker_lost_behavior?: Database["public"]["Enums"]["marker_lost_behavior"];
          marker_preview_path?: string | null;
          marker_quality_details?: Json;
          marker_quality_overridden_at?: string | null;
          marker_quality_overridden_by?: string | null;
          marker_quality_override_reason?: string | null;
          marker_quality_score?: number | null;
          marker_width?: number | null;
          project_id: string;
          public_slug?: string;
          published_at?: string | null;
          status?: Database["public"]["Enums"]["ar_item_status"];
          title: string;
          tracking_dataset_path?: string | null;
          tracking_status?: Database["public"]["Enums"]["tracking_status"] | null;
          updated_at?: string;
          version?: number;
          video_asset_id?: string | null;
          video_duration_seconds?: number | null;
          video_path?: string | null;
          video_thumbnail_path?: string | null;
          visibility?: Database["public"]["Enums"]["content_visibility"];
        };
        Update: {
          account_id?: string;
          audio_default?: string;
          autoplay?: boolean;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          expires_at?: string | null;
          fallback_enabled?: boolean;
          group_id?: string;
          id?: string;
          idempotency_key?: string;
          loop_video?: boolean;
          marker_asset_id?: string | null;
          marker_height?: number | null;
          marker_image_path?: string | null;
          marker_lost_behavior?: Database["public"]["Enums"]["marker_lost_behavior"];
          marker_preview_path?: string | null;
          marker_quality_details?: Json;
          marker_quality_overridden_at?: string | null;
          marker_quality_overridden_by?: string | null;
          marker_quality_override_reason?: string | null;
          marker_quality_score?: number | null;
          marker_width?: number | null;
          project_id?: string;
          public_slug?: string;
          published_at?: string | null;
          status?: Database["public"]["Enums"]["ar_item_status"];
          title?: string;
          tracking_dataset_path?: string | null;
          tracking_status?: Database["public"]["Enums"]["tracking_status"] | null;
          updated_at?: string;
          version?: number;
          video_asset_id?: string | null;
          video_duration_seconds?: number | null;
          video_path?: string | null;
          video_thumbnail_path?: string | null;
          visibility?: Database["public"]["Enums"]["content_visibility"];
        };
        Relationships: [
          {
            foreignKeyName: "ar_items_group_project_account_fkey";
            columns: ["group_id", "project_id", "account_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id", "project_id", "account_id"];
          },
          {
            foreignKeyName: "ar_items_marker_asset_account_fkey";
            columns: ["marker_asset_id", "account_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id", "account_id"];
          },
          {
            foreignKeyName: "ar_items_video_asset_account_fkey";
            columns: ["video_asset_id", "account_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id", "account_id"];
          },
        ];
      };
      ar_view_sessions: {
        Row: {
          account_id: string;
          ar_item_id: string;
          browser_family: string | null;
          completed: boolean;
          country_code: string | null;
          device_type: string | null;
          duration_watched_seconds: number;
          ended_at: string | null;
          error_code: string | null;
          id: number;
          marker_detected_at: string | null;
          os_family: string | null;
          playback_started_at: string | null;
          referrer_domain: string | null;
          session_token_hash: string;
          started_at: string;
        };
        Insert: {
          account_id: string;
          ar_item_id: string;
          browser_family?: string | null;
          completed?: boolean;
          country_code?: string | null;
          device_type?: string | null;
          duration_watched_seconds?: number;
          ended_at?: string | null;
          error_code?: string | null;
          id?: never;
          marker_detected_at?: string | null;
          os_family?: string | null;
          playback_started_at?: string | null;
          referrer_domain?: string | null;
          session_token_hash: string;
          started_at?: string;
        };
        Update: {
          account_id?: string;
          ar_item_id?: string;
          browser_family?: string | null;
          completed?: boolean;
          country_code?: string | null;
          device_type?: string | null;
          duration_watched_seconds?: number;
          ended_at?: string | null;
          error_code?: string | null;
          id?: never;
          marker_detected_at?: string | null;
          os_family?: string | null;
          playback_started_at?: string | null;
          referrer_domain?: string | null;
          session_token_hash?: string;
          started_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ar_view_sessions_item_account_fkey";
            columns: ["ar_item_id", "account_id"];
            isOneToOne: false;
            referencedRelation: "ar_items";
            referencedColumns: ["id", "account_id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          account_id: string;
          action: string;
          actor_user_id: string | null;
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          id: number;
          metadata: Json;
        };
        Insert: {
          account_id: string;
          action: string;
          actor_user_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type: string;
          id?: never;
          metadata?: Json;
        };
        Update: {
          account_id?: string;
          action?: string;
          actor_user_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          id?: never;
          metadata?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      groups: {
        Row: {
          account_id: string;
          archived_at: string | null;
          cover_path: string | null;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          description: string | null;
          id: string;
          idempotency_key: string;
          name: string;
          project_id: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          account_id: string;
          archived_at?: string | null;
          cover_path?: string | null;
          created_at?: string;
          created_by: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          idempotency_key?: string;
          name: string;
          project_id: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          account_id?: string;
          archived_at?: string | null;
          cover_path?: string | null;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          idempotency_key?: string;
          name?: string;
          project_id?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "groups_project_account_fkey";
            columns: ["project_id", "account_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id", "account_id"];
          },
        ];
      };
      media_assets: {
        Row: {
          account_id: string;
          ar_item_id: string | null;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          group_id: string | null;
          id: string;
          kind: string;
          metadata: Json;
          mime_type: string;
          original_file_name: string | null;
          project_id: string | null;
          sha256: string | null;
          size_bytes: number;
          storage_bucket: string;
          storage_path: string;
          version: number;
        };
        Insert: {
          account_id: string;
          ar_item_id?: string | null;
          created_at?: string;
          created_by: string;
          deleted_at?: string | null;
          group_id?: string | null;
          id?: string;
          kind: string;
          metadata?: Json;
          mime_type: string;
          original_file_name?: string | null;
          project_id?: string | null;
          sha256?: string | null;
          size_bytes: number;
          storage_bucket: string;
          storage_path: string;
          version?: number;
        };
        Update: {
          account_id?: string;
          ar_item_id?: string | null;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          group_id?: string | null;
          id?: string;
          kind?: string;
          metadata?: Json;
          mime_type?: string;
          original_file_name?: string | null;
          project_id?: string | null;
          sha256?: string | null;
          size_bytes?: number;
          storage_bucket?: string;
          storage_path?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "media_assets_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_assets_group_project_account_fkey";
            columns: ["group_id", "project_id", "account_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id", "project_id", "account_id"];
          },
          {
            foreignKeyName: "media_assets_item_account_fkey";
            columns: ["ar_item_id", "account_id"];
            isOneToOne: false;
            referencedRelation: "ar_items";
            referencedColumns: ["id", "account_id"];
          },
          {
            foreignKeyName: "media_assets_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      processing_jobs: {
        Row: {
          account_id: string;
          ar_item_id: string;
          attempt_count: number;
          completed_at: string | null;
          created_at: string;
          dedupe_key: string;
          error_code: string | null;
          error_message: string | null;
          id: number;
          input_metadata: Json;
          locked_at: string | null;
          locked_by: string | null;
          max_attempts: number;
          output_metadata: Json;
          progress: number;
          started_at: string | null;
          status: Database["public"]["Enums"]["job_status"];
          type: Database["public"]["Enums"]["job_type"];
          updated_at: string;
        };
        Insert: {
          account_id: string;
          ar_item_id: string;
          attempt_count?: number;
          completed_at?: string | null;
          created_at?: string;
          dedupe_key: string;
          error_code?: string | null;
          error_message?: string | null;
          id?: never;
          input_metadata?: Json;
          locked_at?: string | null;
          locked_by?: string | null;
          max_attempts?: number;
          output_metadata?: Json;
          progress?: number;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["job_status"];
          type: Database["public"]["Enums"]["job_type"];
          updated_at?: string;
        };
        Update: {
          account_id?: string;
          ar_item_id?: string;
          attempt_count?: number;
          completed_at?: string | null;
          created_at?: string;
          dedupe_key?: string;
          error_code?: string | null;
          error_message?: string | null;
          id?: never;
          input_metadata?: Json;
          locked_at?: string | null;
          locked_by?: string | null;
          max_attempts?: number;
          output_metadata?: Json;
          progress?: number;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["job_status"];
          type?: Database["public"]["Enums"]["job_type"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "processing_jobs_item_account_fkey";
            columns: ["ar_item_id", "account_id"];
            isOneToOne: false;
            referencedRelation: "ar_items";
            referencedColumns: ["id", "account_id"];
          },
        ];
      };
      profiles: {
        Row: {
          account_id: string | null;
          avatar_path: string | null;
          created_at: string;
          email_display: string | null;
          full_name: string | null;
          id: string;
          is_active: boolean;
          last_login_at: string | null;
          role: Database["public"]["Enums"]["profile_role"];
          updated_at: string;
        };
        Insert: {
          account_id?: string | null;
          avatar_path?: string | null;
          created_at?: string;
          email_display?: string | null;
          full_name?: string | null;
          id: string;
          is_active?: boolean;
          last_login_at?: string | null;
          role?: Database["public"]["Enums"]["profile_role"];
          updated_at?: string;
        };
        Update: {
          account_id?: string | null;
          avatar_path?: string | null;
          created_at?: string;
          email_display?: string | null;
          full_name?: string | null;
          id?: string;
          is_active?: boolean;
          last_login_at?: string | null;
          role?: Database["public"]["Enums"]["profile_role"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          account_id: string;
          archived_at: string | null;
          category: Database["public"]["Enums"]["project_category"];
          cover_path: string | null;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          description: string | null;
          id: string;
          idempotency_key: string;
          name: string;
          sort_order: number;
          status: Database["public"]["Enums"]["project_status"];
          updated_at: string;
        };
        Insert: {
          account_id: string;
          archived_at?: string | null;
          category?: Database["public"]["Enums"]["project_category"];
          cover_path?: string | null;
          created_at?: string;
          created_by: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          idempotency_key?: string;
          name: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["project_status"];
          updated_at?: string;
        };
        Update: {
          account_id?: string;
          archived_at?: string | null;
          category?: Database["public"]["Enums"]["project_category"];
          cover_path?: string | null;
          created_at?: string;
          created_by?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          idempotency_key?: string;
          name?: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["project_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      qr_codes: {
        Row: {
          account_id: string;
          ar_item_id: string;
          created_at: string;
          id: string;
          png_path: string | null;
          public_url: string;
          style: Json;
          svg_path: string | null;
          updated_at: string;
          version: number;
        };
        Insert: {
          account_id: string;
          ar_item_id: string;
          created_at?: string;
          id?: string;
          png_path?: string | null;
          public_url: string;
          style?: Json;
          svg_path?: string | null;
          updated_at?: string;
          version?: number;
        };
        Update: {
          account_id?: string;
          ar_item_id?: string;
          created_at?: string;
          id?: string;
          png_path?: string | null;
          public_url?: string;
          style?: Json;
          svg_path?: string | null;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "qr_codes_item_account_fkey";
            columns: ["ar_item_id", "account_id"];
            isOneToOne: false;
            referencedRelation: "ar_items";
            referencedColumns: ["id", "account_id"];
          },
        ];
      };
      subscription_plans: {
        Row: {
          ar_item_limit: number | null;
          code: string;
          created_at: string;
          description: string | null;
          group_limit: number | null;
          id: string;
          is_active: boolean;
          max_video_size_bytes: number | null;
          name: string;
          project_limit: number | null;
          storage_limit_bytes: number | null;
          team_limit: number | null;
          updated_at: string;
          video_duration_limit_seconds: number | null;
        };
        Insert: {
          ar_item_limit?: number | null;
          code: string;
          created_at?: string;
          description?: string | null;
          group_limit?: number | null;
          id?: string;
          is_active?: boolean;
          max_video_size_bytes?: number | null;
          name: string;
          project_limit?: number | null;
          storage_limit_bytes?: number | null;
          team_limit?: number | null;
          updated_at?: string;
          video_duration_limit_seconds?: number | null;
        };
        Update: {
          ar_item_limit?: number | null;
          code?: string;
          created_at?: string;
          description?: string | null;
          group_limit?: number | null;
          id?: string;
          is_active?: boolean;
          max_video_size_bytes?: number | null;
          name?: string;
          project_limit?: number | null;
          storage_limit_bytes?: number | null;
          team_limit?: number | null;
          updated_at?: string;
          video_duration_limit_seconds?: number | null;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          account_id: string;
          created_at: string;
          custom_limits: Json;
          expires_at: string | null;
          grace_period_ends_at: string | null;
          id: string;
          plan_id: string;
          starts_at: string;
          status: Database["public"]["Enums"]["subscription_status"];
          updated_at: string;
        };
        Insert: {
          account_id: string;
          created_at?: string;
          custom_limits?: Json;
          expires_at?: string | null;
          grace_period_ends_at?: string | null;
          id?: string;
          plan_id: string;
          starts_at?: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          updated_at?: string;
        };
        Update: {
          account_id?: string;
          created_at?: string;
          custom_limits?: Json;
          expires_at?: string | null;
          grace_period_ends_at?: string | null;
          id?: string;
          plan_id?: string;
          starts_at?: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: true;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "subscription_plans";
            referencedColumns: ["id"];
          },
        ];
      };
      upload_sessions: {
        Row: UploadSessionRow;
        Insert: {
          account_id: string;
          ar_item_id?: string | null;
          asset_id?: string | null;
          bytes_uploaded?: number;
          completed_at?: string | null;
          created_at?: string;
          created_by: string;
          error_code?: string | null;
          expires_at?: string;
          group_id: string;
          id?: string;
          idempotency_key: string;
          kind: string;
          metadata?: Json;
          mime_type: string;
          original_file_name: string;
          project_id: string;
          size_bytes: number;
          status?: Database["public"]["Enums"]["media_upload_status"];
          storage_bucket: string;
          storage_path: string;
          updated_at?: string;
          version: number;
        };
        Update: Partial<UploadSessionRow>;
        Relationships: [
          {
            foreignKeyName: "upload_sessions_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "upload_sessions_asset_id_fkey";
            columns: ["asset_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "upload_sessions_group_project_account_fkey";
            columns: ["group_id", "project_id", "account_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id", "project_id", "account_id"];
          },
          {
            foreignKeyName: "upload_sessions_item_account_fkey";
            columns: ["ar_item_id", "account_id"];
            isOneToOne: false;
            referencedRelation: "ar_items";
            referencedColumns: ["id", "account_id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      abort_media_upload: {
        Args: { p_session_id: string };
        Returns: UploadSessionRow;
        SetofOptions: {
          from: "*";
          to: "upload_sessions";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      admin_create_account: {
        Args: {
          p_account_name: string;
          p_account_slug: string;
          p_custom_limits?: Json;
          p_owner_user_id: string;
          p_subscription_expires_at: string;
          p_subscription_grace_ends_at: string;
          p_subscription_plan_id: string;
          p_subscription_starts_at: string;
          p_subscription_status: Database["public"]["Enums"]["subscription_status"];
        };
        Returns: {
          closed_at: string | null;
          created_at: string;
          id: string;
          logo_path: string | null;
          name: string;
          owner_user_id: string;
          settings: Json;
          slug: string;
          status: Database["public"]["Enums"]["account_status"];
          storage_used_bytes: number;
          timezone: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "accounts";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      begin_media_upload: {
        Args: {
          p_kind: string;
          p_mime_type: string;
          p_original_file_name: string;
          p_request_id: string;
          p_size_bytes: number;
          p_target_account_id: string;
          p_target_group_id: string;
          p_target_project_id: string;
        };
        Returns: UploadSessionRow;
        SetofOptions: {
          from: "*";
          to: "upload_sessions";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      claim_processing_jobs: {
        Args: { p_limit?: number; p_worker_id: string };
        Returns: Database["public"]["Tables"]["processing_jobs"]["Row"][];
        SetofOptions: {
          from: "*";
          to: "processing_jobs";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      complete_processing_job: {
        Args: {
          p_job_id: number;
          p_output_metadata: Json;
          p_worker_id: string;
        };
        Returns: Database["public"]["Tables"]["processing_jobs"]["Row"];
        SetofOptions: {
          from: "*";
          to: "processing_jobs";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      complete_upload_cleanup: {
        Args: { p_session_ids: string[]; p_succeeded: boolean };
        Returns: number;
      };
      create_ar_item: {
        Args: {
          item_description: string;
          item_title: string;
          target_account_id: string;
          target_group_id: string;
          target_project_id: string;
        };
        Returns: Database["public"]["Tables"]["ar_items"]["Row"];
        SetofOptions: {
          from: "*";
          to: "ar_items";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      create_ar_item_draft: {
        Args: {
          p_description: string;
          p_request_id: string;
          p_target_account_id: string;
          p_target_group_id: string;
          p_target_project_id: string;
          p_title: string;
        };
        Returns: Database["public"]["Tables"]["ar_items"]["Row"];
        SetofOptions: {
          from: "*";
          to: "ar_items";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      create_group: {
        Args: {
          group_description: string;
          group_name: string;
          request_id: string;
          target_account_id: string;
          target_project_id: string;
        };
        Returns: {
          account_id: string;
          archived_at: string | null;
          cover_path: string | null;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          description: string | null;
          id: string;
          idempotency_key: string;
          name: string;
          project_id: string;
          sort_order: number;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "groups";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      create_project: {
        Args: {
          project_category: Database["public"]["Enums"]["project_category"];
          project_description: string;
          project_name: string;
          request_id: string;
          target_account_id: string;
        };
        Returns: {
          account_id: string;
          archived_at: string | null;
          category: Database["public"]["Enums"]["project_category"];
          cover_path: string | null;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          description: string | null;
          id: string;
          idempotency_key: string;
          name: string;
          sort_order: number;
          status: Database["public"]["Enums"]["project_status"];
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "projects";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      expire_stale_uploads: {
        Args: { p_limit?: number };
        Returns: UploadSessionRow[];
        SetofOptions: {
          from: "*";
          to: "upload_sessions";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      fail_media_upload: {
        Args: { p_error_code: string; p_session_id: string };
        Returns: UploadSessionRow;
        SetofOptions: {
          from: "*";
          to: "upload_sessions";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      fail_processing_job: {
        Args: { p_error_code: string; p_job_id: number; p_worker_id: string };
        Returns: Database["public"]["Tables"]["processing_jobs"]["Row"];
        SetofOptions: {
          from: "*";
          to: "processing_jobs";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      finalize_media_upload: {
        Args: { p_metadata: Json; p_session_id: string; p_sha256: string };
        Returns: Database["public"]["Tables"]["media_assets"]["Row"];
        SetofOptions: {
          from: "*";
          to: "media_assets";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      move_group: {
        Args: {
          p_destination_project_id: string;
          p_target_account_id: string;
          p_target_group_id: string;
        };
        Returns: {
          account_id: string;
          archived_at: string | null;
          cover_path: string | null;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          description: string | null;
          id: string;
          idempotency_key: string;
          name: string;
          project_id: string;
          sort_order: number;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "groups";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      override_marker_quality: {
        Args: {
          p_item_id: string;
          p_reason: string;
          p_target_account_id: string;
        };
        Returns: Database["public"]["Tables"]["ar_items"]["Row"];
        SetofOptions: {
          from: "*";
          to: "ar_items";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      prepare_ar_item_processing: {
        Args: {
          p_audio_default: string;
          p_autoplay: boolean;
          p_fallback_enabled: boolean;
          p_item_id: string;
          p_loop_video: boolean;
          p_marker_asset_id: string;
          p_marker_lost_behavior: Database["public"]["Enums"]["marker_lost_behavior"];
          p_target_account_id: string;
          p_video_asset_id: string;
        };
        Returns: Database["public"]["Tables"]["ar_items"]["Row"];
        SetofOptions: {
          from: "*";
          to: "ar_items";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      reorder_groups: {
        Args: {
          p_ordered_group_ids: string[];
          p_target_account_id: string;
          p_target_project_id: string;
        };
        Returns: {
          account_id: string;
          archived_at: string | null;
          cover_path: string | null;
          created_at: string;
          created_by: string;
          deleted_at: string | null;
          description: string | null;
          id: string;
          idempotency_key: string;
          name: string;
          project_id: string;
          sort_order: number;
          updated_at: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "groups";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      report_processing_progress: {
        Args: { p_job_id: number; p_progress: number; p_worker_id: string };
        Returns: Database["public"]["Tables"]["processing_jobs"]["Row"];
        SetofOptions: {
          from: "*";
          to: "processing_jobs";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      retry_ar_item_processing: {
        Args: { p_item_id: string; p_target_account_id: string };
        Returns: Database["public"]["Tables"]["processing_jobs"]["Row"][];
        SetofOptions: {
          from: "*";
          to: "processing_jobs";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      start_media_upload: {
        Args: { p_session_id: string };
        Returns: UploadSessionRow;
        SetofOptions: {
          from: "*";
          to: "upload_sessions";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
    };
    Enums: {
      account_status: "active" | "suspended" | "closed";
      ar_event_type:
        | "page_open"
        | "camera_started"
        | "marker_detected"
        | "playback_started"
        | "progress_25"
        | "progress_50"
        | "progress_75"
        | "completed"
        | "error";
      ar_item_status: "draft" | "processing" | "ready" | "published" | "failed" | "suspended" | "archived";
      content_visibility: "private" | "public";
      job_status: "queued" | "running" | "succeeded" | "failed" | "cancelled";
      job_type:
        | "marker_analysis"
        | "marker_compilation"
        | "video_inspection"
        | "video_transcode"
        | "thumbnail_generation"
        | "qr_generation"
        | "storage_cleanup";
      marker_lost_behavior: "pause_hide" | "continue_audio_hide" | "stop_reset";
      media_upload_status: "pending" | "uploading" | "failed" | "finalized" | "aborted" | "expired";
      member_role: "owner" | "manager" | "editor" | "viewer";
      profile_role: "superadmin" | "account_user";
      project_category:
        "graduation" | "wedding" | "family" | "birthday" | "travel" | "advertising" | "museum" | "other";
      project_status: "draft" | "active" | "archived";
      subscription_status: "trial" | "active" | "grace_period" | "expired" | "suspended" | "cancelled";
      tracking_status: "uploaded" | "analyzing" | "unsuitable" | "compiling" | "ready" | "failed";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      account_status: ["active", "suspended", "closed"],
      ar_event_type: [
        "page_open",
        "camera_started",
        "marker_detected",
        "playback_started",
        "progress_25",
        "progress_50",
        "progress_75",
        "completed",
        "error",
      ],
      ar_item_status: ["draft", "processing", "ready", "published", "failed", "suspended", "archived"],
      content_visibility: ["private", "public"],
      job_status: ["queued", "running", "succeeded", "failed", "cancelled"],
      job_type: [
        "marker_analysis",
        "marker_compilation",
        "video_inspection",
        "video_transcode",
        "thumbnail_generation",
        "qr_generation",
        "storage_cleanup",
      ],
      marker_lost_behavior: ["pause_hide", "continue_audio_hide", "stop_reset"],
      media_upload_status: ["pending", "uploading", "failed", "finalized", "aborted", "expired"],
      member_role: ["owner", "manager", "editor", "viewer"],
      profile_role: ["superadmin", "account_user"],
      project_category: ["graduation", "wedding", "family", "birthday", "travel", "advertising", "museum", "other"],
      project_status: ["draft", "active", "archived"],
      subscription_status: ["trial", "active", "grace_period", "expired", "suspended", "cancelled"],
      tracking_status: ["uploaded", "analyzing", "unsuitable", "compiling", "ready", "failed"],
    },
  },
} as const;
