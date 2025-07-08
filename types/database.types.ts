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
      commissions: {
        Row: {
          created_at: string
          customer: string
          id: string
          oid: number
          public_note: string | null
          secure_note: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          customer: string
          id?: string
          oid?: number
          public_note?: string | null
          secure_note?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          customer?: string
          id?: string
          oid?: number
          public_note?: string | null
          secure_note?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_customer_fkey"
            columns: ["customer"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions_bases: {
        Row: {
          created_at: string
          creator_name: string
          id: string
          name: string
          storefront_url: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_name: string
          id?: string
          name: string
          storefront_url: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_name?: string
          id?: string
          name?: string
          storefront_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      commissions_characters: {
        Row: {
          base: string
          changelog: Json
          commission: string
          created_at: string
          id: number
          name: string
          note: string | null
          order_id: string | null
          updated_at: string
        }
        Insert: {
          base: string
          changelog?: Json
          commission: string
          created_at?: string
          id?: number
          name: string
          note?: string | null
          order_id?: string | null
          updated_at?: string
        }
        Update: {
          base?: string
          changelog?: Json
          commission?: string
          created_at?: string
          id?: number
          name?: string
          note?: string | null
          order_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_characters_base_fkey"
            columns: ["base"]
            isOneToOne: false
            referencedRelation: "commissions_bases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_characters_commission_fkey"
            columns: ["commission"]
            isOneToOne: false
            referencedRelation: "commissions"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions_payments: {
        Row: {
          commission: string
          created_at: string
          currency: string
          income_amount: number
          payment_ext_id: string
          payment_ext_url: string
          payment_processor: string
          pid: string
          public_note: string | null
          secure_note: string | null
          state: string
        }
        Insert: {
          commission: string
          created_at?: string
          currency: string
          income_amount?: number
          payment_ext_id: string
          payment_ext_url: string
          payment_processor: string
          pid?: string
          public_note?: string | null
          secure_note?: string | null
          state: string
        }
        Update: {
          commission?: string
          created_at?: string
          currency?: string
          income_amount?: number
          payment_ext_id?: string
          payment_ext_url?: string
          payment_processor?: string
          pid?: string
          public_note?: string | null
          secure_note?: string | null
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_payments_commission_fkey"
            columns: ["commission"]
            isOneToOne: false
            referencedRelation: "commissions"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          id: string
          name: string
          note: string | null
          updated_at: string
          vrc_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          note?: string | null
          updated_at?: string
          vrc_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          note?: string | null
          updated_at?: string
          vrc_id?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          author: string
          content: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          author: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          author?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_all_commissions: {
        Args: { sort_by?: string; page_number?: number; filter?: Json }
        Returns: {
          id: string
          status: string
          public_note: string
          secure_note: string
          created_at: string
          updated_at: string
          latest_payment: Json
          customer: Json
          n_characters: number
        }[]
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
