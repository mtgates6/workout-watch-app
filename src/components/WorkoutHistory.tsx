
import React from "react";
import { useWorkout } from "@/context/WorkoutContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const WorkoutHistory = () => {
  const { workouts } = useWorkout();
  const completedWorkouts = workouts.filter((workout) => workout.completed);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Workout History</h1>
        <p className="text-muted-foreground">Track your previous workouts and progress</p>
      </div>

      {completedWorkouts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <CalendarIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No workout history yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mt-2">
              Complete your first workout to start building your history and tracking your progress.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {completedWorkouts
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((workout) => (
              <Card key={workout.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{workout.name}</CardTitle>
                      <div className="flex items-center mt-1 text-muted-foreground text-sm">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        <span>{format(new Date(workout.date), "MMMM dd, yyyy")}</span>
                        <Clock className="ml-3 mr-1 h-3 w-3" />
                        <span>{workout.duration ? formatDuration(workout.duration) : "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Exercises</h4>
                    <div className="flex flex-wrap gap-2">
                      {workout.exercises.map((exerciseItem) => (
                        <Badge key={exerciseItem.id} variant="secondary">
                          {exerciseItem.exercise.name}
                        </Badge>
                      ))}
                    </div>
                    {workout.exercises.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-2">
                        {workout.exercises.reduce(
                          (total, ex) => total + ex.sets.filter((s) => s.completed).length,
                          0
                        )}{" "}
                        sets completed
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutHistory;
