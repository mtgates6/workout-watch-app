
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, ChevronDown, ChevronUp, Clock, Copy } from "lucide-react";
import { WorkoutExercise, WorkoutSet } from "@/types/workout";
import { SetRow } from "./SetRow";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ExerciseNotes from "./ExerciseNotes";
import ExerciseHistoryDialog from '../ExerciseHistoryDialog';
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  exerciseIndex: number;
  handleRemoveExercise: (exerciseIndex: number) => void;
  handleSetCompletion: (setIndex: number, exerciseIndex: number, completed: boolean) => void;
  handleSetUpdate: (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: number) => void;
  handleRemoveSet: (exerciseIndex: number, setIndex: number) => void;
  handleAddSet: (exerciseIndex: number) => void;
  handleDuplicateLastSet: (exerciseIndex: number) => void;
  handleReorderSets: (exerciseIndex: number, newSets: WorkoutSet[]) => void;
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
  handleDuplicateLastSet,
  handleReorderSets,
  handleExerciseNotes,
  onShowHistory
}) => {
  const [isOpen, setIsOpen] = useState(false); // Start collapsed
  
  // Calculate completion status
  const totalSets = exercise.sets.length;
  const completedSets = exercise.sets.filter(set => set.completed).length;
  const isCompleted = totalSets > 0 && completedSets === totalSets;

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const reorderedSets = Array.from(exercise.sets);
    const [movedItem] = reorderedSets.splice(result.source.index, 1);
    reorderedSets.splice(result.destination.index, 0, movedItem);
    
    handleReorderSets(exerciseIndex, reorderedSets);
  };
  
  return (
    <Card key={exercise.exercise.id} className={isCompleted ? "border-green-500" : ""}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex flex-col items-center justify-center justify-between">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mr-6" onClick={() => onShowHistory(exercise)}>
                  <Clock className="h-4 w-4" />
                </Button>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mr-6">
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
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
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId={`sets-${exercise.id}`}>
                {(provided) => (
                  <div 
                    ref={provided.innerRef} 
                    {...provided.droppableProps}
                    className="space-y-2"
                  >
                    {exercise.sets.map((set, setIndex) => (
                      <SetRow 
                        key={set.id}
                        set={set}
                        setIndex={setIndex}
                        exerciseIndex={exerciseIndex}
                        handleSetCompletion={handleSetCompletion}
                        handleSetUpdate={handleSetUpdate}
                        handleRemoveSet={handleRemoveSet}
                        isDraggable={true}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleAddSet(exerciseIndex)} 
                className="flex-1"
                type="button"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Set
              </Button>
              <Button 
                onClick={() => handleDuplicateLastSet(exerciseIndex)} 
                variant="secondary"
                className="flex-1"
                type="button"
                disabled={exercise.sets.length === 0}
              >
                <Copy className="mr-2 h-4 w-4" /> Copy Last
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
