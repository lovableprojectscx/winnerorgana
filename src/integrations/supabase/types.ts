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
      favorites: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      affiliates: {
        Row: {
          affiliate_code: string
          commission_rate: number | null
          created_at: string | null
          dni: string
          email: string
          id: string
          level: string | null
          name: string
          referral_count: number | null
          referred_by: string | null
          status: string | null
          total_commissions: number | null
          total_sales: number | null
          updated_at: string | null
          user_id: string | null
          yape_number: string | null
        }
        Insert: {
          affiliate_code: string
          commission_rate?: number | null
          created_at?: string | null
          dni: string
          email: string
          id?: string
          level?: string | null
          name: string
          referral_count?: number | null
          referred_by?: string | null
          status?: string | null
          total_commissions?: number | null
          total_sales?: number | null
          updated_at?: string | null
          user_id?: string | null
          yape_number?: string | null
        }
        Update: {
          affiliate_code?: string
          commission_rate?: number | null
          created_at?: string | null
          dni?: string
          email?: string
          id?: string
          level?: string | null
          name?: string
          referral_count?: number | null
          referred_by?: string | null
          status?: string | null
          total_commissions?: number | null
          total_sales?: number | null
          updated_at?: string | null
          user_id?: string | null
          yape_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliates_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      business_settings: {
        Row: {
          address: string | null
          bank_account: string | null
          bank_name: string | null
          business_name: string
          commission_level_1: number
          commission_level_2: number
          commission_level_3: number
          commission_level_4: number
          commission_level_5: number
          commission_level_6: number
          commission_level_7: number
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          logo_url: string | null
          notify_new_affiliates: boolean
          notify_new_orders: boolean
          plin_number: string | null
          updated_at: string
          whatsapp_number: string | null
          wp_conversion_rate: number | null
          yape_number: string | null
        }
        Insert: {
          address?: string | null
          bank_account?: string | null
          bank_name?: string | null
          business_name?: string
          commission_level_1?: number
          commission_level_2?: number
          commission_level_3?: number
          commission_level_4?: number
          commission_level_5?: number
          commission_level_6?: number
          commission_level_7?: number
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          notify_new_affiliates?: boolean
          notify_new_orders?: boolean
          plin_number?: string | null
          updated_at?: string
          whatsapp_number?: string | null
          wp_conversion_rate?: number | null
          yape_number?: string | null
        }
        Update: {
          address?: string | null
          bank_account?: string | null
          bank_name?: string | null
          business_name?: string
          commission_level_1?: number
          commission_level_2?: number
          commission_level_3?: number
          commission_level_4?: number
          commission_level_5?: number
          commission_level_6?: number
          commission_level_7?: number
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          notify_new_affiliates?: boolean
          notify_new_orders?: boolean
          plin_number?: string | null
          updated_at?: string
          whatsapp_number?: string | null
          wp_conversion_rate?: number | null
          yape_number?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      commissions: {
        Row: {
          affiliate_id: string
          amount: number
          created_at: string
          id: string
          level: number
          order_id: string | null
          status: string | null
          wp_amount: number | null
          wp_credited: boolean | null
        }
        Insert: {
          affiliate_id: string
          amount?: number
          created_at?: string
          id?: string
          level?: number
          order_id?: string | null
          status?: string | null
          wp_amount?: number | null
          wp_credited?: boolean | null
        }
        Update: {
          affiliate_id?: string
          amount?: number
          created_at?: string
          id?: string
          level?: number
          order_id?: string | null
          status?: string | null
          wp_amount?: number | null
          wp_credited?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          mensaje: string
          nombre: string
          status: string | null
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          mensaje: string
          nombre: string
          status?: string | null
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          mensaje?: string
          nombre?: string
          status?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          admin_id: string | null
          amount: number
          created_at: string
          description: string | null
          id: string
          order_id: string | null
          point_value_at_time: number | null
          type: string
          user_credit_id: string
        }
        Insert: {
          admin_id?: string | null
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          point_value_at_time?: number | null
          type: string
          user_credit_id: string
        }
        Update: {
          admin_id?: string | null
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          point_value_at_time?: number | null
          type?: string
          user_credit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_user_credit_id_fkey"
            columns: ["user_credit_id"]
            isOneToOne: false
            referencedRelation: "user_credits"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          created_at: string | null
          customer_dni: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          order_number: string
          payment_status: string | null
          payment_type: string | null
          product_id: string | null
          product_name: string
          shipped_at: string | null
          shipping_address: string | null
          shipping_city: string | null
          shipping_company: string | null
          shipping_voucher_url: string | null
          status: string | null
          tracking_code: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          customer_dni?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          order_number: string
          payment_status?: string | null
          payment_type?: string | null
          product_id?: string | null
          product_name: string
          shipped_at?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_company?: string | null
          shipping_voucher_url?: string | null
          status?: string | null
          tracking_code?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          customer_dni?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          order_number?: string
          payment_status?: string | null
          payment_type?: string | null
          product_id?: string | null
          product_name?: string
          shipped_at?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_company?: string | null
          shipping_voucher_url?: string | null
          status?: string | null
          tracking_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_proofs: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string | null
          id: string
          order_id: string
          payment_method: string
          proof_url: string
          status: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string | null
          id?: string
          order_id: string
          payment_method: string
          proof_url: string
          status?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string | null
          id?: string
          order_id?: string
          payment_method?: string
          proof_url?: string
          status?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          rating: number | null
          stock: number | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          rating?: number | null
          stock?: number | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          rating?: number | null
          stock?: number | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          level: number
          referred_id: string
          referrer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: number
          referred_id: string
          referrer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: number
          referred_id?: string
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credits: {
        Row: {
          balance: number
          created_at: string
          email: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          email: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          amount_in_soles: number
          created_at: string
          email: string
          id: string
          payment_details: string | null
          payment_method: string
          point_value_at_request: number
          processed_at: string | null
          processed_by: string | null
          status: string
          updated_at: string
          user_credit_id: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          amount_in_soles: number
          created_at?: string
          email: string
          id?: string
          payment_details?: string | null
          payment_method?: string
          point_value_at_request?: number
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          updated_at?: string
          user_credit_id: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          amount_in_soles?: number
          created_at?: string
          email?: string
          id?: string
          payment_details?: string | null
          payment_method?: string
          point_value_at_request?: number
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          updated_at?: string
          user_credit_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_user_credits: {
        Args: { p_amount: number; p_description?: string; p_email: string }
        Returns: Json
      }
      create_order_commissions: {
        Args: {
          p_affiliate_code: string
          p_order_amount: number
          p_order_id: string
        }
        Returns: undefined
      }
      decrease_product_stock:
      | {
        Args: { p_product_id: string; p_quantity: number }
        Returns: undefined
      }
      | {
        Args: {
          p_order_id: string
          p_product_id: string
          p_quantity: number
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      process_commission_to_wp: {
        Args: { p_commission_id: string }
        Returns: Json
      }
      process_withdrawal_request: {
        Args: { p_admin_notes?: string; p_request_id: string; p_status: string }
        Returns: Json
      }
      use_credits_for_purchase: {
        Args: { p_amount: number; p_order_id: string }
        Returns: Json
      }
      verify_direct_payment: {
        Args: {
          p_admin_notes?: string
          p_approved: boolean
          p_order_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      affiliate_level:
      | "Vendedor Directo"
      | "Mentor Directo"
      | "Líder de Equipo"
      | "Desarrollador"
      | "Expansor"
      | "Consolidador"
      | "Embajador"
      app_role: "admin" | "affiliate" | "user"
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
      affiliate_level: [
        "Vendedor Directo",
        "Mentor Directo",
        "Líder de Equipo",
        "Desarrollador",
        "Expansor",
        "Consolidador",
        "Embajador",
      ],
      app_role: ["admin", "affiliate", "user"],
    },
  },
} as const
