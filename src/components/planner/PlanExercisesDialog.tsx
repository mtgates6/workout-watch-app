
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Play } from "lucide-react";
import { Workout, Exercise } from "@/types/workout";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface PlanExercisesDialogProps {
  isMobile: boolean;
  planDialogOpen: boolean;
  setPlanDialogOpen: (open: boolean) => void;
  selectedWorkout: Workout | null;
  exerciseSearch: string;
  setExerciseSearch: (search: string) => void;
  filteredExercises: Exercise[];
  plannedExercises: Exercise[];
  workoutNotes: string;
  setWorkoutNotes: (notes: string) => void;
  handleAddExerciseToPlan: (exercise: Exercise) => void;
  handleRemoveExerciseFromPlan: (exerciseId: string) => void;
  handleDragEnd: (result: any) => void;
  handleClosePlanDialog: () => void;
  handleSavePlan: (callback?: () => void) => void;
  handleStartPlannedWorkout: (workout: Workout) => void;
}

export const PlanExercisesDialog: React.FC<PlanExercisesDialogProps> = ({
  isMobile,
  planDialogOpen,
  setPlanDialogOpen,
  selectedWorkout,
  exerciseSearch,
  setExerciseSearch,
  filteredExercises,
  plannedExercises,
  workoutNotes,
  setWorkoutNotes,
  handleAddExerciseToPlan,
  handleRemoveExerciseFromPlan,
  handleDragEnd,
  handleClosePlanDialog,
  handleSavePlan,
  handleStartPlannedWorkout,
}) => {
  const handleSaveAndStartWorkout = () => {
    if (!selectedWorkout) return;
    
    console.log('Saving and starting workout with planned exercises:', plannedExercises);
    console.log('Workout notes:', workoutNotes);
    
    // Create the updated workout object with current state
    const updatedWorkout = {
      ...selectedWorkout,
      plannedExercises,
      notes: workoutNotes
    };
    
    console.log('Updated workout object:', updatedWorkout);
    
    // First save the current plan state, then start with the updated workout
    handleSavePlan(() => {
      console.log('Save completed, now starting workout');
      // Use the updated workout object instead of the stale selectedWorkout
      handleStartPlannedWorkout(updatedWorkout);
    });
  };

  const renderExerciseContent = () => (
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
          <DragDropContext onDragEnd={handleDragEnd} disableInteractiveElementBlocking={true}>
            <Droppable droppableId="plannedExercises">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2 max-h-40 overflow-y-auto"
                >
                  {plannedExercises.map((exercise, index) => (
                    <Draggable key={exercise.id} draggableId={exercise.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex justify-between items-center p-2 bg-muted rounded-md ${
                            snapshot.isDragging ? "opacity-50" : "opacity-100"
                          }`}
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
  );

  if (isMobile) {
    return (
      <Drawer open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Plan Workout: {selectedWorkout?.name}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4">
            {renderExerciseContent()}
          </div>
          <DrawerFooter className="px-4">
            {selectedWorkout && (
              <Button 
                onClick={handleSaveAndStartWorkout}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Play className="h-4 w-4 mr-1" />
                Start Workout
              </Button>
            )}
            <Button onClick={() => handleSavePlan()}>Save Plan</Button>
            <Button variant="outline" onClick={handleClosePlanDialog}>Cancel</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Plan Workout: {selectedWorkout?.name}</DialogTitle>
        </DialogHeader>
        {renderExerciseContent()}
        <DialogFooter className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleClosePlanDialog}>Cancel</Button>
          <Button onClick={() => handleSavePlan()}>Save Plan</Button>
          {selectedWorkout && (
            <Button 
              onClick={handleSaveAndStartWorkout}
              className="bg-green-500 hover:bg-green-600 text-white ml-auto"
            >
              <Play className="h-4 w-4 mr-1" />
              Start Workout
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
