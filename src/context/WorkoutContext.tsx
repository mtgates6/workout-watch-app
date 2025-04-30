import React, { createContext, useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Workout, WorkoutExercise, WorkoutSet, WorkoutSummary, Exercise } from "@/types/workout";
import { exercises } from "@/data/exercises";

interface WorkoutContextType {
  workouts: Workout[];
  activeWorkout: Workout | null;
  workoutSummary: WorkoutSummary;
  startWorkout: (name: string) => void;
  addExerciseToWorkout: (exercise: Exercise) => void;
  removeExerciseFromWorkout: (exerciseId: String) => void;
  addSetToExercise: (exerciseId: string) => void;
  removeSetFromExercise: (exerciseId: string, setId: string) => void;
  updateSet: (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => void;
  completeWorkout: () => void;
  cancelWorkout: () => void;
  getWorkout: (id: string) => Workout | undefined;
}

const initialSummary: WorkoutSummary = {
  totalWorkouts: 0,
  thisWeekWorkouts: 0,
  totalDuration: 0,
};

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [workoutSummary, setWorkoutSummary] = useState<WorkoutSummary>(initialSummary);

  // Calculate workout summary whenever workouts change
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

    // Find favorite exercise based on frequency
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

  const removeExerciseFromWorkout = (exerciseId : String) => {
    if (!activeWorkout) return;
      
      setActiveWorkout({
        ...activeWorkout,
        exercises: activeWorkout.exercises.filter(ex => ex.id !== exerciseId),
      });
    }

  const removeSetFromExercise = (exerciseId: string, setId: string) => {
    if (!activeWorkout) return;

    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map(ex => {
        if (ex.id === exerciseId) {
          // Don't allow removing the last set
          if (ex.sets.length <= 1) {
            return ex;
          }
          
          return {
            ...ex,
            sets: ex.sets.filter(set => set.id !== setId),
          };
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
            sets: ex.sets.map(set => {
              if (set.id === setId) {
                return { ...set, ...updates };
              }
              return set;
            }),
          };
        }
        return ex;
      }),
    });
  };

  const completeWorkout = () => {
    if (!activeWorkout) return;

    const completedWorkout: Workout = {
      ...activeWorkout,
      completed: true,
      duration: 1800, // Example: 30 minutes
    };

    setWorkouts([...workouts, completedWorkout]);
    setActiveWorkout(null);
  };

  const cancelWorkout = () => {
    setActiveWorkout(null);
  };

  const getWorkout = (id: string) => {
    return workouts.find((workout) => workout.id === id);
  };

  return (
    <WorkoutContext.Provider
      value={{
        workouts,
        activeWorkout,
        workoutSummary,
        startWorkout,
        addExerciseToWorkout,
        addSetToExercise,
        removeSetFromExercise,
        updateSet,
        completeWorkout,
        cancelWorkout,
        getWorkout,
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
