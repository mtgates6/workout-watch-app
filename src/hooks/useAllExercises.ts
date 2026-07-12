import { useEffect, useState } from "react";
import { exercises as defaultExercises } from "@/data/exercises";
import { Exercise, MuscleGroup } from "@/types/workout";
import { supabase } from "@/integrations/supabase/client";
import { getUserUuid } from "@/context/UserContext";

export function useAllExercises(): Exercise[] {
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    const userId = getUserUuid();
    if (!userId) return;
    supabase.from("custom_exercises").select("*").eq("user_id", userId).then(({ data, error }) => {
      if (error) {
        console.error("Failed to load custom exercises:", error);
      } else if (data) {
        setCustomExercises(data.map(row => ({
          id: row.id,
          name: row.name,
          type: row.type as Exercise["type"],
          muscleGroups: row.muscle_groups as MuscleGroup[],
          instructions: row.instructions ?? undefined,
        })));
      }
    });
  }, []);

  return [...defaultExercises, ...customExercises];
}
