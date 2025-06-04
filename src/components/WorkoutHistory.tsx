import React, { useState } from "react";
import { useWorkout } from "@/context/WorkoutContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { CalendarIcon, Clock, Repeat, BarChart, Edit, Pencil } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import ExerciseNotes from "./workout/ExerciseNotes";
import { PlannedExercise } from "@/types/workout";
import { Share2 } from "lucide-react";

const WorkoutHistory = () => {
  const { workouts, createPlannedWorkout, updatePlannedWorkout, updateExerciseNotes } = useWorkout();
  const navigate = useNavigate();
  const { toast } = useToast();
  const completedWorkouts = workouts.filter((workout) => workout.completed);
  const [editWorkoutName, setEditWorkoutName] = useState("");
  const [editingWorkout, setEditingWorkout] = useState(null);
  const isMobile = useIsMobile();
  const [mobileExerciseModal, setMobileExerciseModal] = useState<{open: boolean, exerciseItem?: any}>({open: false});

  // Map muscle groups to emojis
  const muscleGroupEmojis: Record<string, string> = {
    Chest: "🏋️",
    Back: "🦾",
    Legs: "🦵",
    Shoulders: "🏋️‍♂️",
    Biceps: "💪",
    Triceps: "💪",
    Core: "🧘",
    Glutes: "🍑",
    Calves: "🐮",
    Forearms: "🤲",
    Cardio: "🏃",
    // Add more as needed
  };

  const handleRepeatWorkout = (workout) => {
    // Create a new planned workout with the same name
    const newWorkout = createPlannedWorkout(
      `${workout.name}`, 
      new Date().toISOString()
    );
    
    // Add all exercises from the completed workout to the planned workout with their weight/reps history
    const plannedExercises: PlannedExercise[] = workout.exercises.map(exerciseItem => {
      // Get the most recent completed set's weight and reps for reference
      const completedSets = exerciseItem.sets.filter(set => set.completed);
      const lastCompletedSet = completedSets[completedSets.length - 1];
      
      return {
        ...exerciseItem.exercise,
        // Add reference data for the planner to use
        referenceWeight: lastCompletedSet?.weight,
        referenceReps: lastCompletedSet?.reps,
        previousSets: completedSets.map(set => ({
          weight: set.weight,
          reps: set.reps
        }))
      };
    });
    
    // Update the planned workout with the exercises including their reference data
    updatePlannedWorkout(newWorkout.id, {
      plannedExercises
    });
    
    // Show success toast
    toast({
      title: "Workout Copied to Plan",
      description: `Added "${workout.name}" to today's plan with previous weights and reps`,
    });
    
    // Navigate to the planner page
    navigate("/planner");
  };

  const handleEditWorkout = (workout) => {
    setEditingWorkout(workout);
    setEditWorkoutName(workout.name);
  };

  const handleSaveWorkoutName = () => {
    if (!editWorkoutName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for the workout",
      });
      return;
    }

    updatePlannedWorkout(editingWorkout.id, {
      name: editWorkoutName.trim()
    });

    toast({
      title: "Workout Updated",
      description: "Workout name has been updated",
    });

    setEditingWorkout(null);
  };

  const handleSaveNotes = (exerciseId, notes) => {
    updateExerciseNotes(exerciseId, notes);
  };

  const renderExerciseNotes = (exerciseItem) => {
    if (exerciseItem.notes) {
      return (
        <div className="mt-2 text-sm">
          <div className="font-medium">Notes:</div>
          <div className="text-muted-foreground whitespace-pre-wrap">{exerciseItem.notes}</div>
        </div>
      );
    }
    return null;
  };

  const handleShareWorkout = async (workout) => {
    // Generate a text summary with only the first muscle group emoji per exercise
    const summary = [
      `🏋️ Workout: ${workout.name}`,
      "",
      "Exercises:",
      ...workout.exercises.map(ex => {
        const muscleGroups = ex.exercise.muscleGroups || [];
        const firstMuscleGroup = muscleGroups[0];
        const emoji = firstMuscleGroup ? (muscleGroupEmojis[firstMuscleGroup] || "") : "";
        return `- ${ex.exercise.name}${emoji ? ` ${emoji}` : ""}`;
      }),
    ].join("\n");

    // Try Web Share API first (mobile-friendly)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Workout: ${workout.name}`,
          text: summary,
        });
      } catch (err) {
        // Fallback: copy to clipboard if share fails (e.g., permission denied)
        await navigator.clipboard.writeText(summary);
        toast({
          title: "Workout copied!",
          description: "You can now paste your workout summary anywhere.",
        });
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(summary);
      toast({
        title: "Workout copied!",
        description: "You can now paste your workout summary anywhere.",
      });
    }
  };

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
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShareWorkout(workout)}
                        className="flex items-center gap-1"
                      >
                        <Share2 className="h-3 w-3" />
                        <span>Share</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleRepeatWorkout(workout)}
                        className="flex items-center gap-1"
                      >
                        <Repeat className="h-3 w-3" />
                        <span>Repeat</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Exercises</h4>
                    <div className="flex flex-wrap gap-2">
                      {workout.exercises.map((exerciseItem) => (
                        isMobile ? (
                          <div key={exerciseItem.id} className="inline-flex items-center">
                            <Badge
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => setMobileExerciseModal({open: true, exerciseItem})}
                            >
                              {exerciseItem.exercise.name}
                            </Badge>
                            
                            {/* Modal for mobile */}
                            {mobileExerciseModal.open && mobileExerciseModal.exerciseItem?.id === exerciseItem.id && (
                              <Dialog open={true} onOpenChange={() => setMobileExerciseModal({open: false})}>
                                <DialogContent className="max-w-xs">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <BarChart className="h-4 w-4" />
                                      <h4 className="font-medium">{exerciseItem.exercise.name}</h4>
                                    </div>
                                    <div className="text-sm">
                                      {exerciseItem.sets.length > 0 ? (
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>Set</TableHead>
                                              <TableHead>Weight</TableHead>
                                              <TableHead>Reps</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {exerciseItem.sets
                                              .filter(set => set.completed)
                                              .map((set, index) => (
                                                <TableRow key={set.id}>
                                                  <TableCell>{index + 1}</TableCell>
                                                  <TableCell>{set.weight || "—"}</TableCell>
                                                  <TableCell>{set.reps || "—"}</TableCell>
                                                </TableRow>
                                              ))}
                                          </TableBody>
                                        </Table>
                                      ) : (
                                        <p className="text-muted-foreground">No sets completed</p>
                                      )}
                                      <div className="mt-2 text-sm flex items-center gap-2">
                                        <ExerciseNotes 
                                          exerciseItem={exerciseItem} 
                                          onSaveNotes={handleSaveNotes} 
                                        />
                                        {renderExerciseNotes(exerciseItem)}
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        ) : (
                            <HoverCard key={exerciseItem.id}>
                              <HoverCardTrigger asChild>
                                <div className="inline-block">
                                  <Badge variant="secondary" className="cursor-help">
                                    {exerciseItem.exercise.name}
                                  </Badge>
                                </div>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-auto">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <BarChart className="h-4 w-4" />
                                    <h4 className="font-medium">{exerciseItem.exercise.name}</h4>
                                  </div>
                                  <div className="text-sm">
                                    {exerciseItem.sets.length > 0 ? (
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Set</TableHead>
                                            <TableHead>Weight</TableHead>
                                            <TableHead>Reps</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {exerciseItem.sets
                                            .filter(set => set.completed)
                                            .map((set, index) => (
                                              <TableRow key={set.id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{set.weight || "—"}</TableCell>
                                                <TableCell>{set.reps || "—"}</TableCell>
                                              </TableRow>
                                            ))}
                                        </TableBody>
                                      </Table>
                                    ) : (
                                      <p className="text-muted-foreground">No sets completed</p>
                                    )}
                                    <div className="mt-2 text-sm flex items-center gap-2">
                                      <ExerciseNotes 
                                        exerciseItem={exerciseItem} 
                                        onSaveNotes={handleSaveNotes} 
                                      />
                                      {renderExerciseNotes(exerciseItem)}
                                    </div>
                                  </div>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                        )
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
