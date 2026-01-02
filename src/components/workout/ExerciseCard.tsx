
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { WorkoutExercise } from "@/types/workout";
import { SetRow } from "./SetRow";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ExerciseNotes from "./ExerciseNotes";
import ExerciseHistoryDialog from '../ExerciseHistoryDialog';

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  exerciseIndex: number;
  handleRemoveExercise: (exerciseIndex: number) => void;
  handleSetCompletion: (setIndex: number, exerciseIndex: number, completed: boolean) => void;
  handleSetUpdate: (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: number) => void;
  handleRemoveSet: (exerciseIndex: number, setIndex: number) => void;
  handleAddSet: (exerciseIndex: number) => void;
  handleExerciseNotes?: (exerciseId: string, notes: string) => void;
  onShowHistory: (exercise: WorkoutExercise) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  exerciseIndex,
  handleRemoveExercise,
  handleSetCompletion,
  handleSetUpdate,
  handleRemoveSet,
  handleAddSet,
  handleExerciseNotes,
  onShowHistory
}) => {
  const [isOpen, setIsOpen] = useState(false); // Start collapsed
  
  // Calculate completion status
  const totalSets = exercise.sets.length;
  const completedSets = exercise.sets.filter(set => set.completed).length;
  const isCompleted = totalSets > 0 && completedSets === totalSets;
  
  return (
    <Card key={exercise.exercise.id} className={isCompleted ? "border-green-500" : ""}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" className="mr-6" onClick={() => onShowHistory(exercise)}>
              <Clock className="h-4 w-4" />
            </Button>
            <div className="flex items-center">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mr-2">
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <div>
                <CardTitle className="text-xl flex items-center">
                  {exercise.exercise.name}
                  {isCompleted && (
                    <span className="ml-2 bg-green-500 text-white text-xs py-0.5 px-2 rounded-full">
                      Complete
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  {exercise.exercise.muscleGroups.join(", ")} • {completedSets}/{totalSets} sets completed
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center">
              {handleExerciseNotes && (
                <ExerciseNotes 
                  exerciseItem={exercise}
                  onSaveNotes={handleExerciseNotes}
                />
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveExercise(exerciseIndex)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-2 pt-3">
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
            <Button 
              onClick={() => handleAddSet(exerciseIndex)} 
              className="w-full"
              type="button"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Set
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
