
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Trash2 } from "lucide-react";
import { WorkoutSet } from "@/types/workout";

interface SetRowProps {
  set: WorkoutSet;
  setIndex: number;
  exerciseIndex: number;
  handleSetCompletion: (setIndex: number, exerciseIndex: number, completed: boolean) => void;
  handleSetUpdate: (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string | number) => void;
  handleRemoveSet: (exerciseIndex: number, setIndex: number) => void;
}

export const SetRow: React.FC<SetRowProps> = ({
  set,
  setIndex,
  exerciseIndex,
  handleSetCompletion,
  handleSetUpdate,
  handleRemoveSet
}) => {
  return (
    <div key={set.id} className="grid grid-cols-3 gap-2 items-center justify-between">
      <Input
        type="text"
        placeholder="Weight"
        value={set.weight ?? ''}
        onChange={(e) => {
            handleSetUpdate(exerciseIndex, setIndex, 'weight', e.target.value);
          }
        }
        className='p-2 w-full'
      />
      <Input
        type="text"
        placeholder="Reps"
        value={set.reps ?? ''}
        onChange={(e) => {
          handleSetUpdate(exerciseIndex, setIndex, 'reps', e.target.value);
          }
        }
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
};
