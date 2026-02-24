import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useWorkout } from "@/context/WorkoutContext";
import { useHealth } from "@/context/HealthContext";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { CloudUpload, X, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const MIGRATED_KEY = "fitness_migrated_to_cloud";
const WORKOUT_STORAGE_KEY = "fitness_workout_data";
const HEALTH_STORAGE_KEY = "fitness_health_data";
const CUSTOM_EXERCISES_KEY = "custom_exercises";

const hasLocalData = () => {
  const workoutData = localStorage.getItem(WORKOUT_STORAGE_KEY);
  const healthData = localStorage.getItem(HEALTH_STORAGE_KEY);
  const customExercises = localStorage.getItem(CUSTOM_EXERCISES_KEY);
  if (workoutData) {
    const parsed = JSON.parse(workoutData);
    if ((parsed.workouts && parsed.workouts.length > 0)) return true;
  }
  if (healthData) {
    const parsed = JSON.parse(healthData);
    if ((parsed.goals && parsed.goals.length > 0) || (parsed.entries && parsed.entries.length > 0)) return true;
  }
  if (customExercises) {
    const parsed = JSON.parse(customExercises);
    if (parsed.length > 0) return true;
  }
  return false;
};

const MigrateToCloudBanner: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(MIGRATED_KEY) === "true");
  const [migrating, setMigrating] = useState(false);

  const showRetry = dismissed && user && hasLocalData();

  // Show banner if has local data (either fresh or retry)
  if (!user || (!hasLocalData() && !showRetry)) return null;
  if (dismissed && !showRetry) return null;

  const handleMigrate = async () => {
    setMigrating(true);
    try {
      let hasError = false;
      const checkError = (result: any, label: string) => {
        if (result.error) {
          console.error(`Migration error (${label}):`, result.error);
          hasError = true;
        }
      };

      // --- Migrate workouts ---
      const workoutRaw = localStorage.getItem(WORKOUT_STORAGE_KEY);
      if (workoutRaw) {
        const { workouts = [] } = JSON.parse(workoutRaw);
        for (const workout of workouts) {
          const wResult = await supabase.from("workouts").upsert({
            id: workout.id,
            user_id: user.id,
            name: workout.name,
            date: workout.date,
            duration: workout.duration ?? null,
            notes: workout.notes ?? null,
            completed: workout.completed,
            planned: workout.planned ?? false,
          });
          checkError(wResult, `workout ${workout.name}`);

          // Save exercises
          for (let i = 0; i < (workout.exercises || []).length; i++) {
            const ex = workout.exercises[i];
            const { data: dbEx } = await supabase.from("workout_exercises").insert({
              id: ex.id,
              workout_id: workout.id,
              exercise_id: ex.exercise.id,
              exercise_name: ex.exercise.name,
              exercise_type: ex.exercise.type,
              muscle_groups: ex.exercise.muscleGroups,
              instructions: ex.exercise.instructions ?? null,
              notes: ex.notes ?? null,
              sort_order: i,
            }).select().single();

            if (dbEx) {
              for (let j = 0; j < (ex.sets || []).length; j++) {
                const set = ex.sets[j];
                await supabase.from("workout_sets").insert({
                  id: set.id,
                  workout_exercise_id: dbEx.id,
                  weight: set.weight !== undefined ? String(set.weight) : null,
                  reps: set.reps !== undefined ? String(set.reps) : null,
                  duration: set.duration ?? null,
                  distance: set.distance ?? null,
                  completed: set.completed,
                  sort_order: j,
                });
              }
            }
          }

          // Save planned exercises
          for (let i = 0; i < (workout.plannedExercises || []).length; i++) {
            const pe = workout.plannedExercises[i];
            const { data: dbPe } = await supabase.from("planned_exercises").insert({
              workout_id: workout.id,
              exercise_id: pe.id,
              exercise_name: pe.name,
              exercise_type: pe.type,
              muscle_groups: pe.muscleGroups,
              instructions: pe.instructions ?? null,
              reference_weight: pe.referenceWeight ?? null,
              reference_reps: pe.referenceReps ?? null,
              sort_order: i,
            }).select().single();

            if (dbPe && pe.previousSets) {
              for (let j = 0; j < pe.previousSets.length; j++) {
                const ps = pe.previousSets[j];
                await supabase.from("planned_exercise_previous_sets").insert({
                  planned_exercise_id: dbPe.id,
                  weight: ps.weight ?? null,
                  reps: ps.reps ?? null,
                  sort_order: j,
                });
              }
            }
          }
        }
      }

      // --- Migrate health data ---
      const healthRaw = localStorage.getItem(HEALTH_STORAGE_KEY);
      if (healthRaw) {
        const { goals = [], entries = [] } = JSON.parse(healthRaw);
        for (const goal of goals) {
          await supabase.from("health_goals").upsert({
            id: goal.id,
            user_id: user.id,
            name: goal.name,
            type: goal.type,
            frequency: goal.frequency,
            target: goal.target ?? null,
            unit: goal.unit ?? null,
            emoji: goal.emoji ?? null,
            description: goal.description ?? null,
            active: goal.active,
            created_at: goal.createdAt,
          });
        }
        for (const entry of entries) {
          await supabase.from("health_entries").upsert({
            id: entry.id,
            user_id: user.id,
            goal_id: entry.goalId,
            date: entry.date,
            completed: entry.completed,
            value: entry.value ?? null,
            notes: entry.notes ?? null,
            completed_at: entry.completedAt ?? null,
          });
        }
      }

      // --- Migrate custom exercises ---
      const customRaw = localStorage.getItem(CUSTOM_EXERCISES_KEY);
      if (customRaw) {
        const customExercises = JSON.parse(customRaw);
        for (const ex of customExercises) {
          await supabase.from("custom_exercises").upsert({
            id: ex.id,
            user_id: user.id,
            name: ex.name,
            type: ex.type,
            muscle_groups: ex.muscleGroups,
            instructions: ex.instructions ?? null,
          });
        }
      }

      if (hasError) {
        toast({
          title: "Migration had errors",
          description: "Some data may not have been saved. Please try again.",
          variant: "destructive",
        });
        return;
      }

      localStorage.setItem(MIGRATED_KEY, "true");
      setDismissed(true);
      toast({
        title: "Migration complete!",
        description: "Your data has been synced to the cloud. Reload to see your data.",
      });
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error("Migration failed:", err);
      toast({
        title: "Migration failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setMigrating(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(MIGRATED_KEY, "true");
    setDismissed(true);
  };

  if (showRetry) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-3 mb-4">
        <CloudUpload className="h-5 w-5 text-destructive shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Migration may have failed</p>
          <p className="text-xs text-muted-foreground">Local data still detected. Tap retry to migrate again.</p>
        </div>
        <Button size="sm" variant="destructive" onClick={() => {
          localStorage.removeItem(MIGRATED_KEY);
          setDismissed(false);
        }}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center gap-3 mb-4">
      <CloudUpload className="h-5 w-5 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">You have local data</p>
        <p className="text-xs text-muted-foreground">Migrate your workouts &amp; health goals to the cloud so they're always saved.</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button size="sm" onClick={handleMigrate} disabled={migrating}>
          {migrating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Migrate"}
        </Button>
        <Button size="sm" variant="ghost" onClick={handleDismiss} disabled={migrating}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MigrateToCloudBanner;
