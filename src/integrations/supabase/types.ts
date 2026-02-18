export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_usage_logs: {
        Row: {
          created_at: string
          destination: string | null
          id: string
          regenerate_count: number | null
          status: string
          usage_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          destination?: string | null
          id?: string
          regenerate_count?: number | null
          status?: string
          usage_type?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          destination?: string | null
          id?: string
          regenerate_count?: number | null
          status?: string
          usage_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      itineraries: {
        Row: {
          content: Json
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          destination: string
          id: string
          is_published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          content?: Json
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          destination: string
          id?: string
          is_published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          destination?: string
          id?: string
          is_published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          scheduled_for: string | null
          title: string
          trip_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          scheduled_for?: string | null
          title: string
          trip_id?: string | null
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          scheduled_for?: string | null
          title?: string
          trip_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "saved_itineraries"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promo_code_uses: {
        Row: {
          amount_saved: number | null
          id: string
          promo_code_id: string | null
          trip_id: string | null
          used_at: string
          user_id: string
        }
        Insert: {
          amount_saved?: number | null
          id?: string
          promo_code_id?: string | null
          trip_id?: string | null
          used_at?: string
          user_id: string
        }
        Update: {
          amount_saved?: number | null
          id?: string
          promo_code_id?: string | null
          trip_id?: string | null
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_uses_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          min_cart_value: number | null
          new_users_only: boolean
          one_time_per_user: boolean
          uses_count: number
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_cart_value?: number | null
          new_users_only?: boolean
          one_time_per_user?: boolean
          uses_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_cart_value?: number | null
          new_users_only?: boolean
          one_time_per_user?: boolean
          uses_count?: number
        }
        Relationships: []
      }
      saved_itineraries: {
        Row: {
          created_at: string
          destination: string
          id: string
          itinerary_data: Json
          preferences: Json
          regenerate_count: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          destination: string
          id?: string
          itinerary_data?: Json
          preferences?: Json
          regenerate_count?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          destination?: string
          id?: string
          itinerary_data?: Json
          preferences?: Json
          regenerate_count?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shared_trips: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          shared_with_email: string
          shared_with_id: string | null
          trip_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id: string
          shared_with_email: string
          shared_with_id?: string | null
          trip_id: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          shared_with_email?: string
          shared_with_id?: string | null
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_trips_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "saved_itineraries"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          id: string
          page_key: string
          settings: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          page_key: string
          settings?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          page_key?: string
          settings?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      super_premium_access: {
        Row: {
          access_type: string
          expires_at: string | null
          granted_at: string
          granted_by: string
          id: string
          is_active: boolean
          notes: string | null
          revoked_at: string | null
          user_id: string
        }
        Insert: {
          access_type?: string
          expires_at?: string | null
          granted_at?: string
          granted_by: string
          id?: string
          is_active?: boolean
          notes?: string | null
          revoked_at?: string | null
          user_id: string
        }
        Update: {
          access_type?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          revoked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      trip_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          place_name: string | null
          storage_path: string
          trip_id: string | null
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          place_name?: string | null
          storage_path: string
          trip_id?: string | null
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          place_name?: string | null
          storage_path?: string
          trip_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_photos_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "saved_itineraries"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_preferences: {
        Row: {
          arrival_datetime: string
          arrival_place: string
          budget_max: number | null
          budget_min: number | null
          created_at: string
          departure_datetime: string
          departure_place: string
          food_preference: string
          id: string
          multi_city_stops: Json | null
          num_people: number
          selected_plan: string | null
          special_notes: string | null
          transport_mode: string
          travel_persona: string | null
          travel_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          arrival_datetime: string
          arrival_place: string
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          departure_datetime: string
          departure_place: string
          food_preference?: string
          id?: string
          multi_city_stops?: Json | null
          num_people?: number
          selected_plan?: string | null
          special_notes?: string | null
          transport_mode?: string
          travel_persona?: string | null
          travel_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          arrival_datetime?: string
          arrival_place?: string
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          departure_datetime?: string
          departure_place?: string
          food_preference?: string
          id?: string
          multi_city_stops?: Json | null
          num_people?: number
          selected_plan?: string | null
          special_notes?: string | null
          transport_mode?: string
          travel_persona?: string | null
          travel_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          albums_remaining: number
          created_at: string
          expires_at: string | null
          id: string
          is_super_premium: boolean
          plan: string
          reels_remaining: number
          started_at: string
          storage_limit_mb: number
          storage_used_mb: number
          user_id: string
        }
        Insert: {
          albums_remaining?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          is_super_premium?: boolean
          plan?: string
          reels_remaining?: number
          started_at?: string
          storage_limit_mb?: number
          storage_used_mb?: number
          user_id: string
        }
        Update: {
          albums_remaining?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          is_super_premium?: boolean
          plan?: string
          reels_remaining?: number
          started_at?: string
          storage_limit_mb?: number
          storage_used_mb?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
