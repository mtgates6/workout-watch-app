import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Exercise, WorkoutExercise } from "@/types/workout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ExerciseHistoryDialogProps {
  exercise: Exercise;
  workoutHistory: Array<{
    workout: {
      id: string;
      name: string;
      date: string;
    };
    exerciseData: WorkoutExercise;
  }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExerciseHistoryDialog = ({ exercise, workoutHistory, open, onOpenChange }: ExerciseHistoryDialogProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (workoutHistory.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{exercise.name} - History</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center text-muted-foreground">
            No history found for this exercise
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const currentEntry = workoutHistory[selectedIndex];
  const completedSets = currentEntry.exerciseData.sets.filter(set => set.completed);

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : workoutHistory.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < workoutHistory.length - 1 ? prev + 1 : 0));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{exercise.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Date Navigator */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Select onValueChange={(value) =>setSelectedIndex(parseInt(value))}
                    value={selectedIndex.toString()}
                  >
                  <SelectTrigger className="w-[160px] text-center">
                    <SelectValue>
                      {format(
                        new Date(workoutHistory[selectedIndex].workout.date),
                        "MMM dd, yyyy"  
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {workoutHistory.map((entry, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {format(new Date(entry.workout.date), "MMM dd, yyyy")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {currentEntry.workout.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedIndex + 1} of {workoutHistory.length}
              </p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Sets Table */}
          <div className="border rounded-lg">
            <ScrollArea className="h-[300px]">
              {completedSets.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Set</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Reps</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedSets.map((set, index) => (
                      <TableRow key={set.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{set.weight ? `${set.weight} lbs` : "—"}</TableCell>
                        <TableCell>{set.reps || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No completed sets
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Notes */}
          {currentEntry.exerciseData.notes && (
            <div className="border rounded-lg p-3 bg-muted/50">
              <p className="text-sm font-medium mb-1">Notes</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {currentEntry.exerciseData.notes}
              </p>
            </div>
          )}

          {/* Summary Stats */}
          <div className="flex gap-2">
            <Badge variant="secondary" className="flex-1 justify-center py-2">
              {completedSets.length} sets
            </Badge>
            {completedSets.length > 0 && (
              <>
                <Badge variant="secondary" className="flex-1 justify-center py-2">
                  Max: {Math.max(...completedSets.map(s => Number(s.weight) || 0))} lbs
                </Badge>
                <Badge variant="secondary" className="flex-1 justify-center py-2">
                  Total: {completedSets.reduce((sum, s) => sum + (Number(s.reps) || 0), 0)} reps
                </Badge>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseHistoryDialog;
