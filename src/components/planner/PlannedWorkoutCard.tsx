
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";
import { Workout } from "@/types/workout";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";

interface PlannedWorkoutCardProps {
  workout: Workout;
  handleOpenPlanDialog: (workout: Workout) => void;
  handleDeletePlannedWorkout: (workout: Workout) => void;
  handleUpdateWorkoutName?: (workoutId: string, newName: string) => void;
}

export const PlannedWorkoutCard: React.FC<PlannedWorkoutCardProps> = ({
  workout,
  handleOpenPlanDialog,
  handleDeletePlannedWorkout,
  handleUpdateWorkoutName,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(workout.name);

  const handleSaveName = () => {
    if (editedName.trim() && handleUpdateWorkoutName) {
      handleUpdateWorkoutName(workout.id, editedName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setEditedName(workout.name);
      setIsEditing(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-2">
        {isEditing ? (
          <div className="flex items-center">
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={handleKeyDown}
              className="h-6 py-1 text-sm"
              autoFocus
            />
          </div>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <CardTitle className="text-sm cursor-default flex items-center justify-between">
                  <span>{workout.name}</span>
                  {handleUpdateWorkoutName && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={() => setIsEditing(true)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  )}
                </CardTitle>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-sm">
                <div className="p-1">
                  {workout.plannedExercises && workout.plannedExercises.length > 0 ? (
                    <>
                      <h4 className="font-semibold mb-1">Planned Exercises:</h4>
                      <ul className="list-disc pl-4 mb-2">
                        {workout.plannedExercises.map((exercise) => (
                          <li key={exercise.id}>{exercise.name}</li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="text-muted-foreground">No exercises planned yet</p>
                  )}
                  
                  {workout.notes && (
                    <div className="mt-2 border-t pt-1">
                      <h4 className="font-semibold mb-1">Notes:</h4>
                      <p className="text-sm">{workout.notes}</p>
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardHeader>
      <CardFooter className="p-2 pt-0 flex justify-between gap-1">
        <Button 
          size="sm" 
          className="py-0 h-7 w-full"
          variant="outline"
          onClick={() => handleOpenPlanDialog(workout)}
        >
          Plan
        </Button>
        <Button 
          size="sm" 
          className="py-0 h-7 text-red-500" 
          variant="outline"
          onClick={() => handleDeletePlannedWorkout(workout)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
