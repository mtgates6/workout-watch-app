import React, { useState } from "react";
import { format, addDays, startOfWeek, addMonths, startOfMonth } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useWorkout } from "@/context/WorkoutContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Workout, Exercise } from "@/types/workout";
import { exercises } from "@/data/exercises";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { DayCard } from "@/components/planner/DayCard";
import { CreateWorkoutDialog } from "@/components/planner/CreateWorkoutDialog";
import { PlanExercisesDialog } from "@/components/planner/PlanExercisesDialog";
import { MonthlyView } from "@/components/planner/MonthlyView";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const { workouts, createPlannedWorkout, startPlannedWorkout, deletePlannedWorkout, updatePlannedWorkout } = useWorkout();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Get the start of the current week (Sunday)
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const today = new Date();
    return startOfWeek(today, { weekStartsOn: 0 });
  });
  
  // Get the current month for monthly view
  const [currentMonth, setCurrentMonth] = useState<Date>(() => startOfMonth(new Date()));
  
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

  const handlePrevMonth = () => {
    setCurrentMonth(addMonths(currentMonth, -1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
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
    console.log('PlannerPage: Starting planned workout:', workout);
    
    // Update the workout in context first with the latest data
    updatePlannedWorkout(workout.id, {
      plannedExercises: workout.plannedExercises,
      notes: workout.notes
    });
    
    // Then start the workout
    startPlannedWorkout(workout);
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

  const handleSavePlan = (callback?: () => void) => {
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
    if (callback) callback();
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

  const handleUpdateWorkoutName = (workoutId: string, newName: string) => {
    updatePlannedWorkout(workoutId, { name: newName });
    
    toast({
      title: "Workout Updated",
      description: `Workout name changed to "${newName}"`,
    });
  };

  const filteredExercises = exercises
    .filter(exercise => 
      exercise.name.toLowerCase().includes(exerciseSearch.toLowerCase())
    )
    .slice(0, 5);
  
  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Workout Planner</h1>
        
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "week" | "month")}>
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <CalendarIcon className="h-4 w-4" />
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
                    setCurrentMonth(startOfMonth(date));
                    setCalendarOpen(false);
                  }
                }}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Navigation controls */}
      {viewMode === "week" ? (
        <div className="flex items-center justify-center gap-2 mb-4">
          {/* Mobile View: Chevrons next to the date */}
          <div className="flex items-center sm:hidden">
            <Button variant="outline" onClick={handlePrevWeek} className="p-3">
              <ChevronLeft className="h-5 w-8" />
            </Button>
            <h2 className="text-lg font-medium text-center mx-auto px-4">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </h2>
            <Button variant="outline" onClick={handleNextWeek} className="p-3">
              <ChevronRight className="h-5 w-8" />
            </Button>
          </div>

          {/* Desktop View: Full buttons */}
          <div className="hidden sm:flex items-center justify-between w-full">
            <Button variant="outline" onClick={handlePrevWeek} className="w-auto">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous Week
            </Button>
            <h2 className="text-lg sm:text-xl font-medium text-center">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </h2>
            <Button variant="outline" onClick={handleNextWeek} className="w-auto">
              Next Week
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          <h2 className="text-lg sm:text-xl font-medium text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <Button variant="outline" onClick={handleNextMonth}>
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
      
      {viewMode === "week" ? (
        <>
          {/* Desktop View: 7-column grid */}
          <div className="hidden sm:grid grid-cols-7 gap-3">
            {weekDays.map((day) => {
              const plannedWorkouts = workouts.filter(
                w => w.planned && format(new Date(w.date), 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd')
              );
              
              return (
                <DayCard
                  key={day.dayName + day.dayNumber}
                  day={day}
                  plannedWorkouts={plannedWorkouts}
                  selectedDate={selectedDate}
                  createDialogOpen={createDialogOpen}
                  setCreateDialogOpen={setCreateDialogOpen}
                  setSelectedDate={setSelectedDate}
                  handleOpenPlanDialog={handleOpenPlanDialog}
                  handleDeletePlannedWorkout={handleDeletePlannedWorkout}
                  handleUpdateWorkoutName={handleUpdateWorkoutName}
                />
              );
            })}
          </div>

          {/* Mobile View: Card list for days */}
          <div className="sm:hidden space-y-4">
            {weekDays.map((day) => {
              const plannedWorkouts = workouts.filter(
                w => w.planned && format(new Date(w.date), 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd')
              );
              
              return (
                <DayCard
                  key={day.dayName + day.dayNumber}
                  day={day}
                  plannedWorkouts={plannedWorkouts}
                  selectedDate={selectedDate}
                  createDialogOpen={createDialogOpen}
                  setCreateDialogOpen={setCreateDialogOpen}
                  setSelectedDate={setSelectedDate}
                  handleOpenPlanDialog={handleOpenPlanDialog}
                  handleDeletePlannedWorkout={handleDeletePlannedWorkout}
                  handleUpdateWorkoutName={handleUpdateWorkoutName}
                />
              );
            })}
          </div>
        </>
      ) : (
        <MonthlyView
          currentMonth={currentMonth}
          workouts={workouts}
          selectedDate={selectedDate}
          createDialogOpen={createDialogOpen}
          setCreateDialogOpen={setCreateDialogOpen}
          setSelectedDate={setSelectedDate}
          handleOpenPlanDialog={handleOpenPlanDialog}
        />
      )}

      {/* Create Workout Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <CreateWorkoutDialog
          selectedDate={selectedDate}
          newWorkoutName={newWorkoutName}
          setNewWorkoutName={setNewWorkoutName}
          setCreateDialogOpen={setCreateDialogOpen}
          handleCreateWorkout={handleCreateWorkout}
        />
      </Dialog>

      {/* Plan Exercises Dialog/Drawer */}
      <PlanExercisesDialog
        isMobile={isMobile}
        planDialogOpen={planDialogOpen}
        setPlanDialogOpen={setPlanDialogOpen}
        selectedWorkout={selectedWorkout}
        exerciseSearch={exerciseSearch}
        setExerciseSearch={setExerciseSearch}
        filteredExercises={filteredExercises}
        plannedExercises={plannedExercises}
        workoutNotes={workoutNotes}
        setWorkoutNotes={setWorkoutNotes}
        handleAddExerciseToPlan={handleAddExerciseToPlan}
        handleRemoveExerciseFromPlan={handleRemoveExerciseFromPlan}
        handleDragEnd={handleDragEnd}
        handleClosePlanDialog={handleClosePlanDialog}
        handleSavePlan={handleSavePlan}
        handleStartPlannedWorkout={handleStartPlannedWorkout}
      />
    </div>
  );
};

export default PlannerPage;
