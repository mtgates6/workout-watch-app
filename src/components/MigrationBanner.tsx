import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Upload } from "lucide-react";

const MIGRATION_KEY = "supabase_migration_done";

interface MigrationBannerProps {
  userId: string;
  onMigrated: () => void;
}

const MigrationBanner = ({ userId, onMigrated }: MigrationBannerProps) => {
  const [hasLocalData, setHasLocalData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const alreadyDone = localStorage.getItem(`${MIGRATION_KEY}_${userId}`);
    if (alreadyDone) return;

    const workoutData = JSON.parse(localStorage.getItem("fitness_workout_data") || "{}");
    const healthData = JSON.parse(localStorage.getItem("fitness_health_data") || "{}");
    const hasWorkouts = (workoutData.workouts || []).length > 0;
    const hasGoals = (healthData.goals || []).length > 0;

    if (hasWorkouts || hasGoals) setHasLocalData(true);
  }, [userId]);

  if (!hasLocalData) return null;

  const handleMigrate = async () => {
    setLoading(true);
    setError("");

    const workoutData = JSON.parse(localStorage.getItem("fitness_workout_data") || "{}");
    const workouts = workoutData.workouts || [];
    const healthData = JSON.parse(localStorage.getItem("fitness_health_data") || "{}");
    const goals = healthData.goals || [];
    const entries = healthData.entries || [];
    const customExercises = JSON.parse(localStorage.getItem("custom_exercises") || "[]");

    try {
      for (const [idx, workout] of workouts.entries()) {
        setStatus(`Workout ${idx + 1} of ${workouts.length}…`);

        const { error: wErr } = await supabase.from("workouts").insert([{
          id: workout.id,
          name: workout.name,
          date: workout.date,
          completed: workout.completed,
          planned: workout.planned || false,
          duration: workout.duration || null,
          notes: workout.notes || null,
          user_id: userId,
        }] as any);
        if (wErr && wErr.code !== "23505") throw new Error(`Workout: ${wErr.message}`);

        if (workout.exercises?.length > 0) {
          const { error: exErr } = await supabase.from("workout_exercises").insert(
            workout.exercises.map((ex: any, i: number) => ({
              id: ex.id,
              workout_id: workout.id,
              exercise_id: ex.exercise.id,
              exercise_name: ex.exercise.name,
              exercise_type: ex.exercise.type || "strength",
              muscle_groups: ex.exercise.muscleGroups || [],
              instructions: ex.exercise.instructions || null,
              notes: ex.notes || null,
              sort_order: i,
            })) as any
          );
          if (exErr && exErr.code !== "23505") throw new Error(`Exercises: ${exErr.message}`);

          for (const ex of workout.exercises) {
            if (ex.sets?.length > 0) {
              const { error: sErr } = await supabase.from("workout_sets").insert(
                ex.sets.map((set: any, j: number) => ({
                  id: set.id,
                  workout_exercise_id: ex.id,
                  weight: set.weight != null ? String(set.weight) : null,
                  reps: set.reps != null ? String(set.reps) : null,
                  duration: set.duration || null,
                  distance: set.distance || null,
                  completed: set.completed,
                  sort_order: j,
                })) as any
              );
              if (sErr && sErr.code !== "23505") throw new Error(`Sets: ${sErr.message}`);
            }
          }
        }

        if (workout.plannedExercises?.length > 0) {
          for (const [i, pe] of workout.plannedExercises.entries()) {
            const peId = crypto.randomUUID();
            const { error: peErr } = await supabase.from("planned_exercises").insert([{
              id: peId,
              workout_id: workout.id,
              exercise_id: pe.id,
              exercise_name: pe.name,
              exercise_type: pe.type || "strength",
              muscle_groups: pe.muscleGroups || [],
              instructions: pe.instructions || null,
              reference_weight: pe.referenceWeight || null,
              reference_reps: pe.referenceReps || null,
              sort_order: i,
            }] as any);
            if (peErr && peErr.code !== "23505") throw new Error(`Planned exercises: ${peErr.message}`);

            if (pe.previousSets?.length > 0) {
              await supabase.from("planned_exercise_previous_sets").insert(
                pe.previousSets.map((ps: any, j: number) => ({
                  planned_exercise_id: peId,
                  weight: ps.weight || null,
                  reps: ps.reps || null,
                  sort_order: j,
                })) as any
              );
            }
          }
        }
      }

      if (goals.length > 0) {
        setStatus("Importing health goals…");
        const { error: gErr } = await supabase.from("health_goals").insert(
          goals.map((g: any) => ({
            id: g.id, name: g.name, type: g.type, frequency: g.frequency,
            target: g.target || null, unit: g.unit || null, emoji: g.emoji || null,
            description: g.description || null, active: g.active, user_id: userId,
          })) as any
        );
        if (gErr && gErr.code !== "23505") throw new Error(`Goals: ${gErr.message}`);
      }

      if (entries.length > 0) {
        setStatus("Importing health entries…");
        const { error: eErr } = await supabase.from("health_entries").insert(
          entries.map((e: any) => ({
            id: e.id, goal_id: e.goalId, date: e.date, completed: e.completed,
            value: e.value || null, notes: e.notes || null,
            completed_at: e.completedAt || null, user_id: userId,
          })) as any
        );
        if (eErr && eErr.code !== "23505") throw new Error(`Entries: ${eErr.message}`);
      }

      if (customExercises.length > 0) {
        setStatus("Importing custom exercises…");
        await supabase.from("custom_exercises").insert(
          customExercises.map((ex: any) => ({
            id: ex.id, name: ex.name, type: ex.type || "strength",
            muscle_groups: ex.muscleGroups || [], instructions: ex.instructions || null,
            user_id: userId,
          })) as any
        );
      }

      setStatus("Done!");
      localStorage.setItem(`${MIGRATION_KEY}_${userId}`, "true");
      setHasLocalData(false);
      onMigrated();
      toast({ title: "Data imported!", description: "Your existing data has been saved to the cloud." });
    } catch (e: any) {
      setError(e.message || "Unknown error");
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border bg-muted/50 p-4 flex flex-col gap-3 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">You have existing data</p>
          <p className="text-xs text-muted-foreground">Import it to the cloud so it doesn't get lost</p>
        </div>
        <Button size="sm" onClick={handleMigrate} disabled={loading}>
          <Upload className="h-4 w-4 mr-2" />
          {loading ? "Importing…" : "Import"}
        </Button>
      </div>
      {status && !error && (
        <p className="text-xs text-muted-foreground">{status}</p>
      )}
      {error && (
        <p className="text-xs text-destructive font-medium">Error: {error}</p>
      )}
    </div>
  );
};

export default MigrationBanner;
