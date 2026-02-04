
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Trash2, GripVertical } from "lucide-react";
import { WorkoutSet } from "@/types/workout";
import { Draggable } from "react-beautiful-dnd";

interface SetRowProps {
  set: WorkoutSet;
  setIndex: number;
  exerciseIndex: number;
  handleSetCompletion: (setIndex: number, exerciseIndex: number, completed: boolean) => void;
  handleSetUpdate: (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string | number) => void;
  handleRemoveSet: (exerciseIndex: number, setIndex: number) => void;
  isDraggable?: boolean;
}

export const SetRow: React.FC<SetRowProps> = ({
  set,
  setIndex,
  exerciseIndex,
  handleSetCompletion,
  handleSetUpdate,
  handleRemoveSet,
  isDraggable = true
}) => {
  const content = (provided?: any) => (
    <div 
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center"
    >
      {isDraggable && (
        <div 
          {...provided?.dragHandleProps} 
          className="cursor-grab active:cursor-grabbing p-1"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <Input
        type="text"
        placeholder="Weight"
        value={set.weight ?? ''}
        onChange={(e) => {
          handleSetUpdate(exerciseIndex, setIndex, 'weight', e.target.value);
        }}
        className='p-2 w-full'
      />
      <Input
        type="text"
        placeholder="Reps"
        value={set.reps ?? ''}
        onChange={(e) => {
          handleSetUpdate(exerciseIndex, setIndex, 'reps', e.target.value);
        }}
        className='p-2 w-full'
      />
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => handleSetCompletion(setIndex, exerciseIndex, !set.completed)}
          className="p-0 w-10 h-10"
        >
          {set.completed ? (
            <CheckCircle2 className="h-3 w-3 text-green-500" />
          ) : (
            <Clock className="h-3 w-3 hover:text-green-500" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
          className="p-0"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );

  if (isDraggable) {
    return (
      <Draggable draggableId={set.id} index={setIndex}>
        {(provided) => content(provided)}
      </Draggable>
    );
  }

  return content();
};
