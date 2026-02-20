import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Workout, WorkoutExercise, WorkoutSet, WorkoutSummary, Exercise, PlannedExercise } from "@/types/workout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface WorkoutContextType {
  workouts: Workout[];
  activeWorkout: Workout | null;
  workoutSummary: WorkoutSummary;
  loading: boolean;
  startWorkout: (name: string) => void;
  addExerciseToWorkout: (exercise: Exercise) => void;
  removeExerciseFromWorkout: (exerciseId: String) => void;
  addSetToExercise: (exerciseId: string) => void;
  duplicateLastSet: (exerciseId: string) => void;
  removeSetFromExercise: (exerciseId: string, setId: string) => void;
  updateSet: (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => void;
  reorderSets: (exerciseId: string, newSets: WorkoutSet[]) => void;
  completeWorkout: () => void;
  cancelWorkout: () => void;
  getWorkout: (id: string) => Workout | undefined;
  createPlannedWorkout: (name: string, date: string) => Workout;
  getWorkoutsByDate: (date: string) => Workout[];
  startPlannedWorkout: (plannedWorkout: Workout) => void;
  deletePlannedWorkout: (workoutId: string) => void;
  updatePlannedWorkout: (workoutId: string, updates: Partial<Workout>) => void;
  reorderExercises: (newExercises: WorkoutExercise[]) => void;
  updateExerciseNotes: (exerciseId: string, notes: string) => void;
}

const initialSummary: WorkoutSummary = {
  totalWorkouts: 0,
  thisWeekWorkouts: 0,
  totalDuration: 0,
};

const ACTIVE_WORKOUT_KEY = "fitness_active_workout";

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

// ---------- DB helpers ----------

async function dbSaveWorkout(workout: Workout, userId: string): Promise<void> {
  const { error } = await supabase
    .from("workouts")
    .upsert({
      id: workout.id,
      user_id: userId,
      name: workout.name,
      date: workout.date,
      duration: workout.duration ?? null,
      notes: workout.notes ?? null,
      completed: workout.completed,
      planned: workout.planned ?? false,
    });
  if (error) throw error;
}

async function dbSaveExercises(workoutId: string, exercises: WorkoutExercise[]): Promise<void> {
  // Delete existing exercises and re-insert (simplest approach for reordering)
  await supabase.from("workout_exercises").delete().eq("workout_id", workoutId);

  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    const { data: dbEx, error: exError } = await supabase
      .from("workout_exercises")
      .insert({
        id: ex.id,
        workout_id: workoutId,
        exercise_id: ex.exercise.id,
        exercise_name: ex.exercise.name,
        exercise_type: ex.exercise.type,
        muscle_groups: ex.exercise.muscleGroups,
        instructions: ex.exercise.instructions ?? null,
        notes: ex.notes ?? null,
        sort_order: i,
      })
      .select()
      .single();
    if (exError) throw exError;

    for (let j = 0; j < ex.sets.length; j++) {
      const set = ex.sets[j];
      const { error: setError } = await supabase
        .from("workout_sets")
        .insert({
          id: set.id,
          workout_exercise_id: dbEx.id,
          weight: set.weight !== undefined ? String(set.weight) : null,
          reps: set.reps !== undefined ? String(set.reps) : null,
          duration: set.duration ?? null,
          distance: set.distance ?? null,
          completed: set.completed,
          sort_order: j,
        });
      if (setError) throw setError;
    }
  }
}

