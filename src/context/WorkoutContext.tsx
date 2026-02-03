import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Workout, WorkoutExercise, WorkoutSet, WorkoutSummary, Exercise, PlannedExercise } from "@/types/workout";
import { exercises } from "@/data/exercises";

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

const STORAGE_KEY = "fitness_workout_data";

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    // Load workouts from localStorage on initial render
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return parsedData.workouts || [];
    }
    return [];
  });
  
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(() => {
    // Load active workout from localStorage on initial render
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return parsedData.activeWorkout || null;
    }
    return null;
  });
  
  const [workoutSummary, setWorkoutSummary] = useState<WorkoutSummary>(initialSummary);

  // Save data to localStorage whenever workouts or activeWorkout change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
      workouts, 
      activeWorkout 
    }));
  }, [workouts, activeWorkout]);

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
          return {
            ...ex,
            sets: newSets,
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

    console.log('Updating set:', { exerciseId, setId, updates });

    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map(ex => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.map(set => {
              if (set.id === setId) {
                const updatedSet = { ...set, ...updates };
                console.log('Updated set:', updatedSet);
                return updatedSet;
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

    console.log('Completing workout with exercises:', activeWorkout.exercises);

    // Mark all sets that have weight and reps as completed
    const exercisesWithCompletedSets = activeWorkout.exercises.map(ex => ({
      ...ex,
      sets: ex.sets.map(set => ({
        ...set,
        // Auto-complete sets that have both weight and reps filled in
        completed: set.completed || (typeof set.weight === 'number' && typeof set.reps === 'number' && set.weight > 0 && set.reps > 0)
      }))
    }));

    const completedWorkout: Workout = {
      ...activeWorkout,
      exercises: exercisesWithCompletedSets,
      completed: true,
      duration: 1800, // Example: 30 minutes
    };

    console.log('Completed workout:', completedWorkout);

    setWorkouts([...workouts, completedWorkout]);
    setActiveWorkout(null);
  };

  const cancelWorkout = () => {
    setActiveWorkout(null);
  };

  const getWorkout = (id: string) => {
    return workouts.find((workout) => workout.id === id);
  };
  
  // Functions for planned workouts
  const createPlannedWorkout = (name: string, date: string) => {
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
    console.log('Starting planned workout:', plannedWorkout);
    
    
    if (!plannedWorkout) {
      console.log('Planned workout not found');
      return;
    }
    
    console.log('Found planned workout:', plannedWorkout);
    console.log('Planned exercises:', plannedWorkout.plannedExercises);
    
    // Create a new active workout based on the planned workout
    const newActiveWorkout: Workout = {
      ...plannedWorkout,
      id: uuidv4(), // Generate new ID for the active workout
      date: new Date().toISOString(), // Set current date
      planned: false, // No longer a planned workout
    };
    
    // If there are planned exercises, add them to the workout
    if (plannedWorkout.plannedExercises && plannedWorkout.plannedExercises.length > 0) {
      console.log('Converting planned exercises to workout exercises');
      newActiveWorkout.exercises = plannedWorkout.plannedExercises.map((exercise: PlannedExercise) => {
        // Check if this exercise has reference data from a repeated workout
        const hasReferenceData = exercise.referenceWeight !== undefined || exercise.referenceReps !== undefined;
        
        let initialSets;
        
        if (hasReferenceData && exercise.previousSets && exercise.previousSets.length > 0) {
          // Create sets based on the previous workout's completed sets
          initialSets = exercise.previousSets.map(prevSet => ({
            id: uuidv4(),
            exerciseId: exercise.id,
            weight: prevSet.weight,
            reps: prevSet.reps,
            completed: false,
          }));
        } else {
          // Create a single empty set
          initialSets = [{
            id: uuidv4(),
            exerciseId: exercise.id,
            completed: false,
          }];
        }

        return {
          id: uuidv4(),
          exercise: {
            id: exercise.id,
            name: exercise.name,
            type: exercise.type,
            muscleGroups: exercise.muscleGroups,
            instructions: exercise.instructions
          },
          sets: initialSets,
        };
      });
    }
    
    console.log('New active workout created:', newActiveWorkout);
    setActiveWorkout(newActiveWorkout);
  };
  
  const deletePlannedWorkout = (workoutId: string) => {
    setWorkouts(prev => prev.filter(workout => workout.id !== workoutId));
  };
  
  // New function to update planned workout
  const updatePlannedWorkout = (workoutId: string, updates: Partial<Workout>) => {
    setWorkouts(prev => 
      prev.map(workout => 
        workout.id === workoutId 
          ? { ...workout, ...updates }
          : workout
      )
    );
  };

  const reorderExercises = (newExercises: WorkoutExercise[]) => {
    if (!activeWorkout) return;
    setActiveWorkout({
      ...activeWorkout,
      exercises: newExercises,
    });
  };

  // Add the new updateExerciseNotes function
  const updateExerciseNotes = (exerciseId: string, notes: string) => {
    if (!activeWorkout) return;

    // Update notes for an exercise in the active workout
    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map(ex => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            notes: notes,
          };
        }
        return ex;
      }),
    });

    // If the exercise is in a completed workout in history, update it there too
    setWorkouts(prevWorkouts => 
      prevWorkouts.map(workout => ({
        ...workout,
        exercises: workout.exercises.map(ex => {
          if (ex.id === exerciseId) {
            return {
              ...ex,
              notes: notes,
            };
          }
          return ex;
        }),
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
        updateExerciseNotes
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
