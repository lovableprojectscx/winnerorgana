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
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
      payment_methods: {
        Row: {
          account_holder: string
          account_number: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          qr_code_url: string | null
        }
        Insert: {
          account_holder: string
          account_number: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          qr_code_url?: string | null
        }
        Update: {
          account_holder?: string
          account_number?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          qr_code_url?: string | null
        }
        Relationships: []
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
        Args: {
          p_email: string
          p_amount: number
          p_description?: string
        }
        Returns: Json
      }
      create_order_commissions: {
        Args: {
          p_order_id: string
          p_order_amount: number
          p_affiliate_code: string
        }
        Returns: undefined
      }
      decrease_product_stock: {
        Args: {
          p_product_id: string
          p_quantity: number
        }
        Returns: undefined
      }
      handle_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      process_commission_to_wp: {
        Args: {
          p_commission_id: string
        }
        Returns: Json
      }
      process_withdrawal_request: {
        Args: {
          p_request_id: string
          p_status: string
          p_admin_notes?: string
        }
        Returns: Json
      }
      use_credits_for_purchase: {
        Args: {
          p_amount: number
          p_order_id: string
        }
        Returns: Json
      }
      verify_direct_payment: {
        Args: {
          p_order_id: string
          p_approved: boolean
          p_admin_notes?: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
    PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
    PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof PublicSchema["Enums"]
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof PublicSchema["CompositeTypes"]
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never
