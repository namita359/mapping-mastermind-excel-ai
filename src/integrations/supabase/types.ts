export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      column_metadata: {
        Row: {
          business_description: string | null
          column_name: string
          created_at: string | null
          created_by: string
          data_type: string | null
          default_value: string | null
          id: string
          is_active: boolean | null
          is_nullable: boolean | null
          is_primary_key: boolean | null
          table_id: string
          updated_at: string | null
        }
        Insert: {
          business_description?: string | null
          column_name: string
          created_at?: string | null
          created_by: string
          data_type?: string | null
          default_value?: string | null
          id?: string
          is_active?: boolean | null
          is_nullable?: boolean | null
          is_primary_key?: boolean | null
          table_id: string
          updated_at?: string | null
        }
        Update: {
          business_description?: string | null
          column_name?: string
          created_at?: string | null
          created_by?: string
          data_type?: string | null
          default_value?: string | null
          id?: string
          is_active?: boolean | null
          is_nullable?: boolean | null
          is_primary_key?: boolean | null
          table_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "column_metadata_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "table_metadata"
            referencedColumns: ["id"]
          },
        ]
      }
      malcode_metadata: {
        Row: {
          business_description: string | null
          created_at: string | null
          created_by: string
          id: string
          is_active: boolean | null
          malcode: string
          updated_at: string | null
        }
        Insert: {
          business_description?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          is_active?: boolean | null
          malcode: string
          updated_at?: string | null
        }
        Update: {
          business_description?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          is_active?: boolean | null
          malcode?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mapping_columns: {
        Row: {
          column_description: string | null
          column_name: string
          created_at: string
          data_type: string
          default_value: string | null
          id: string
          is_nullable: boolean | null
          is_primary_key: boolean | null
          malcode: string
          malcode_description: string | null
          table_description: string | null
          table_name: string
        }
        Insert: {
          column_description?: string | null
          column_name: string
          created_at?: string
          data_type?: string
          default_value?: string | null
          id?: string
          is_nullable?: boolean | null
          is_primary_key?: boolean | null
          malcode: string
          malcode_description?: string | null
          table_description?: string | null
          table_name: string
        }
        Update: {
          column_description?: string | null
          column_name?: string
          created_at?: string
          data_type?: string
          default_value?: string | null
          id?: string
          is_nullable?: boolean | null
          is_primary_key?: boolean | null
          malcode?: string
          malcode_description?: string | null
          table_description?: string | null
          table_name?: string
        }
        Relationships: []
      }
      mapping_files: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          source_system: string
          status: Database["public"]["Enums"]["mapping_status"]
          target_system: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          source_system: string
          status?: Database["public"]["Enums"]["mapping_status"]
          target_system: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          source_system?: string
          status?: Database["public"]["Enums"]["mapping_status"]
          target_system?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mapping_rows: {
        Row: {
          comments: string[] | null
          created_at: string
          created_by: string
          id: string
          join_clause: string | null
          mapping_file_id: string
          reviewed_at: string | null
          reviewer: string | null
          source_column_id: string
          source_type: Database["public"]["Enums"]["source_type"]
          status: Database["public"]["Enums"]["mapping_status"]
          target_column_id: string
          target_type: Database["public"]["Enums"]["target_type"]
          transformation: string | null
          updated_at: string | null
        }
        Insert: {
          comments?: string[] | null
          created_at?: string
          created_by: string
          id?: string
          join_clause?: string | null
          mapping_file_id: string
          reviewed_at?: string | null
          reviewer?: string | null
          source_column_id: string
          source_type?: Database["public"]["Enums"]["source_type"]
          status?: Database["public"]["Enums"]["mapping_status"]
          target_column_id: string
          target_type?: Database["public"]["Enums"]["target_type"]
          transformation?: string | null
          updated_at?: string | null
        }
        Update: {
          comments?: string[] | null
          created_at?: string
          created_by?: string
          id?: string
          join_clause?: string | null
          mapping_file_id?: string
          reviewed_at?: string | null
          reviewer?: string | null
          source_column_id?: string
          source_type?: Database["public"]["Enums"]["source_type"]
          status?: Database["public"]["Enums"]["mapping_status"]
          target_column_id?: string
          target_type?: Database["public"]["Enums"]["target_type"]
          transformation?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mapping_rows_mapping_file_id_fkey"
            columns: ["mapping_file_id"]
            isOneToOne: false
            referencedRelation: "mapping_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mapping_rows_source_column_id_fkey"
            columns: ["source_column_id"]
            isOneToOne: false
            referencedRelation: "mapping_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mapping_rows_target_column_id_fkey"
            columns: ["target_column_id"]
            isOneToOne: false
            referencedRelation: "mapping_columns"
            referencedColumns: ["id"]
          },
        ]
      }
      table_metadata: {
        Row: {
          business_description: string | null
          created_at: string | null
          created_by: string
          id: string
          is_active: boolean | null
          malcode_id: string
          table_name: string
          updated_at: string | null
        }
        Insert: {
          business_description?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          is_active?: boolean | null
          malcode_id: string
          table_name: string
          updated_at?: string | null
        }
        Update: {
          business_description?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          is_active?: boolean | null
          malcode_id?: string
          table_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "table_metadata_malcode_id_fkey"
            columns: ["malcode_id"]
            isOneToOne: false
            referencedRelation: "malcode_metadata"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      mapping_status: "draft" | "pending" | "approved" | "rejected"
      source_type: "SRZ_ADLS"
      target_type: "CZ_ADLS" | "SYNAPSE_TABLE"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      mapping_status: ["draft", "pending", "approved", "rejected"],
      source_type: ["SRZ_ADLS"],
      target_type: ["CZ_ADLS", "SYNAPSE_TABLE"],
    },
  },
} as const
