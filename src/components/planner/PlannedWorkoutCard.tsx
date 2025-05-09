
import React from "react";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Play } from "lucide-react";
import { Workout } from "@/types/workout";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PlannedWorkoutCardProps {
  workout: Workout;
  handleOpenPlanDialog: (workout: Workout) => void;
  handleDeletePlannedWorkout: (workout: Workout) => void;
  handleStartPlannedWorkout: (workout: Workout) => void;
}

export const PlannedWorkoutCard: React.FC<PlannedWorkoutCardProps> = ({
  workout,
  handleOpenPlanDialog,
  handleDeletePlannedWorkout,
  handleStartPlannedWorkout,
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <CardTitle className="text-sm cursor-default">{workout.name}</CardTitle>
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
      </CardHeader>
      <CardFooter className="p-2 pt-0 flex justify-between gap-1">
        <Button 
          size="sm" 
          className="py-0 h-7 bg-green-500 hover:bg-green-600 text-white"
          onClick={() => handleStartPlannedWorkout(workout)}
        >
          <Play className="h-4 w-4 mr-1" />
          Start
        </Button>
        <Button 
          size="sm" 
          className="py-0 h-7"
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
