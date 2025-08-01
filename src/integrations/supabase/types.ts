export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_rooms: {
        Row: {
          admin_id: string | null
          created_at: string
          id: string
          last_message_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
      live_chat_messages: {
        Row: {
          attachment_name: string | null
          attachment_type: string | null
          attachment_url: string | null
          chat_room_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          sender_id: string
          sender_type: string
          updated_at: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          chat_room_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          sender_id: string
          sender_type: string
          updated_at?: string
        }
        Update: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          chat_room_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          sender_id?: string
          sender_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      offer_product_items: {
        Row: {
          created_at: string
          id: string
          offer_product_id: string
          package_id: string
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          offer_product_id: string
          package_id: string
          product_id: string
          quantity?: number
        }
        Update: {
          created_at?: string
          id?: string
          offer_product_id?: string
          package_id?: string
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_offer_product_items_offer_product_id"
            columns: ["offer_product_id"]
            isOneToOne: false
            referencedRelation: "offer_products"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_products: {
        Row: {
          created_at: string
          description: string | null
          discount_percentage: number | null
          id: string
          image_url: string | null
          is_active: boolean
          offer_price: number | null
          original_price: number | null
          priority: number
          shareable_slug: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          offer_price?: number | null
          original_price?: number | null
          priority?: number
          shareable_slug?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          offer_price?: number | null
          original_price?: number | null
          priority?: number
          shareable_slug?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_communications: {
        Row: {
          admin_id: string | null
          attachment_name: string | null
          attachment_type: string | null
          attachment_url: string | null
          created_at: string | null
          id: string
          message: string
          order_id: string
          sender_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          created_at?: string | null
          id?: string
          message: string
          order_id: string
          sender_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_id?: string | null
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          created_at?: string | null
          id?: string
          message?: string
          order_id?: string
          sender_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_communications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          discount_percentage: number | null
          id: string
          order_id: string
          original_price: number | null
          package_duration: string
          package_features: string[] | null
          package_id: string
          price: number
          product_category: string | null
          product_description: string | null
          product_id: string
          product_image: string | null
          product_name: string
          quantity: number
        }
        Insert: {
          created_at?: string | null
          discount_percentage?: number | null
          id?: string
          order_id: string
          original_price?: number | null
          package_duration: string
          package_features?: string[] | null
          package_id: string
          price: number
          product_category?: string | null
          product_description?: string | null
          product_id: string
          product_image?: string | null
          product_name: string
          quantity?: number
        }
        Update: {
          created_at?: string | null
          discount_percentage?: number | null
          id?: string
          order_id?: string
          original_price?: number | null
          package_duration?: string
          package_features?: string[] | null
          package_id?: string
          price?: number
          product_category?: string | null
          product_description?: string | null
          product_id?: string
          product_image?: string | null
          product_name?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          admin_message: string | null
          changed_by: string | null
          created_at: string
          id: string
          new_status: string
          old_status: string | null
          order_id: string
        }
        Insert: {
          admin_message?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: string
          old_status?: string | null
          order_id: string
        }
        Update: {
          admin_message?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: string
          old_status?: string | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_message: string | null
          created_at: string | null
          customer_address: string
          customer_email: string
          customer_name: string
          customer_phone: string
          discount_amount: number | null
          duration_days: number | null
          duration_days_text: string | null
          id: string
          payment_method: string
          product_name: string | null
          product_price: number | null
          product_price_text: string | null
          product_quantity: number | null
          product_quantity_text: string | null
          promo_code: string | null
          status: string | null
          total_amount: number
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_message?: string | null
          created_at?: string | null
          customer_address: string
          customer_email: string
          customer_name: string
          customer_phone: string
          discount_amount?: number | null
          duration_days?: number | null
          duration_days_text?: string | null
          id?: string
          payment_method: string
          product_name?: string | null
          product_price?: number | null
          product_price_text?: string | null
          product_quantity?: number | null
          product_quantity_text?: string | null
          promo_code?: string | null
          status?: string | null
          total_amount: number
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_message?: string | null
          created_at?: string | null
          customer_address?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          discount_amount?: number | null
          duration_days?: number | null
          duration_days_text?: string | null
          id?: string
          payment_method?: string
          product_name?: string | null
          product_price?: number | null
          product_price_text?: string | null
          product_quantity?: number | null
          product_quantity_text?: string | null
          promo_code?: string | null
          status?: string | null
          total_amount?: number
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      popular_products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          media_type: string
          media_url: string
          priority: number
          product_id: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          media_type?: string
          media_url: string
          priority?: number
          product_id: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          media_type?: string
          media_url?: string
          priority?: number
          product_id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_packages: {
        Row: {
          created_at: string | null
          discount: number | null
          duration: string
          id: string
          is_active: boolean | null
          original_price: number | null
          price: number
          product_id: string | null
        }
        Insert: {
          created_at?: string | null
          discount?: number | null
          duration: string
          id: string
          is_active?: boolean | null
          original_price?: number | null
          price: number
          product_id?: string | null
        }
        Update: {
          created_at?: string | null
          discount?: number | null
          duration?: string
          id?: string
          is_active?: boolean | null
          original_price?: number | null
          price?: number
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_packages_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          features: string[] | null
          id: string
          image: string | null
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id: string
          image?: string | null
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_order_amount: number | null
          updated_at: string | null
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          updated_at?: string | null
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          updated_at?: string | null
          used_count?: number | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_type: string | null
          setting_value: string | null
          updated_at: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_notifications: {
        Row: {
          created_at: string | null
          id: string
          notification_type: string
          sent_at: string | null
          subscription_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notification_type: string
          sent_at?: string | null
          subscription_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notification_type?: string
          sent_at?: string | null
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_notifications_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string | null
          expires_at: string
          file_name: string | null
          id: string
          is_active: boolean | null
          order_id: string | null
          package_duration: string
          price: number
          product_id: string | null
          product_name: string
          starts_at: string | null
          subscription_file_url: string | null
          subscription_link: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string | null
          expires_at: string
          file_name?: string | null
          id?: string
          is_active?: boolean | null
          order_id?: string | null
          package_duration: string
          price: number
          product_id?: string | null
          product_name: string
          starts_at?: string | null
          subscription_file_url?: string | null
          subscription_link?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string | null
          expires_at?: string
          file_name?: string | null
          id?: string
          is_active?: boolean | null
          order_id?: string | null
          package_duration?: string
          price?: number
          product_id?: string | null
          product_name?: string
          starts_at?: string | null
          subscription_file_url?: string | null
          subscription_link?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      confirm_order_and_create_subscriptions: {
        Args: { order_uuid: string }
        Returns: Json
      }
      create_subscription_from_order: {
        Args: Record<PropertyKey, never> | { order_uuid: string }
        Returns: undefined
      }
      get_or_create_chat_room: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_order_details_with_products: {
        Args: { order_uuid: string }
        Returns: {
          order_id: string
          customer_name: string
          customer_email: string
          customer_phone: string
          total_amount: number
          status: string
          created_at: string
          product_id: string
          product_name: string
          product_category: string
          product_description: string
          package_duration: string
          package_price: number
          quantity: number
          package_features: string[]
        }[]
      }
      increment_promo_usage: {
        Args: Record<PropertyKey, never> | { promo_code: string }
        Returns: undefined
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_subscription_details: {
        Args:
          | Record<PropertyKey, never>
          | {
              p_order_id: string
              p_file_url?: string
              p_link?: string
              p_file_name?: string
            }
        Returns: undefined
      }
      validate_promo_code: {
        Args:
          | { code_text: string; order_amount: number }
          | { promo_code: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
