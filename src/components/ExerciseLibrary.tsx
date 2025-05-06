
import React, { useState } from "react";
import { exercises } from "@/data/exercises";
import { useWorkout } from "@/context/WorkoutContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Search, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Exercise, MuscleGroup } from "@/types/workout";
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

const ExerciseLibrary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | "all">("all");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const { activeWorkout, addExerciseToWorkout, startWorkout } = useWorkout();
  const { toast } = useToast();
  const navigate = useNavigate();

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

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={selectedMuscleGroup}
          onValueChange={(value) => setSelectedMuscleGroup(value as MuscleGroup | "all")}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by muscle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Muscles</SelectItem>
            {muscleGroups.map(muscle => (
              <SelectItem key={muscle} value={muscle} className="capitalize">
                {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onSelect={setSelectedExercise}
            onAdd={handleAddToWorkout}
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
                  className="w-full bg-fitness-primary hover:bg-fitness-secondary"
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
    </div>
  );
};

interface ExerciseCardProps {
  exercise: Exercise;
  onSelect: (exercise: Exercise) => void;
  onAdd: (exercise: Exercise) => void;
}

const ExerciseCard = ({ exercise, onSelect, onAdd }: ExerciseCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="cursor-pointer" onClick={() => onSelect(exercise)}>
        <CardTitle>{exercise.name}</CardTitle>
        <CardDescription>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              {exercise.type.charAt(0).toUpperCase() + exercise.type.slice(1)}
            </Badge>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1 mb-4">
          {exercise.muscleGroups.map((group) => (
            <Badge key={group} variant="secondary" className="text-xs capitalize">
              {group}
            </Badge>
          ))}
        </div>
        <div className="flex justify-between">
          <Button variant="outline" size="sm" onClick={() => onSelect(exercise)}>
            Details
          </Button>
          <Button
            size="sm"
            className="bg-fitness-primary hover:bg-fitness-secondary"
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
