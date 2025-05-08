
import React, { useState } from "react";
import { useWorkout } from "@/context/WorkoutContext";
import { Button } from "@/components/ui/button";
import { Exercise } from "@/types/workout";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ExerciseCard } from "./workout/ExerciseCard";
import { AddExerciseDialog } from "./workout/AddExerciseDialog";
import { NoActiveWorkout } from "./workout/NoActiveWorkout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

const WorkoutView = () => {
  const {
    activeWorkout,
    completeWorkout,
    updateSet,
    removeExerciseFromWorkout,
    removeSetFromExercise,
    addSetToExercise,
    addExerciseToWorkout,
  } = useWorkout();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [showAddExerciseDialog, setShowAddExerciseDialog] = useState(false);

  const handleSetCompletion = (setIndex: number, exerciseIndex: number, completed: boolean) => {
    if (activeWorkout) {
      const exerciseId = activeWorkout.exercises[exerciseIndex].id;
      const setId = activeWorkout.exercises[exerciseIndex].sets[setIndex].id;
      updateSet(exerciseId, setId, { completed });
    }
  };

  const handleSetUpdate = (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: number) => {
    if (activeWorkout) {
      const exerciseId = activeWorkout.exercises[exerciseIndex].id;
      const setId = activeWorkout.exercises[exerciseIndex].sets[setIndex].id;
      updateSet(exerciseId, setId, { [field]: value });
    }
  };

  const handleEndWorkout = () => {
    completeWorkout();
    toast({
      title: "Workout Ended",
      description: "Your workout has been saved to history.",
    });
    navigate("/");
  };

  const handleRemoveExercise = (exerciseIndex: number) => {
    if (activeWorkout) {
      const exerciseId = activeWorkout.exercises[exerciseIndex].id;
      removeExerciseFromWorkout(exerciseId);
      toast({
        title: "Exercise Removed",
        description: "Exercise removed from your workout.",
      });
    }
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    if (activeWorkout) {
      const exerciseId = activeWorkout.exercises[exerciseIndex].id;
      const setId = activeWorkout.exercises[exerciseIndex].sets[setIndex].id;
      removeSetFromExercise(exerciseId, setId);
      toast({
        title: "Set Removed",
        description: "Set removed from exercise.",
      });
    }
  };

  const handleAddSet = (exerciseIndex: number) => {
    if (activeWorkout) {
      const exerciseId = activeWorkout.exercises[exerciseIndex].id;
      addSetToExercise(exerciseId);
      toast({
        title: "Set Added",
        description: "Set added to exercise.",
      });
    }
  };

  const handleAddExercise = (exercise: Exercise) => {
    addExerciseToWorkout(exercise);
    setShowAddExerciseDialog(false);
    toast({
      title: "Exercise Added",
      description: `${exercise.name} added to your workout`,
    });
  };

  const calculateWorkoutTime = (workout: any) => {
    const now = new Date();
    const workoutDate = new Date(workout.date);
    const diff = now.getTime() - workoutDate.getTime();
    return Math.floor(diff / 60000);
  };
  
  if (!activeWorkout) {
    return <NoActiveWorkout />;
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{activeWorkout.name}</h1>
          <p className="text-muted-foreground">
            {new Date(activeWorkout.date).toLocaleDateString()} •{" "}
            {calculateWorkoutTime(activeWorkout)} minutes
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleEndWorkout} variant="outline">
            End Workout
          </Button>
          <AddExerciseDialog 
            showDialog={showAddExerciseDialog}
            setShowDialog={setShowAddExerciseDialog}
            handleAddExercise={handleAddExercise}
          />
        </div>
      </div>

      {activeWorkout.exercises.length > 0 ? (
        <div className="space-y-4">
          {activeWorkout.exercises.map((exercise, exerciseIndex) => (
            <ExerciseCard
              key={exercise.id || exercise.exercise.id}
              exercise={exercise}
              exerciseIndex={exerciseIndex}
              handleRemoveExercise={handleRemoveExercise}
              handleSetCompletion={handleSetCompletion}
              handleSetUpdate={handleSetUpdate}
              handleRemoveSet={handleRemoveSet}
              handleAddSet={handleAddSet}
            />
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 text-center">
          <CardHeader>
            <CardTitle className="text-xl">Add your first exercise</CardTitle>
            <CardDescription>Get started by adding exercises to your workout</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setShowAddExerciseDialog(true)}
              className="bg-fitness-primary hover:bg-fitness-secondary"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Exercise
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkoutView;
