import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, ChevronLeft, ChevronRight, ChartLine, Table2 } from "lucide-react";
import { format } from "date-fns";
import { Exercise, WorkoutExercise } from "@/types/workout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, XAxis,YAxis, Line, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer,ChartTooltip, ChartTooltipContent } from "./ui/chart";

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
  const [showChart, setShowChart] = useState(false);
  const [dateRange, setDateRange] = useState<"30d" | "90d" | "all" >("30d");

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
 
  const handleChart = () =>{
    setShowChart(!showChart);
    console.log(showChart)
  };

  const getChartData = () => {
      const now = new Date();
      const filteredHistory = workoutHistory.filter(entry => {
        if (dateRange === "all") return true;
        const date = new Date(entry.workout.date);
        const daysAgo = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        return daysAgo <= parseInt(dateRange);
      });
      return filteredHistory
        .map(entry => ({
          date: format(new Date(entry.workout.date), "MMM dd"),
          maxWeight: Math.max(...entry.exerciseData.sets
            .filter(s => s.completed)
            .map(s => Number(s.weight) || 0))
        }))
        .reverse(); // Show oldest to newest for chart
  };

  const chartConfig = {
      maxWeight: {
        label: "Max Weight (lbs)",
        color: "hsl(var(--primary))",
      },
    };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex ">
          <DialogTitle>{exercise.name}</DialogTitle>
           <Badge variant="secondary">
              <Button
              className="h-7 w-7"
              variant="ghost"
              onClick={handleChart}>
              {showChart ? <Table2/> : <ChartLine/>}
              </Button>
            </Badge>
          </div>
        </DialogHeader>

          {showChart ? ( 
            <div className="space-y-4">
                <div className="flex justify-end">
                <Select value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height={"100%"}>
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Line 
                    type="monotone" 
                    dataKey="maxWeight" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              </div>
            </div>
          ) : (
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
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseHistoryDialog;
