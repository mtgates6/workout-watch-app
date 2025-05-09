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
  handleSetUpdate: (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: number) => void;
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
    <div key={set.id} className="grid grid-cols-4 gap-2 items-center justify-center">
      <Input
        type="number"
        placeholder="Weight"
        defaultValue={set.weight}
        onChange={(e) => handleSetUpdate(exerciseIndex, setIndex, 'weight', Number(e.target.value))}
        className="w-30"
      />
      <Input
        type="number"
        placeholder="Reps"
        defaultValue={set.reps}
        onChange={(e) => handleSetUpdate(exerciseIndex, setIndex, 'reps', Number(e.target.value))}
        className="w-30"
      />
      <Button
        variant="outline"
        onClick={() => handleSetCompletion(setIndex, exerciseIndex, !set.completed)}
        className="p-1"
      >
        {set.completed ? (
          <CheckCircle2 className="h-3 w-2 text-green-500" />
        ) : (
          <Clock className="h-3 w-2" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