async function dbSavePlannedExercises(workoutId: string, plannedExercises: PlannedExercise[]): Promise<void> {
  await supabase.from("planned_exercises").delete().eq("workout_id", workoutId);

  for (let i = 0; i < plannedExercises.length; i++) {
    const pe = plannedExercises[i];
    const { data: dbPe, error: peError } = await supabase
      .from("planned_exercises")
      .insert({
        id: pe.id,
        workout_id: workoutId,
        exercise_id: pe.id,
        exercise_name: pe.name,
        exercise_type: pe.type,
        muscle_groups: pe.muscleGroups,
        instructions: pe.instructions ?? null,
        reference_weight: pe.referenceWeight ?? null,
        reference_reps: pe.referenceReps ?? null,
        sort_order: i,
      })
      .select()
      .single();
    if (peError) throw peError;

    if (pe.previousSets && pe.previousSets.length > 0) {
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

async function dbDeleteWorkout(workoutId: string): Promise<void> {
  await supabase.from("workouts").delete().eq("id", workoutId);
}

async function dbLoadWorkouts(userId: string): Promise<Workout[]> {
  const { data: workoutRows, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) throw error;
  if (!workoutRows || workoutRows.length === 0) return [];

  const workouts: Workout[] = [];

  for (const row of workoutRows) {
    // Load exercises
    const { data: exRows } = await supabase
      .from("workout_exercises")
      .select("*")
      .eq("workout_id", row.id)
      .order("sort_order");

    const exercises: WorkoutExercise[] = [];
    for (const exRow of (exRows ?? [])) {
      const { data: setRows } = await supabase
        .from("workout_sets")
        .select("*")
        .eq("workout_exercise_id", exRow.id)
        .order("sort_order");

      exercises.push({
        id: exRow.id,
        exercise: {
          id: exRow.exercise_id,
          name: exRow.exercise_name,
          type: exRow.exercise_type as any,
          muscleGroups: exRow.muscle_groups as any[],
          instructions: exRow.instructions ?? undefined,
        },
        sets: (setRows ?? []).map(s => ({
          id: s.id,
          exerciseId: exRow.exercise_id,
          weight: s.weight ?? undefined,
          reps: s.reps ?? undefined,
          duration: s.duration ?? undefined,
          distance: s.distance ?? undefined,
          completed: s.completed,
        })),
        notes: exRow.notes ?? undefined,
      });
    }

    // Load planned exercises
    const { data: peRows } = await supabase
      .from("planned_exercises")
      .select("*")
      .eq("workout_id", row.id)
      .order("sort_order");

    const plannedExercises: PlannedExercise[] = [];
    for (const peRow of (peRows ?? [])) {
      const { data: psRows } = await supabase
        .from("planned_exercise_previous_sets")
        .select("*")
        .eq("planned_exercise_id", peRow.id)
        .order("sort_order");

      plannedExercises.push({
        id: peRow.exercise_id,
        name: peRow.exercise_name,
        type: peRow.exercise_type as any,
        muscleGroups: peRow.muscle_groups as any[],
        instructions: peRow.instructions ?? undefined,
        referenceWeight: peRow.reference_weight ?? undefined,
        referenceReps: peRow.reference_reps ?? undefined,
        previousSets: (psRows ?? []).map(ps => ({
          weight: ps.weight ?? undefined,
          reps: ps.reps ?? undefined,
        })),
      });
    }

    workouts.push({
      id: row.id,
      name: row.name,
      date: row.date,
      duration: row.duration ?? undefined,
      notes: row.notes ?? undefined,
      completed: row.completed,
      planned: row.planned,
      exercises,
      plannedExercises,
    });
  }

  return workouts;
}

// ---------- Provider ----------

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(() => {
    const saved = localStorage.getItem(ACTIVE_WORKOUT_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [workoutSummary, setWorkoutSummary] = useState<WorkoutSummary>(initialSummary);

  // Persist active workout to localStorage (it's in-progress, not saved to DB yet)
  useEffect(() => {
    if (activeWorkout) {
      localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(activeWorkout));
    } else {
      localStorage.removeItem(ACTIVE_WORKOUT_KEY);
    }
  }, [activeWorkout]);

  // Load workouts from DB when user is ready
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    dbLoadWorkouts(user.id)
      .then(setWorkouts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  // Calculate workout summary whenever workouts change
  useEffect(() => {
    if (workouts.length === 0) {
      setWorkoutSummary(initialSummary);
      return;
    }

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const thisWeekWorkouts = workouts.filter(
      workout => new Date(workout.date) >= startOfWeek && workout.completed
    ).length;

    const totalDuration = workouts
      .filter(workout => workout.completed && workout.duration)
      .reduce((total, workout) => total + (workout.duration || 0), 0);

    const exerciseFrequency: Record<string, number> = {};
    workouts.forEach(workout => {
      workout.exercises.forEach(ex => {
        exerciseFrequency[ex.exercise.name] = (exerciseFrequency[ex.exercise.name] || 0) + 1;
      });
    });

    let favoriteExercise: string | undefined;
    let maxFrequency = 0;
    Object.entries(exerciseFrequency).forEach(([name, frequency]) => {
      if (frequency > maxFrequency) {
        maxFrequency = frequency;
        favoriteExercise = name;
      }
    });

    setWorkoutSummary({
      totalWorkouts: workouts.filter(w => w.completed).length,
      thisWeekWorkouts,
      totalDuration,
      favoriteExercise,
    });
  }, [workouts]);

  const startWorkout = (name: string) => {
    const newWorkout: Workout = {
      id: uuidv4(),
      name,
      exercises: [],
      date: new Date().toISOString(),
      completed: false,
    };
    setActiveWorkout(newWorkout);
  };

  const addExerciseToWorkout = (exercise: Exercise) => {
    if (!activeWorkout) return;
    const newExercise: WorkoutExercise = {
      id: uuidv4(),
      exercise,
      sets: [{ id: uuidv4(), exerciseId: exercise.id, completed: false }],
    };
    setActiveWorkout({ ...activeWorkout, exercises: [...activeWorkout.exercises, newExercise] });
  };

  const addSetToExercise = (exerciseId: string) => {
    if (!activeWorkout) return;
    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map(ex =>
        ex.id === exerciseId
          ? { ...ex, sets: [...ex.sets, { id: uuidv4(), exerciseId: ex.exercise.id, completed: false }] }
          : ex
      ),
    });
  };

  const duplicateLastSet = (exerciseId: string) => {
    if (!activeWorkout) return;
    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map(ex => {
        if (ex.id === exerciseId && ex.sets.length > 0) {
          const lastSet = ex.sets[ex.sets.length - 1];
          return {
            ...ex,
            sets: [...ex.sets, { id: uuidv4(), exerciseId: ex.exercise.id, weight: lastSet.weight, reps: lastSet.reps, completed: false }],
          };
        }
        return ex;
      }),
    });
  };

  const reorderSets = (exerciseId: string, newSets: WorkoutSet[]) => {
    if (!activeWorkout) return;
    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map(ex =>
        ex.id === exerciseId ? { ...ex, sets: newSets } : ex
      ),
    });
  };

  const removeExerciseFromWorkout = (exerciseId: String) => {
    if (!activeWorkout) return;
    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.filter(ex => ex.id !== exerciseId),
    });
  };

  const removeSetFromExercise = (exerciseId: string, setId: string) => {
    if (!activeWorkout) return;
    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map(ex => {
        if (ex.id === exerciseId) {
          if (ex.sets.length <= 1) return ex;
          return { ...ex, sets: ex.sets.filter(set => set.id !== setId) };
        }
        return ex;
      }),
    });
  };

  const updateSet = (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => {
    if (!activeWorkout) return;
    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map(ex => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.map(set => set.id === setId ? { ...set, ...updates } : set),
          };
        }
        return ex;
      }),
    });
  };

  const completeWorkout = useCallback(async () => {
    if (!activeWorkout || !user) return;

    const exercisesWithCompletedSets = activeWorkout.exercises.map(ex => ({
      ...ex,
      sets: ex.sets.map(set => ({
        ...set,
        completed: set.completed || (typeof set.weight === 'number' && typeof set.reps === 'number' && set.weight > 0 && set.reps > 0),
      })),
    }));

    const completedWorkout: Workout = {
      ...activeWorkout,
      exercises: exercisesWithCompletedSets,
      completed: true,
      duration: 1800,
    };

    try {
      await dbSaveWorkout(completedWorkout, user.id);
      await dbSaveExercises(completedWorkout.id, completedWorkout.exercises);
      setWorkouts(prev => [completedWorkout, ...prev]);
      setActiveWorkout(null);
    } catch (err) {
      console.error("Failed to save workout:", err);
    }
  }, [activeWorkout, user]);

  const cancelWorkout = () => {
    setActiveWorkout(null);
  };

  const getWorkout = (id: string) => workouts.find(w => w.id === id);

  const createPlannedWorkout = (name: string, date: string): Workout => {
    const newWorkout: Workout = {
      id: uuidv4(),
      name,
      exercises: [],
      date,
      completed: false,
      planned: true,
      plannedExercises: [],
    };

    if (user) {
      dbSaveWorkout(newWorkout, user.id).catch(console.error);
    }
    setWorkouts(prev => [...prev, newWorkout]);
    return newWorkout;
  };

  const getWorkoutsByDate = (dateString: string) => {
    const date = new Date(dateString);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= startOfDay && workoutDate <= endOfDay;
    });
  };

  const startPlannedWorkout = (plannedWorkout: Workout) => {
    const newActiveWorkout: Workout = {
      ...plannedWorkout,
      id: uuidv4(),
      date: new Date().toISOString(),
      planned: false,
    };

    if (plannedWorkout.plannedExercises && plannedWorkout.plannedExercises.length > 0) {
      newActiveWorkout.exercises = plannedWorkout.plannedExercises.map((exercise: PlannedExercise) => {
        const hasReferenceData = exercise.referenceWeight !== undefined || exercise.referenceReps !== undefined;
        let initialSets;

        if (hasReferenceData && exercise.previousSets && exercise.previousSets.length > 0) {
          initialSets = exercise.previousSets.map(prevSet => ({
            id: uuidv4(),
            exerciseId: exercise.id,
            weight: prevSet.weight,
            reps: prevSet.reps,
            completed: false,
          }));
        } else {
          initialSets = [{ id: uuidv4(), exerciseId: exercise.id, completed: false }];
        }

        return {
          id: uuidv4(),
          exercise: {
            id: exercise.id,
            name: exercise.name,
            type: exercise.type,
            muscleGroups: exercise.muscleGroups,
            instructions: exercise.instructions,
          },
          sets: initialSets,
        };
      });
    }

    setActiveWorkout(newActiveWorkout);
  };

  const deletePlannedWorkout = (workoutId: string) => {
    if (user) {
      dbDeleteWorkout(workoutId).catch(console.error);
    }
    setWorkouts(prev => prev.filter(w => w.id !== workoutId));
  };

  const updatePlannedWorkout = async (workoutId: string, updates: Partial<Workout>) => {
    setWorkouts(prev =>
      prev.map(workout => workout.id === workoutId ? { ...workout, ...updates } : workout)
    );

    const updatedWorkout = workouts.find(w => w.id === workoutId);
    if (updatedWorkout && user) {
      const merged = { ...updatedWorkout, ...updates };
      try {
        await dbSaveWorkout(merged, user.id);
        if (updates.plannedExercises) {
          await dbSavePlannedExercises(workoutId, updates.plannedExercises);
        }
      } catch (err) {
        console.error("Failed to update planned workout:", err);
      }
    }
  };

  const reorderExercises = (newExercises: WorkoutExercise[]) => {
    if (!activeWorkout) return;
    setActiveWorkout({ ...activeWorkout, exercises: newExercises });
  };

  const updateExerciseNotes = (exerciseId: string, notes: string) => {
    if (!activeWorkout) return;
    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map(ex =>
        ex.id === exerciseId ? { ...ex, notes } : ex
      ),
    });
    setWorkouts(prev =>
      prev.map(workout => ({
        ...workout,
        exercises: workout.exercises.map(ex =>
          ex.id === exerciseId ? { ...ex, notes } : ex
        ),
      }))
    );
  };

  return (
    <WorkoutContext.Provider
      value={{
        workouts,
        activeWorkout,
        workoutSummary,
        loading,
        startWorkout,
        addExerciseToWorkout,
        removeExerciseFromWorkout,
        addSetToExercise,
        duplicateLastSet,
        removeSetFromExercise,
        updateSet,
        reorderSets,
        completeWorkout,
        cancelWorkout,
        getWorkout,
        createPlannedWorkout,
        getWorkoutsByDate,
        startPlannedWorkout,
        deletePlannedWorkout,
        updatePlannedWorkout,
        reorderExercises,
        updateExerciseNotes,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = (): WorkoutContextType => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
};
