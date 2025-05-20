
import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Workout } from "@/types/workout";
import { PlannedWorkoutCard } from "./PlannedWorkoutCard";

interface DayCardProps {
  day: {
    date: Date;
    dayName: string;
    dayNumber: string;
    isToday: boolean;
  };
  plannedWorkouts: Workout[];
  selectedDate: Date;
  createDialogOpen: boolean;
  setCreateDialogOpen: (open: boolean) => void;
  setSelectedDate: (date: Date) => void;
  handleOpenPlanDialog: (workout: Workout) => void;
  handleDeletePlannedWorkout: (workout: Workout) => void;
  handleUpdateWorkoutName?: (workoutId: string, newName: string) => void;
}

export const DayCard: React.FC<DayCardProps> = ({
  day,
  plannedWorkouts,
  selectedDate,
  createDialogOpen,
  setCreateDialogOpen,
  setSelectedDate,
  handleOpenPlanDialog,
  handleDeletePlannedWorkout,
  handleUpdateWorkoutName,
}) => {
  return (
    <div className="flex flex-col">
      <div className={`text-center p-2 rounded-t-md ${day.isToday ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
        <div className="text-xs font-medium">{day.dayName}</div>
        <div className="text-lg font-bold">{day.dayNumber}</div>
      </div>
      
      <Card className="flex-1 border-t-0 rounded-t-none">
        <CardContent className="p-3 space-y-3 min-h-[150px] max-h-[2000px] overflow-y-auto">
          {plannedWorkouts.length > 0 ? (
            plannedWorkouts.map(workout => (
              <PlannedWorkoutCard 
                key={workout.id}
                workout={workout}
                handleOpenPlanDialog={handleOpenPlanDialog}
                handleDeletePlannedWorkout={handleDeletePlannedWorkout}
                handleUpdateWorkoutName={handleUpdateWorkoutName}
              />
            ))
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              No workouts planned
            </div>
          )}
        </CardContent>
        <CardFooter className="p-2 flex justify-center border-t">
          <Dialog 
            open={createDialogOpen && format(selectedDate, 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd')} 
            onOpenChange={(open) => {
              setCreateDialogOpen(open);
              if (open) setSelectedDate(day.date);
            }}
          >
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full h-7">
                <Plus className="h-4 w-4 mr-1" />Add Workout
              </Button>
            </DialogTrigger>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
};
