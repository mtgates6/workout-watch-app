
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { WorkoutExercise } from "@/types/workout";
import { SetRow } from "./SetRow";
import { useToast } from "@/hooks/use-toast";

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  exerciseIndex: number;
  handleRemoveExercise: (exerciseIndex: number) => void;
  handleSetCompletion: (setIndex: number, exerciseIndex: number, completed: boolean) => void;
  handleSetUpdate: (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: number) => void;
  handleRemoveSet: (exerciseIndex: number, setIndex: number) => void;
  handleAddSet: (exerciseIndex: number) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  exerciseIndex,
  handleRemoveExercise,
  handleSetCompletion,
  handleSetUpdate,
  handleRemoveSet,
  handleAddSet
}) => {
  return (
    <Card key={exercise.exercise.id}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {exercise.exercise.name}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveExercise(exerciseIndex)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          {exercise.exercise.muscleGroups.join(", ")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {exercise.sets.map((set, setIndex) => (
          <SetRow 
            key={set.id}
            set={set}
            setIndex={setIndex}
            exerciseIndex={exerciseIndex}
            handleSetCompletion={handleSetCompletion}
            handleSetUpdate={handleSetUpdate}
            handleRemoveSet={handleRemoveSet}
          />
        ))}
        <Button onClick={() => handleAddSet(exerciseIndex)} className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Add Set
        </Button>
      </CardContent>
    </Card>
  );
};
