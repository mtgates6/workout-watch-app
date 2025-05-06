
export type ExerciseType = 'strength';

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  muscleGroups: string[];
  instructions?: string;
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  weight?: number;
  reps?: number;
  duration?: number; // in seconds
  distance?: number; // in meters
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
  date: string;
  duration?: number; // in seconds
  notes?: string;
  completed: boolean;
  planned?: boolean;
}

export interface WorkoutSummary {
  totalWorkouts: number;
  thisWeekWorkouts: number;
  totalDuration: number; // in seconds
  favoriteExercise?: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  workouts: {
    id: string;
    date: string;
    workoutId: string;
  }[];
}
