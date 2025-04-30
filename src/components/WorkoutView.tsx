
import React, { useState } from "react";
import { useWorkout } from "@/context/WorkoutContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { exercises } from "@/data/exercises";
import { Exercise } from "@/types/workout";
import { AlertCircle, CheckCircle2, Clock, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const WorkoutView = () => {
  const { activeWorkout, addExerciseToWorkout, addSetToExercise, updateSet, completeWorkout, cancelWorkout } = useWorkout();
  const [selectedExerciseType, setSelectedExerciseType] = useState<string>("strength");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  if (!activeWorkout) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Active Workout</h2>
        <p className="text-muted-foreground mb-6">Start a new workout to track your progress</p>
        <Button
          onClick={() => navigate("/")}
          className="bg-fitness-primary hover:bg-fitness-secondary"
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const handleAddExercise = (exercise: Exercise) => {
    addExerciseToWorkout(exercise);
    setDialogOpen(false);
    toast({
      title: "Exercise Added",
      description: `${exercise.name} added to workout`,
    });
  };

  const handleAddSet = (exerciseId: string) => {
    addSetToExercise(exerciseId);
  };

  const handleUpdateSet = (
    exerciseId: string,
    setId: string,
    field: "weight" | "reps" | "completed",
    value: number | boolean
  ) => {
    updateSet(exerciseId, setId, { [field]: value });
  };

  const handleCompleteWorkout = () => {
    completeWorkout();
    toast({
      title: "Workout Completed",
      description: "Great job! Your workout has been saved.",
    });
    navigate("/");
  };

  const filteredExercises = exercises.filter(
    (exercise) => exercise.type === selectedExerciseType
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{activeWorkout.name}</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={cancelWorkout}>
            Cancel
          </Button>
          <Button 
            className="bg-fitness-success hover:bg-fitness-success/90" 
            onClick={handleCompleteWorkout}
          >
            Complete Workout
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Workout in progress</span>
      </div>

      {activeWorkout.exercises.length === 0 ? (
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-medium">Add Your First Exercise</h3>
              <p className="text-muted-foreground">
                Start building your workout by adding exercises
              </p>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-fitness-primary hover:bg-fitness-secondary">
                    Add Exercise
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Exercise</DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue="strength">
                    <TabsList className="w-full">
                      <TabsTrigger value="strength" onClick={() => setSelectedExerciseType("strength")}>
                        Strength
                      </TabsTrigger>
                      <TabsTrigger value="cardio" onClick={() => setSelectedExerciseType("cardio")}>
                        Cardio
                      </TabsTrigger>
                      <TabsTrigger value="flexibility" onClick={() => setSelectedExerciseType("flexibility")}>
                        Flexibility
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="strength" className="mt-4 max-h-96 overflow-y-auto">
                      <div className="space-y-2">
                        {filteredExercises.map((exercise) => (
                          <Card key={exercise.id} className="cursor-pointer hover:bg-muted/50">
                            <CardHeader className="p-3" onClick={() => handleAddExercise(exercise)}>
                              <CardTitle className="text-base">{exercise.name}</CardTitle>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="cardio" className="mt-4 max-h-96 overflow-y-auto">
                      <div className="space-y-2">
                        {filteredExercises.map((exercise) => (
                          <Card key={exercise.id} className="cursor-pointer hover:bg-muted/50">
                            <CardHeader className="p-3" onClick={() => handleAddExercise(exercise)}>
                              <CardTitle className="text-base">{exercise.name}</CardTitle>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="flexibility" className="mt-4 max-h-96 overflow-y-auto">
                      <div className="space-y-2">
                        {filteredExercises.map((exercise) => (
                          <Card key={exercise.id} className="cursor-pointer hover:bg-muted/50">
                            <CardHeader className="p-3" onClick={() => handleAddExercise(exercise)}>
                              <CardTitle className="text-base">{exercise.name}</CardTitle>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-6">
            {activeWorkout.exercises.map((exerciseItem) => (
              <Card key={exerciseItem.id}>
                <CardHeader className="bg-muted/30">
                  <CardTitle>{exerciseItem.exercise.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-4 gap-4 text-sm font-medium mb-2">
                    <div>SET</div>
                    {exerciseItem.exercise.type === "strength" ? (
                      <>
                        <div>WEIGHT</div>
                        <div>REPS</div>
                      </>
                    ) : exerciseItem.exercise.type === "cardio" ? (
                      <>
                        <div>DISTANCE</div>
                        <div>TIME</div>
                      </>
                    ) : (
                      <>
                        <div>TIME</div>
                        <div>NOTES</div>
                      </>
                    )}
                    <div className="text-right">DONE</div>
                  </div>
                  <div className="space-y-2">
                    {exerciseItem.sets.map((set, index) => (
                      <div key={set.id} className="grid grid-cols-4 gap-4 items-center py-1 border-t">
                        <div>{index + 1}</div>
                        {exerciseItem.exercise.type === "strength" ? (
                          <>
                            <Input
                              type="number"
                              placeholder="lbs"
                              value={set.weight || ""}
                              onChange={(e) =>
                                handleUpdateSet(
                                  exerciseItem.id,
                                  set.id,
                                  "weight",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="h-8"
                            />
                            <Input
                              type="number"
                              placeholder="reps"
                              value={set.reps || ""}
                              onChange={(e) =>
                                handleUpdateSet(
                                  exerciseItem.id,
                                  set.id,
                                  "reps",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="h-8"
                            />
                          </>
                        ) : (
                          <>
                            <Input
                              type="number"
                              placeholder={exerciseItem.exercise.type === "cardio" ? "meters" : "seconds"}
                              className="h-8"
                            />
                            <Input
                              type="number"
                              placeholder={exerciseItem.exercise.type === "cardio" ? "seconds" : "notes"}
                              className="h-8"
                            />
                          </>
                        )}
                        <div className="text-right">
                          <Button
                            variant={set.completed ? "default" : "outline"}
                            size="sm"
                            className={set.completed ? "bg-fitness-success hover:bg-fitness-success/90" : ""}
                            onClick={() =>
                              handleUpdateSet(exerciseItem.id, set.id, "completed", !set.completed)
                            }
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddSet(exerciseItem.id)}
                  >
                    Add Set
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    {exerciseItem.sets.filter(s => s.completed).length} of {exerciseItem.sets.length} sets completed
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Exercise
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Exercise</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="strength">
                <TabsList className="w-full">
                  <TabsTrigger value="strength" onClick={() => setSelectedExerciseType("strength")}>
                    Strength
                  </TabsTrigger>
                  <TabsTrigger value="cardio" onClick={() => setSelectedExerciseType("cardio")}>
                    Cardio
                  </TabsTrigger>
                  <TabsTrigger value="flexibility" onClick={() => setSelectedExerciseType("flexibility")}>
                    Flexibility
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="strength" className="mt-4 max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                    {filteredExercises.map((exercise) => (
                      <Card key={exercise.id} className="cursor-pointer hover:bg-muted/50">
                        <CardHeader className="p-3" onClick={() => handleAddExercise(exercise)}>
                          <CardTitle className="text-base">{exercise.name}</CardTitle>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="cardio" className="mt-4 max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                    {filteredExercises.map((exercise) => (
                      <Card key={exercise.id} className="cursor-pointer hover:bg-muted/50">
                        <CardHeader className="p-3" onClick={() => handleAddExercise(exercise)}>
                          <CardTitle className="text-base">{exercise.name}</CardTitle>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="flexibility" className="mt-4 max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                    {filteredExercises.map((exercise) => (
                      <Card key={exercise.id} className="cursor-pointer hover:bg-muted/50">
                        <CardHeader className="p-3" onClick={() => handleAddExercise(exercise)}>
                          <CardTitle className="text-base">{exercise.name}</CardTitle>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default WorkoutView;
