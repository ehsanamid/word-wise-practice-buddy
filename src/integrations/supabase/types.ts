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
      tbldefinition: {
        Row: {
          definition: string | null
          definitionid: number
          wordid: number | null
        }
        Insert: {
          definition?: string | null
          definitionid: number
          wordid?: number | null
        }
        Update: {
          definition?: string | null
          definitionid?: number
          wordid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tbldefinition_wordid_fkey"
            columns: ["wordid"]
            isOneToOne: false
            referencedRelation: "tblword"
            referencedColumns: ["wordid"]
          },
          {
            foreignKeyName: "tbldefinition_wordid_fkey1"
            columns: ["wordid"]
            isOneToOne: false
            referencedRelation: "tblword"
            referencedColumns: ["wordid"]
          },
        ]
      }
      tblexample: {
        Row: {
          definitionid: number | null
          english: string | null
          exampleid: number
          persian: string | null
        }
        Insert: {
          definitionid?: number | null
          english?: string | null
          exampleid: number
          persian?: string | null
        }
        Update: {
          definitionid?: number | null
          english?: string | null
          exampleid?: number
          persian?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tblexample_definitionid_fkey"
            columns: ["definitionid"]
            isOneToOne: false
            referencedRelation: "tbldefinition"
            referencedColumns: ["definitionid"]
          },
          {
            foreignKeyName: "tblexample_definitionid_fkey1"
            columns: ["definitionid"]
            isOneToOne: false
            referencedRelation: "tbldefinition"
            referencedColumns: ["definitionid"]
          },
        ]
      }
      tblword: {
        Row: {
          difficulty: string | null
          pronunciation: string | null
          type: string | null
          word: string | null
          wordid: number
        }
        Insert: {
          difficulty?: string | null
          pronunciation?: string | null
          type?: string | null
          word?: string | null
          wordid: number
        }
        Update: {
          difficulty?: string | null
          pronunciation?: string | null
          type?: string | null
          word?: string | null
          wordid?: number
        }
        Relationships: []
      }
      tblpractice: {
        Row: {
          exampleid: number | null
          id: number
          score: number | null
          userid: number | null
        }
        Insert: {
          exampleid?: number | null
          id: number
          score?: number | null
          userid?: number | null
        }
        Update: {
          exampleid?: number | null
          id?: number
          score?: number | null
          userid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tblpractice_exampleid_fkey"
            columns: ["exampleid"]
            isOneToOne: false
            referencedRelation: "tblexample"
            referencedColumns: ["exampleid"]
          },
          {
            foreignKeyName: "tblpractice_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "tbuser"
            referencedColumns: ["userid"]
          },
        ]
      }
      tbuser: {
        Row: {
          email: string | null
          password: string | null
          userid: number
          username: string | null
        }
        Insert: {
          email?: string | null
          password?: string | null
          userid: number
          username?: string | null
        }
        Update: {
          email?: string | null
          password?: string | null
          userid?: number
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
