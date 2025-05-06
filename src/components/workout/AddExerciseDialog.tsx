
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { Exercise, MuscleGroup } from "@/types/workout";
import { exercises } from "@/data/exercises";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddExerciseDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  handleAddExercise: (exercise: Exercise) => void;
}

const muscleGroups: MuscleGroup[] = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'quads',
  'hamstrings',
  'glutes',
  'calves',
  'core'
];

export const AddExerciseDialog: React.FC<AddExerciseDialogProps> = ({
  showDialog,
  setShowDialog,
  handleAddExercise
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | "all">("all");

  const filteredExercises = exercises.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedMuscleGroup === "all" || exercise.muscleGroups.includes(selectedMuscleGroup as MuscleGroup))
  );

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button className="bg-fitness-primary hover:bg-fitness-secondary">
          <Plus className="mr-1 h-4 w-4" /> Add Exercise
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Exercise</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Input 
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              value={selectedMuscleGroup}
              onValueChange={(value) => setSelectedMuscleGroup(value as MuscleGroup | "all")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Muscle Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Muscle Groups</SelectItem>
                {muscleGroups.map((group) => (
                  <SelectItem key={group} value={group} className="capitalize">
                    {group.charAt(0).toUpperCase() + group.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {filteredExercises.length > 0 ? (
              filteredExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  onClick={() => handleAddExercise(exercise)}
                  className="p-3 border rounded-md cursor-pointer hover:bg-accent"
                >
                  <div className="font-medium">{exercise.name}</div>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-1 mt-1">
                    {exercise.muscleGroups.map((group) => (
                      <span key={group} className="bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-sm capitalize">
                        {group}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No exercises found
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
