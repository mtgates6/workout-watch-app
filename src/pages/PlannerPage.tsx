import React, { useState } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { CalendarDays, Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Trash2, Eye } from "lucide-react";
import { useWorkout } from "@/context/WorkoutContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Workout, Exercise } from "@/types/workout";
import { exercises } from "@/data/exercises";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const PlannerPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newWorkoutName, setNewWorkoutName] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [plannedExercises, setPlannedExercises] = useState<Exercise[]>([]);
  const [workoutNotes, setWorkoutNotes] = useState("");
  const { workouts, createPlannedWorkout, startPlannedWorkout, deletePlannedWorkout, updatePlannedWorkout } = useWorkout();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get the start of the current week (Sunday)
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const today = new Date();
    return startOfWeek(today, { weekStartsOn: 0 });
  });
  
  // Generate the days of the week
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const day = addDays(weekStart, i);
    return {
      date: day,
      dayName: format(day, 'EEE'),
      dayNumber: format(day, 'd'),
      isToday: format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'),
    };
  });
  
  const handlePrevWeek = () => {
    setWeekStart(addDays(weekStart, -7));
  };
  
  const handleNextWeek = () => {
    setWeekStart(addDays(weekStart, 7));
  };
  
  const handleCreateWorkout = () => {
    if (!newWorkoutName.trim()) {
      toast({
        title: "Workout name required",
        description: "Please enter a name for your workout",
      });
      return;
    }
    
    createPlannedWorkout(newWorkoutName, selectedDate.toISOString());
    setNewWorkoutName("");
    setCreateDialogOpen(false);
    
    toast({
      title: "Workout Planned",
      description: `"${newWorkoutName}" scheduled for ${format(selectedDate, 'EEEE, MMMM d')}`,
    });
  };
  
  const handleStartPlannedWorkout = (workout: Workout) => {
    startPlannedWorkout(workout.id);
    navigate("/workout");
    toast({
      title: "Starting Workout",
      description: `Starting "${workout.name}"`,
    });
  };
  
  const handleDeletePlannedWorkout = (workout: Workout) => {
    deletePlannedWorkout(workout.id);
    toast({
      title: "Workout Deleted",
      description: `"${workout.name}" has been removed from your plan`,
    });
  };

  const handleOpenPlanDialog = (workout: Workout) => {
    setSelectedWorkout(workout);
    setPlannedExercises(workout.plannedExercises || []);
    setWorkoutNotes(workout.notes || "");
    setPlanDialogOpen(true);
  };

  const handleClosePlanDialog = () => {
    setSelectedWorkout(null);
    setPlannedExercises([]);
    setWorkoutNotes("");
    setPlanDialogOpen(false);
  };

  const handleSavePlan = () => {
    if (!selectedWorkout) return;

    updatePlannedWorkout(selectedWorkout.id, {
      plannedExercises,
      notes: workoutNotes
    });

    toast({
      title: "Workout Plan Updated",
      description: `Updated plan for "${selectedWorkout.name}"`,
    });

    handleClosePlanDialog();
  };

  const handleAddExerciseToPlan = (exercise: Exercise) => {
    if (plannedExercises.some(e => e.id === exercise.id)) {
      toast({
        title: "Exercise already added",
        description: `"${exercise.name}" is already in your plan`,
      });
      return;
    }
    
    setPlannedExercises([...plannedExercises, exercise]);
    setExerciseSearch("");
  };

  const handleRemoveExerciseFromPlan = (exerciseId: string) => {
    setPlannedExercises(plannedExercises.filter(e => e.id !== exerciseId));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return; // If dropped outside the list, do nothing
  
    const reorderedExercises = Array.from(plannedExercises);
    const [movedItem] = reorderedExercises.splice(result.source.index, 1);
    reorderedExercises.splice(result.destination.index, 0, movedItem);
  
    setPlannedExercises(reorderedExercises);
  };

  const filteredExercises = exercises
    .filter(exercise => 
      exercise.name.toLowerCase().includes(exerciseSearch.toLowerCase())
    )
    .slice(0, 5);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Workout Planner</h1>
        
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Jump to Date
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                  const weekOf = startOfWeek(date, { weekStartsOn: 0 });
                  setWeekStart(weekOf);
                  setCalendarOpen(false);
                }
              }}
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" onClick={handlePrevWeek}>
          <ChevronLeft className="h-4 w-4" />
          Previous Week
        </Button>
        <h2 className="text-xl font-medium">
          {format(weekStart, 'MMMM d')} - {format(addDays(weekStart, 6), 'MMMM d, yyyy')}
        </h2>
        <Button variant="outline" onClick={handleNextWeek}>
          Next Week
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-3">
        {weekDays.map((day) => {
          const plannedWorkouts = workouts.filter(
            w => w.planned && format(new Date(w.date), 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd')
          );
          
          return (
            <div key={day.dayName + day.dayNumber} className="flex flex-col">
              <div className={`text-center p-2 rounded-t-md ${day.isToday ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <div className="text-xs font-medium">{day.dayName}</div>
                <div className="text-lg font-bold">{day.dayNumber}</div>
              </div>
              
              <Card className="flex-1 border-t-0 rounded-t-none">
                <CardContent className="p-3 space-y-3 min-h-[200px] max-h-[250px] overflow-y-auto">
                  {plannedWorkouts.length > 0 ? (
                    plannedWorkouts.map(workout => (
                      <Card key={workout.id} className="overflow-hidden">
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
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      No workouts planned
                    </div>
                  )}
                </CardContent>
                <CardFooter className="p-2 flex justify-center border-t">
                  <Dialog open={createDialogOpen && format(selectedDate, 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd')} 
                      onOpenChange={(open) => {
                        setCreateDialogOpen(open);
                        if (open) setSelectedDate(day.date);
                      }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full h-7">
                        <Plus className="h-4 w-4 mr-1" />Add Workout
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Plan Workout for {format(selectedDate, 'EEEE, MMMM d')}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Input
                            placeholder="Workout Name"
                            value={newWorkoutName}
                            onChange={(e) => setNewWorkoutName(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateWorkout}>Create Workout</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Plan Exercises Dialog */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Plan Workout: {selectedWorkout?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Add Exercises</label>
              <Input
                placeholder="Search exercises..."
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
              />
              
              {exerciseSearch && (
                <div className="mt-2 border rounded-md max-h-40 overflow-y-auto">
                  {filteredExercises.length > 0 ? (
                    filteredExercises.map(exercise => (
                      <div 
                        key={exercise.id} 
                        className="p-2 hover:bg-accent cursor-pointer flex justify-between items-center border-b last:border-b-0"
                        onClick={() => handleAddExerciseToPlan(exercise)}
                      >
                        <span>{exercise.name}</span>
                        <Button 
                          size="sm" 
                          variant="ghost"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-muted-foreground">
                      No exercises found
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Planned Exercises</label>
              {plannedExercises.length > 0 ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="plannedExercises">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{ padding: 8 }}
                      >
                        {plannedExercises.map((exercise, index) => (
                          <Draggable key={exercise.id} draggableId={exercise.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style, // VERY IMPORTANT
                                }}
                              >
                                <span>{exercise.name}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveExerciseFromPlan(exercise.id)}
                                  className="text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              ) : (
                <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground">
                  No exercises added yet. Search above to add exercises.
                </div>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Notes</label>
              <Textarea
                placeholder="Add notes for this workout plan..."
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                className="min-h-24"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClosePlanDialog}>Cancel</Button>
            <Button onClick={handleSavePlan}>Save Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlannerPage;
