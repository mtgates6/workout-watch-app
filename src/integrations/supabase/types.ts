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
      custom_exercises: {
        Row: {
          created_at: string
          id: string
          instructions: string | null
          muscle_groups: string[]
          name: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          instructions?: string | null
          muscle_groups?: string[]
          name: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          instructions?: string | null
          muscle_groups?: string[]
          name?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      health_entries: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          date: string
          goal_id: string
          id: string
          notes: string | null
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          date: string
          goal_id: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          date?: string
          goal_id?: string
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "health_entries_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "health_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      health_goals: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          emoji: string | null
          frequency: string
          id: string
          name: string
          target: number | null
          type: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          emoji?: string | null
          frequency: string
          id?: string
          name: string
          target?: number | null
          type: string
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          emoji?: string | null
          frequency?: string
          id?: string
          name?: string
          target?: number | null
          type?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      planned_exercise_previous_sets: {
        Row: {
          id: string
          planned_exercise_id: string
          reps: number | null
          sort_order: number
          weight: number | null
        }
        Insert: {
          id?: string
          planned_exercise_id: string
          reps?: number | null
          sort_order?: number
          weight?: number | null
        }
        Update: {
          id?: string
          planned_exercise_id?: string
          reps?: number | null
          sort_order?: number
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "planned_exercise_previous_sets_planned_exercise_id_fkey"
            columns: ["planned_exercise_id"]
            isOneToOne: false
            referencedRelation: "planned_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      planned_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          exercise_name: string
          exercise_type: string
          id: string
          instructions: string | null
          muscle_groups: string[]
          reference_reps: number | null
          reference_weight: number | null
          sort_order: number
          workout_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          exercise_name: string
          exercise_type?: string
          id?: string
          instructions?: string | null
          muscle_groups?: string[]
          reference_reps?: number | null
          reference_weight?: number | null
          sort_order?: number
          workout_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          exercise_name?: string
          exercise_type?: string
          id?: string
          instructions?: string | null
          muscle_groups?: string[]
          reference_reps?: number | null
          reference_weight?: number | null
          sort_order?: number
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "planned_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          exercise_name: string
          exercise_type: string
          id: string
          instructions: string | null
          muscle_groups: string[]
          notes: string | null
          sort_order: number
          workout_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          exercise_name: string
          exercise_type?: string
          id?: string
          instructions?: string | null
          muscle_groups?: string[]
          notes?: string | null
          sort_order?: number
          workout_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          exercise_name?: string
          exercise_type?: string
          id?: string
          instructions?: string | null
          muscle_groups?: string[]
          notes?: string | null
          sort_order?: number
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sets: {
        Row: {
          completed: boolean
          created_at: string
          distance: number | null
          duration: number | null
          id: string
          reps: string | null
          sort_order: number
          weight: string | null
          workout_exercise_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          distance?: number | null
          duration?: number | null
          id?: string
          reps?: string | null
          sort_order?: number
          weight?: string | null
          workout_exercise_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          distance?: number | null
          duration?: number | null
          id?: string
          reps?: string | null
          sort_order?: number
          weight?: string | null
          workout_exercise_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sets_workout_exercise_id_fkey"
            columns: ["workout_exercise_id"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          completed: boolean
          created_at: string
          date: string
          duration: number | null
          id: string
          name: string
          notes: string | null
          planned: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          date?: string
          duration?: number | null
          id?: string
          name: string
          notes?: string | null
          planned?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          date?: string
          duration?: number | null
          id?: string
          name?: string
          notes?: string | null
          planned?: boolean
          updated_at?: string
          user_id?: string
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
