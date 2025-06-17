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
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const WorkoutView = () => {
  const {
    activeWorkout,
    completeWorkout,
    updateSet,
    removeExerciseFromWorkout,
    removeSetFromExercise,
    reorderExercises,
    addSetToExercise,
    addExerciseToWorkout,
    updateExerciseNotes,
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

  const handleSetUpdate = (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string | number) => {
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
    navigate("/history");
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

  const handleExerciseNotes = (exerciseId: string, notes: string) => {
    updateExerciseNotes(exerciseId, notes);
  };

  const calculateWorkoutTime = (workout: any) => {
    const now = new Date();
    const workoutDate = new Date(workout.date);
    const diff = now.getTime() - workoutDate.getTime();
    return Math.floor(diff / 60000);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(activeWorkout.exercises);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    reorderExercises(reordered);
  };
  
  if (!activeWorkout) {
    return <NoActiveWorkout />;
  }
  
  const allExercisesComplete = activeWorkout.exercises.every(
    (exercise) =>
      exercise.sets.length > 0 &&
      exercise.sets.every((set) => set.completed)
  );


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
          <Button
            onClick={handleEndWorkout}
            variant="outline"
            className="bg-green-500 hover:bg-green-600 text-white hover:text-white"
            disabled={!allExercisesComplete}
          >
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
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="exercise-list">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-4"
              >
                {activeWorkout.exercises.map((exercise, exerciseIndex) => (
                  <Draggable
                    key={exercise.id || exercise.exercise.id}
                    draggableId={String(exercise.id || exercise.exercise.id)}
                    index={exerciseIndex}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <ExerciseCard
                          exercise={exercise}
                          exerciseIndex={exerciseIndex}
                          handleRemoveExercise={handleRemoveExercise}
                          handleSetCompletion={handleSetCompletion}
                          handleSetUpdate={handleSetUpdate}
                          handleRemoveSet={handleRemoveSet}
                          handleAddSet={handleAddSet}
                          handleExerciseNotes={handleExerciseNotes}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
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
