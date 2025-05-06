import React, { useState } from "react";
import { useWorkout } from "@/context/WorkoutContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { exercises } from "@/data/exercises";
import { Exercise, MuscleGroup } from "@/types/workout";
import { AlertCircle, CheckCircle2, Clock, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const WorkoutView = () => {
  const {
    activeWorkout,
    completeWorkout,
    updateSet,
    removeExerciseFromWorkout,
    removeSetFromExercise,
    addSetToExercise,
    addExerciseToWorkout,
  } = useWorkout();
  const { toast } = useToast();
  const navigate = useNavigate();

  const updateSet = (setIndex: number, exerciseIndex: number, completed: boolean) => {
    if (activeWorkout) {
      const exerciseId = activeWorkout.exercises[exerciseIndex].exercise.id;
      const setId = activeWorkout.exercises[exerciseIndex].sets[setIndex].id;
      updateSet(exerciseId, setId, completed);
    }
  };

  const handleEndWorkout = () => {
    completeWorkout();
    toast({
      title: "Workout Ended",
      description: "Your workout has been saved to history.",
    });
    navigate("/");
  };

  const handleRemoveExercise = (exerciseIndex: number) => {
    if (activeWorkout) {
      const exerciseId = activeWorkout.exercises[exerciseIndex].exercise.id;
      removeExerciseFromWorkout(exerciseId);
      toast({
        title: "Exercise Removed",
        description: "Exercise removed from your workout.",
      });
    }
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    if (activeWorkout) {
      const exerciseId = activeWorkout.exercises[exerciseIndex].exercise.id;
      const setId = activeWorkout.exercises[exerciseIndex].sets[setIndex].id;
      removeSetFromExercise(exerciseId, setId);
      toast({
        title: "Set Removed",
        description: "Set removed from exercise.",
      });
    }
  };

  const handleAddSet = (exerciseIndex: number) => {
    if (activeWorkout) {
      const exerciseId = activeWorkout.exercises[exerciseIndex].exercise.id;
      addSetToExercise(exerciseId);
      toast({
        title: "Set Added",
        description: "Set added to exercise.",
      });
    }
  };

  const calculateWorkoutTime = (workout: any) => {
    const now = new Date();
    const workoutDate = new Date(workout.date);
    const diff = now.getTime() - workoutDate.getTime();
    return Math.floor(diff / 60000);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | "all">("all");
  const [showAddExerciseDialog, setShowAddExerciseDialog] = useState(false);
  
  const filteredExercises = exercises.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedMuscleGroup === "all" || exercise.muscleGroups.includes(selectedMuscleGroup as MuscleGroup))
  );

  const handleAddExercise = (exercise: Exercise) => {
    addExerciseToWorkout(exercise);
    setShowAddExerciseDialog(false);
    toast({
      title: "Exercise Added",
      description: `${exercise.name} added to your workout`,
    });
  };
  
  if (!activeWorkout) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold tracking-tight">No active workout</h2>
        <p className="text-muted-foreground">Start a workout from the home page to begin.</p>
        <Button onClick={() => navigate("/")} className="mt-4">
          Go to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{activeWorkout.name}</h1>
          <p className="text-muted-foreground">
            {new Date(activeWorkout.date).toLocaleDateString()} •{" "}
            {calculateWorkoutTime(activeWorkout)} minutes
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleEndWorkout} variant="outline">
            End Workout
          </Button>
          <Dialog open={showAddExerciseDialog} onOpenChange={setShowAddExerciseDialog}>
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
        </div>
      </div>

      <Tabs defaultValue="incomplete" className="space-y-4">
        <TabsList>
          <TabsTrigger value="incomplete">Incomplete</TabsTrigger>
          <TabsTrigger value="complete">Complete</TabsTrigger>
        </TabsList>
        <TabsContent value="incomplete" className="space-y-4">
          {activeWorkout.exercises
            .filter((exercise) => !exercise.sets.every((set) => set.completed))
            .map((exercise, exerciseIndex) => (
              <Card key={exercise.exercise.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {exercise.exercise.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveExercise(exerciseIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    {exercise.exercise.muscleGroups.join(", ")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {exercise.sets.map((set, setIndex) => (
                    <div key={set.id} className="grid grid-cols-4 gap-2 items-center">
                      <Input
                        type="number"
                        placeholder="Weight"
                        defaultValue={set.weight}
                        disabled
                      />
                      <Input
                        type="number"
                        placeholder="Reps"
                        defaultValue={set.reps}
                        disabled
                      />
                      <Button
                        variant="outline"
                        onClick={() => updateSet(setIndex, exerciseIndex, !set.completed)}
                      >
                        {set.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4" />
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
                  ))}
                  <Button onClick={() => handleAddSet(exerciseIndex)} className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add Set
                  </Button>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="complete" className="space-y-4">
          {activeWorkout.exercises
            .filter((exercise) => exercise.sets.every((set) => set.completed))
            .map((exercise, exerciseIndex) => (
              <Card key={exercise.exercise.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {exercise.exercise.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveExercise(exerciseIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    {exercise.exercise.muscleGroups.join(", ")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {exercise.sets.map((set, setIndex) => (
                    <div key={set.id} className="grid grid-cols-4 gap-2 items-center">
                      <Input
                        type="number"
                        placeholder="Weight"
                        defaultValue={set.weight}
                        disabled
                      />
                      <Input
                        type="number"
                        placeholder="Reps"
                        defaultValue={set.reps}
                        disabled
                      />
                      <Button
                        variant="outline"
                        onClick={() => updateSet(setIndex, exerciseIndex, !set.completed)}
                      >
                        {set.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4" />
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
                  ))}
                  <Button onClick={() => handleAddSet(exerciseIndex)} className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add Set
                  </Button>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkoutView;
