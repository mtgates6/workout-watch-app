import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Workout, WorkoutExercise, WorkoutSet, WorkoutSummary, Exercise, PlannedExercise, ExerciseType, MuscleGroup } from "@/types/workout";
import { exercises } from "@/data/exercises";
import { supabase } from "@/integrations/supabase/client";
import { getUserUuid } from "@/context/UserContext";

interface WorkoutContextType {
  workouts: Workout[];
  activeWorkout: Workout | null;
  workoutSummary: WorkoutSummary;
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

function mapWorkoutFromDB(row: any): Workout {
  const workoutExercises: WorkoutExercise[] = (row.workout_exercises || [])
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((ex: any) => ({
      id: ex.id,
      exercise: {
        id: ex.exercise_id,
        name: ex.exercise_name,
        type: ex.exercise_type as ExerciseType,
        muscleGroups: ex.muscle_groups as MuscleGroup[],
        instructions: ex.instructions ?? undefined,
      },
      sets: (ex.workout_sets || [])
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((set: any) => ({
          id: set.id,
          exerciseId: ex.exercise_id,
          weight: set.weight ?? undefined,
          reps: set.reps ?? undefined,
          duration: set.duration ?? undefined,
          distance: set.distance ?? undefined,
          completed: set.completed,
        })),
      notes: ex.notes ?? undefined,
    }));

  const plannedExercises: PlannedExercise[] = (row.planned_exercises || [])
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((pe: any) => ({
      id: pe.exercise_id,
      name: pe.exercise_name,
      type: pe.exercise_type as ExerciseType,
      muscleGroups: pe.muscle_groups as MuscleGroup[],
      instructions: pe.instructions ?? undefined,
      referenceWeight: pe.reference_weight ?? undefined,
      referenceReps: pe.reference_reps ?? undefined,
      previousSets: (pe.planned_exercise_previous_sets || [])
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((ps: any) => ({
          weight: ps.weight ?? undefined,
          reps: ps.reps ?? undefined,
        })),
    }));

  return {
    id: row.id,
    name: row.name,
    date: row.date,
    completed: row.completed,
    planned: row.planned,
    duration: row.duration ?? undefined,
    notes: row.notes ?? undefined,
    exercises: workoutExercises,
    plannedExercises: plannedExercises.length > 0 ? plannedExercises : undefined,
  };
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const userId = getUserUuid();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(() => {
    const saved = localStorage.getItem(ACTIVE_WORKOUT_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [workoutSummary, setWorkoutSummary] = useState<WorkoutSummary>(initialSummary);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const { data, error } = await supabase
        .from("workouts")
        .select(`
          *,
          workout_exercises (
            *,
            workout_sets (*)
          ),
          planned_exercises (
            *,
            planned_exercise_previous_sets (*)
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading workouts:", error);
        return;
      }
      if (data) setWorkouts(data.map(mapWorkoutFromDB));
    };
    load();
  }, []);

  useEffect(() => {
    if (activeWorkout) {
      localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(activeWorkout));
    } else {
      localStorage.removeItem(ACTIVE_WORKOUT_KEY);
    }
  }, [activeWorkout]);

  React.useEffect(() => {
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
      sets: [{
        id: uuidv4(),
        exerciseId: exercise.id,
        completed: false,
      }],
    };

    setActiveWorkout({
      ...activeWorkout,
      exercises: [...activeWorkout.exercises, newExercise],
    });
  };

  const addSetToExercise = (exerciseId: string) => {
    if (!activeWorkout) return;

    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map(ex => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: [...ex.sets, {
              id: uuidv4(),
              exerciseId: ex.exercise.id,
              completed: false,
            }],
          };
        }
        return ex;
      }),
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
            sets: [...ex.sets, {
              id: uuidv4(),
              exerciseId: ex.exercise.id,
              weight: lastSet.weight,
              reps: lastSet.reps,
              completed: false,
            }],
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
      exercises: activeWorkout.exercises.map(ex => {
        if (ex.id === exerciseId) {
          return { ...ex, sets: newSets };
        }
        return ex;
      }),
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

  const completeWorkout = async () => {
    if (!activeWorkout || !userId) return;

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

    // Optimistically update UI
    setWorkouts(prev => [completedWorkout, ...prev]);
    setActiveWorkout(null);

    // Persist to Supabase
    const { error: workoutError } = await supabase.from("workouts").insert({
      id: completedWorkout.id,
      name: completedWorkout.name,
      date: completedWorkout.date,
      completed: true,
      planned: false,
      duration: completedWorkout.duration ?? null,
      notes: completedWorkout.notes ?? null,
      user_id: userId,
    });

    if (workoutError) {
      console.error("Error saving workout:", workoutError);
      return;
    }

    for (const [i, ex] of completedWorkout.exercises.entries()) {
      await supabase.from("workout_exercises").insert({
        id: ex.id,
        workout_id: completedWorkout.id,
        exercise_id: ex.exercise.id,
        exercise_name: ex.exercise.name,
        exercise_type: ex.exercise.type,
        muscle_groups: ex.exercise.muscleGroups,
        instructions: ex.exercise.instructions ?? null,
        notes: ex.notes ?? null,
        sort_order: i,
      });

      if (ex.sets.length > 0) {
        await supabase.from("workout_sets").insert(
          ex.sets.map((set, j) => ({
            id: set.id,
            workout_exercise_id: ex.id,
            weight: set.weight != null ? String(set.weight) : null,
            reps: set.reps != null ? String(set.reps) : null,
            duration: set.duration ?? null,
            distance: set.distance ?? null,
            completed: set.completed,
            sort_order: j,
          }))
        );
      }
    }
  };

  const cancelWorkout = () => {
    setActiveWorkout(null);
  };

  const getWorkout = (id: string) => {
    return workouts.find(workout => workout.id === id);
  };

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

    setWorkouts(prev => [...prev, newWorkout]);

    if (userId) {
      supabase.from("workouts").insert({
        id: newWorkout.id,
        name: newWorkout.name,
        date: newWorkout.date,
        completed: false,
        planned: true,
        user_id: userId,
      }).then(({ error }) => {
        if (error) console.error("Error saving planned workout:", error);
      });
    }

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
    if (!plannedWorkout) return;

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

  const deletePlannedWorkout = async (workoutId: string) => {
    setWorkouts(prev => prev.filter(workout => workout.id !== workoutId));

    await supabase.from("planned_exercises").delete().eq("workout_id", workoutId);
    await supabase.from("workouts").delete().eq("id", workoutId);
  };

  const updatePlannedWorkout = async (workoutId: string, updates: Partial<Workout>) => {
    setWorkouts(prev =>
      prev.map(workout => workout.id === workoutId ? { ...workout, ...updates } : workout)
    );

    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes ?? null;

    if (Object.keys(dbUpdates).length > 0) {
      await supabase.from("workouts").update(dbUpdates).eq("id", workoutId);
    }

    if (updates.plannedExercises !== undefined) {
      await supabase.from("planned_exercises").delete().eq("workout_id", workoutId);

      for (const [i, pe] of updates.plannedExercises.entries()) {
        const peId = uuidv4();
        await supabase.from("planned_exercises").insert({
          id: peId,
          workout_id: workoutId,
          exercise_id: pe.id,
          exercise_name: pe.name,
          exercise_type: pe.type,
          muscle_groups: pe.muscleGroups,
          instructions: pe.instructions ?? null,
          reference_weight: pe.referenceWeight ?? null,
          reference_reps: pe.referenceReps ?? null,
          sort_order: i,
        });

        if (pe.previousSets && pe.previousSets.length > 0) {
          await supabase.from("planned_exercise_previous_sets").insert(
            pe.previousSets.map((ps, j) => ({
              planned_exercise_id: peId,
              weight: ps.weight ?? null,
              reps: ps.reps ?? null,
              sort_order: j,
            }))
          );
        }
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

    setWorkouts(prevWorkouts =>
      prevWorkouts.map(workout => ({
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
