
import React, { useState, useEffect } from "react";
import { exercises as defaultExercises } from "@/data/exercises";
import { useWorkout } from "@/context/WorkoutContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Search, Plus, History, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Exercise, MuscleGroup } from "@/types/workout";
import { useNavigate } from "react-router-dom";
import ExerciseHistoryDialog from "./ExerciseHistoryDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { v4 as uuidv4 } from "uuid";

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

const CUSTOM_EXERCISES_KEY = "custom_exercises";

const ExerciseLibrary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | "all">("all");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [historyExercise, setHistoryExercise] = useState<Exercise | null>(null);
  const [customExercises, setCustomExercises] = useState<Exercise[]>(() => {
    const saved = localStorage.getItem(CUSTOM_EXERCISES_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseMuscleGroup, setNewExerciseMuscleGroup] = useState<MuscleGroup>("chest");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { activeWorkout, addExerciseToWorkout, startWorkout, workouts } = useWorkout();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(customExercises));
  }, [customExercises]);

  const exercises = [...defaultExercises, ...customExercises];

  const handleCreateExercise = () => {
    const trimmed = newExerciseName.trim();
    if (!trimmed) return;
    if (exercises.some(e => e.name.toLowerCase() === trimmed.toLowerCase())) {
      toast({ title: "Exercise already exists", description: `"${trimmed}" is already in the library.`, variant: "destructive" });
      return;
    }
    const newExercise: Exercise = {
      id: uuidv4(),
      name: trimmed,
      type: "strength",
      muscleGroups: [newExerciseMuscleGroup],
    };
    setCustomExercises(prev => [...prev, newExercise]);
    setNewExerciseName("");
    toast({ title: "Exercise Created", description: `${trimmed} added to your library` });
  };

  const getExerciseHistory = (exercise: Exercise) => {
    return workouts
      .filter(workout => workout.completed)
      .map(workout => {
        const exerciseData = workout.exercises.find(
          ex => ex.exercise.id === exercise.id
        );
        if (exerciseData) {
          return {
            workout: {
              id: workout.id,
              name: workout.name,
              date: workout.date
            },
            exerciseData
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b!.workout.date).getTime() - new Date(a!.workout.date).getTime()) as Array<{
        workout: { id: string; name: string; date: string };
        exerciseData: any;
      }>;
  };

  const handleAddToWorkout = (exercise: Exercise) => {
    if (!activeWorkout) {
      startWorkout("Quick Workout");
      setTimeout(() => {
        addExerciseToWorkout(exercise);
        toast({
          title: "New Workout Started",
          description: `${exercise.name} added to your new workout`,
        });
        navigate("/workout");
      }, 100);
    } else {
      addExerciseToWorkout(exercise);
      toast({
        title: "Exercise Added",
        description: `${exercise.name} added to your workout`,
      });
    }
  };

  const handleMuscleGroupSelect = (muscleGroup: MuscleGroup | "all") => {
    setSelectedMuscleGroup(muscleGroup);
  };

  const filteredExercises = exercises
    .filter(
      (exercise) =>
        (selectedMuscleGroup === "all" || exercise.muscleGroups.includes(selectedMuscleGroup as MuscleGroup)) &&
        (searchQuery === "" ||
          exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exercise.muscleGroups.some((group) =>
            group.toLowerCase().includes(searchQuery.toLowerCase())
          ))
    );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Exercise Library</h1>
        <p className="text-muted-foreground">Browse and add exercises to your workout</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant={selectedMuscleGroup === "all" ? "default" : "outline"}
            className="cursor-pointer text-sm py-1 px-3"
            onClick={() => handleMuscleGroupSelect("all")}
          >
            All
          </Badge>
          {muscleGroups.map(muscle => (
            <Badge 
              key={muscle} 
              variant={selectedMuscleGroup === muscle ? "default" : "outline"} 
              className="cursor-pointer text-sm py-1 px-3 capitalize"
              onClick={() => handleMuscleGroupSelect(muscle)}
            >
              {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
            </Badge>
          ))}
        </div>
      </div>

      <div className="border rounded-lg p-4 space-y-3">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 text-sm font-medium w-full"
        >
          <Plus className="h-4 w-4" />
          Create Custom Exercise
          {showCreateForm ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
        </button>
        {showCreateForm && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Exercise name..."
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateExercise()}
              className="flex-1"
            />
            <Select value={newExerciseMuscleGroup} onValueChange={(v) => setNewExerciseMuscleGroup(v as MuscleGroup)}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {muscleGroups.map((g) => (
                  <SelectItem key={g} value={g} className="capitalize">
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleCreateExercise} disabled={!newExerciseName.trim()}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onSelect={setSelectedExercise}
            onAdd={handleAddToWorkout}
            onShowHistory={setHistoryExercise}
          />
        ))}
        {filteredExercises.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No exercises found. Try a different search term.</p>
          </div>
        )}
      </div>

      <Dialog open={!!selectedExercise} onOpenChange={(open) => !open && setSelectedExercise(null)}>
        <DialogContent>
          {selectedExercise && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedExercise.name}</DialogTitle>
                <DialogDescription className="pt-2">
                  <Badge variant="outline" className="mb-2">
                    {selectedExercise.type.charAt(0).toUpperCase() + selectedExercise.type.slice(1)}
                  </Badge>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Muscle Groups</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.muscleGroups.map((group) => (
                      <Badge key={group} variant="secondary" className="capitalize">
                        {group}
                      </Badge>
                    ))}
                  </div>
                </div>
                {selectedExercise.instructions && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Instructions</h4>
                    <p className="text-sm text-muted-foreground">{selectedExercise.instructions}</p>
                  </div>
                )}
                <Button
                  className="w-full"
                  onClick={() => {
                    handleAddToWorkout(selectedExercise);
                    setSelectedExercise(null);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add to Workout
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      {historyExercise && (
        <ExerciseHistoryDialog
          exercise={historyExercise}
          workoutHistory={getExerciseHistory(historyExercise)}
          open={!!historyExercise}
          onOpenChange={(open) => !open && setHistoryExercise(null)}
        />
      )}
    </div>
    
  );
};

interface ExerciseCardProps {
  exercise: Exercise;
  onSelect: (exercise: Exercise) => void;
  onAdd: (exercise: Exercise) => void;
  onShowHistory: (exercise: Exercise) => void;
}

const ExerciseCard = ({ exercise, onSelect, onAdd, onShowHistory }: ExerciseCardProps) => {
  return (
    <Card className="overflow-hidden">
        <div className="flex flex-row justify-between items-center">
            <CardHeader className="cursor-pointer" onClick={() => onSelect(exercise)}>
                <CardTitle>{exercise.name}</CardTitle>
            </CardHeader>
            <Button variant="outline" size="sm" className="mr-6" onClick={() => onShowHistory(exercise)}>
              <Clock className="h-4 w-4" />
            </Button>
        </div>
      <CardContent>
        <div className="flex flex-wrap gap-1 mb-4">
          {exercise.muscleGroups.map((group) => (
            <Badge key={group} variant="secondary" className="text-xs capitalize">
              {group}
            </Badge>
          ))}
        </div>
        <div className="flex justify-between gap-2">
          <Button variant="outline" size="sm" onClick={() => onSelect(exercise)}>
            Details
          </Button>
          <Button
            size="sm"
            onClick={() => onAdd(exercise)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseLibrary;
