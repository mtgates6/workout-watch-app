import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Workout, WorkoutExercise } from "@/types/workout";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Minus, Flame, Target, Share2, BarChart3, Trophy, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WorkoutRecapDialogProps {
  workout: Workout;
  allWorkouts: Workout[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ExerciseComparison {
  name: string;
  currentMaxWeight: number;
  currentMaxReps: number;
  currentTotalVolume: number;
  currentSets: number;
  previousMaxWeight: number;
  previousMaxReps: number;
  previousTotalVolume: number;
  previousSets: number;
  status: "progressed" | "maintained" | "decreased";
  change: number;
  volumeChange: number;
}

interface PersonalRecord {
  exerciseName: string;
  improvement: string;
  previousValue: number;
  newValue: number;
  type: string;
}

const WorkoutRecapDialog: React.FC<WorkoutRecapDialogProps> = ({
  workout,
  allWorkouts,
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();

  const calculateExerciseVolume = (exerciseItem: WorkoutExercise): number => {
    return exerciseItem.sets
      .filter((s) => s.completed)
      .reduce((total, set) => {
        const weight = Number(set.weight) || 0;
        const reps = Number(set.reps) || 0;
        return total + weight * reps;
      }, 0);
  };

  const calculateExerciseMaxWeight = (exerciseItem: WorkoutExercise): number => {
    const weights = exerciseItem.sets
      .filter((s) => s.completed)
      .map((s) => Number(s.weight) || 0);
    return Math.max(0, ...weights);
  };
  const calculateExerciseMaxReps = (exerciseItem: WorkoutExercise): number => {
    const reps = exerciseItem.sets
      .filter((s) => s.completed)
      .map((s) => Number(s.reps) || 0);
    return Math.max(0, ...reps);
  };

  const getPreviousWorkoutForExercise = (exerciseName: string): WorkoutExercise | null => {
    const previousWorkouts = allWorkouts
      .filter((w) => w.completed && w.id !== workout.id && new Date(w.date) < new Date(workout.date))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const prevWorkout of previousWorkouts) {
      const exercise = prevWorkout.exercises.find((e) => e.exercise.name === exerciseName);
      if (exercise) return exercise;
    }
    return null;
  };

  const exerciseComparisons = useMemo((): ExerciseComparison[] => {
    return workout.exercises.map((exerciseItem) => {
     const currentVolume = calculateExerciseVolume(exerciseItem);
     const currentMaxWeight = calculateExerciseMaxWeight(exerciseItem);
     const currentMaxReps = calculateExerciseMaxReps(exerciseItem);
     const currentSets = exerciseItem.sets.filter((s) => s.completed).length;
     
     const previousExercise = getPreviousWorkoutForExercise(exerciseItem.exercise.name);
     const previousVolume = previousExercise ? calculateExerciseVolume(previousExercise) : 0;
     const previousMaxWeight = previousExercise ? calculateExerciseMaxWeight(previousExercise) : 0;
     const previousMaxReps = previousExercise ? calculateExerciseMaxReps(previousExercise) : 0;
     const previousSets = previousExercise
     ? previousExercise.sets.filter((s) => s.completed).length
     : 0;
     
     let status: "progressed" | "maintained" | "decreased";
     let change = 0;
     const volumeChange = previousVolume > 0 ? currentVolume - previousVolume : 0;

      if (currentMaxWeight > previousMaxWeight && previousMaxWeight > 0) {
        status = "progressed";
        change = currentMaxWeight - previousMaxWeight;
      } else if (currentMaxWeight < previousMaxWeight && previousMaxWeight > 0) {
        status = "decreased";
        change = previousMaxWeight - currentMaxWeight;
      } else {
        status = "maintained";
      }

      return {
        name: exerciseItem.exercise.name,
        currentMaxWeight,
        currentTotalVolume: currentVolume,
        currentSets,
        previousMaxWeight,
        previousTotalVolume: previousVolume,
        previousSets,
        status,
        change,
        currentMaxReps,
        previousMaxReps,
        volumeChange,
      };
    });
  }, [workout, allWorkouts]);

  const personalRecords = useMemo((): PersonalRecord[] => {
    const records: PersonalRecord[] = [];
    
    exerciseComparisons.forEach((comp) => {
      // Weight PR
      if (comp.status === "progressed" && comp.previousMaxWeight > 0) {
        records.push({
          exerciseName: comp.name,
          improvement: `+${comp.change} lbs`,
          previousValue: comp.previousMaxWeight,
          newValue: comp.currentMaxWeight,
          type: "weight",
        });
      }
      
      // Rep PR (at same or higher weight)
      if (comp.currentMaxReps > comp.previousMaxReps && comp.previousMaxReps > 0 && 
          comp.currentMaxWeight >= comp.previousMaxWeight) {
        records.push({
          exerciseName: comp.name,
          improvement: `+${comp.currentMaxReps - comp.previousMaxReps} reps`,
          previousValue: comp.previousMaxReps,
          newValue: comp.currentMaxReps,
          type: "reps",
        });
      }
    });
    
    return records;
  }, [exerciseComparisons]);

  const totalVolume = useMemo(() => {
    return workout.exercises.reduce((total, ex) => total + calculateExerciseVolume(ex), 0);
  }, [workout]);

  const totalSets = useMemo(() => {
    return workout.exercises.reduce(
      (total, ex) => total + ex.sets.filter((s) => s.completed).length,
      0
    );
  }, [workout]);

  const previousWorkoutStats = useMemo(() => {
    const previousCompleted = allWorkouts
      .filter((w) => w.completed && w.id !== workout.id && new Date(w.date) < new Date(workout.date))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (!previousCompleted) return null;

    const volume = previousCompleted.exercises.reduce(
      (total, ex) => total + calculateExerciseVolume(ex),
      0
    );
    const sets = previousCompleted.exercises.reduce(
      (total, ex) => total + ex.sets.filter((s) => s.completed).length,
      0
    );

    return { volume, sets };
  }, [allWorkouts, workout]);

  const volumeChange = previousWorkoutStats
    ? ((totalVolume - previousWorkoutStats.volume) / previousWorkoutStats.volume) * 100
    : 0;

  const setsChange = previousWorkoutStats ? totalSets - previousWorkoutStats.sets : 0;

  const progressStreak = useMemo(() => {
    const sortedWorkouts = allWorkouts
      .filter((w) => w.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < sortedWorkouts.length - 1; i++) {
      const currentWorkout = sortedWorkouts[i];
      const prevWorkout = sortedWorkouts[i + 1];

      const hasProgress = currentWorkout.exercises.some((ex) => {
        const currentMax = calculateExerciseMaxWeight(ex);
        const prevExercise = prevWorkout.exercises.find(
          (e) => e.exercise.name === ex.exercise.name
        );
        if (!prevExercise) return false;
        const prevMax = calculateExerciseMaxWeight(prevExercise);
        return currentMax > prevMax;
      });

      if (hasProgress) {
        tempStreak++;
        if (i === 0) currentStreak = tempStreak;
      } else {
        if (tempStreak > bestStreak) bestStreak = tempStreak;
        tempStreak = 0;
      }
    }

    if (tempStreak > bestStreak) bestStreak = tempStreak;
    if (currentStreak === 0 && tempStreak > 0) currentStreak = tempStreak;

    return { current: currentStreak, best: Math.max(bestStreak, currentStreak) };
  }, [allWorkouts]);

  const nextWorkoutGoals = useMemo(() => {
    const goals: string[] = [];
    const compoundLifts = ["Bench Press", "Squat", "Deadlift", "Overhead Press", "Barbell Row"];

    exerciseComparisons.slice(0, 3).forEach((comp) => {
      const isCompound = compoundLifts.some((lift) =>
        comp.name.toLowerCase().includes(lift.toLowerCase())
      );
      const increment = isCompound ? 5 : 2.5;

      if (comp.status === "progressed" || comp.status === "maintained") {
        goals.push(`${comp.name}: Try ${comp.currentMaxWeight + increment} lbs`);
      } else if (comp.status === "decreased") {
        goals.push(`${comp.name}: Match ${comp.previousMaxWeight} lbs`);
      }
    });

    return goals.slice(0, 3);
  }, [exerciseComparisons]);

  const handleShare = async () => {
    const summary = [
      `🔥 Workout Complete!`,
      `📋 ${workout.name}`,
      `📅 ${format(new Date(workout.date), "MMM dd, yyyy")}`,
      "",
      `💪 Total Volume: ${totalVolume.toLocaleString()} lbs${
        volumeChange > 0 ? ` (+${volumeChange.toFixed(0)}%)` : 
        volumeChange < 0 ? ` (${volumeChange.toFixed(0)}%)` : ''
      }`,
      `🎯 Sets Completed: ${totalSets}`,
      personalRecords.length > 0 ? `\n🏆 Personal Records:` : "",
      ...personalRecords.map(pr => 
        `  • ${pr.exerciseName}: ${pr.newValue} lbs ${pr.improvement}`
      ),
      progressStreak.current > 0 ? 
        `\n🔥 ${progressStreak.current} workout progress streak!` : "",
    ]
      .filter(Boolean)
      .join("\n");

    if (navigator.share) {
      try {
        await navigator.share({ title: "Workout Recap", text: summary });
      } catch {
        await navigator.clipboard.writeText(summary);
        toast({ title: "Copied to clipboard!" });
      }
    } else {
      await navigator.clipboard.writeText(summary);
      toast({ title: "Copied to clipboard!" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="text-center pb-2">
          <div className="text-4xl mb-2">🔥</div>
          <DialogTitle className="text-2xl font-bold">Workout Complete!</DialogTitle>
          <p className="text-muted-foreground">
            {workout.name} • {format(new Date(workout.date), "MMM dd, yyyy")}
          </p>
        </DialogHeader>
        <div className="space-y-4">
          {/* First Workout Empty State */}
          {!previousWorkoutStats && (
            <div className="text-center p-4 bg-muted/50 rounded-lg border-2 border-dashed">
              <p className="text-sm text-muted-foreground">
                🎉 First workout tracked! Keep it up to see progress comparisons.
              </p>
            </div>
          )}
          {/* Personal Records */}
          {personalRecords.length > 0 && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold text-green-700 dark:text-green-400">
                  Personal Records!
                </h3>
              </div>
              <div className="space-y-2">
                {personalRecords.map((pr, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span>{pr.exerciseName}</span>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-400">
                      {pr.improvement}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Total Volume</p>
                <p className="text-xl font-bold">{totalVolume.toLocaleString()} lbs</p>
                {previousWorkoutStats && volumeChange !== 0 && (
                  <Badge
                    variant="secondary"
                    className={
                      volumeChange > 0
                        ? "bg-green-500/20 text-green-700 dark:text-green-400 mt-1"
                        : "bg-muted text-muted-foreground mt-1"
                    }
                  >
                    {volumeChange > 0 ? "+" : ""}
                    {volumeChange.toFixed(0)}%
                  </Badge>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Working Sets</p>
                <p className="text-xl font-bold">{totalSets}</p>
                {previousWorkoutStats && setsChange !== 0 && (
                  <Badge
                    variant="secondary"
                    className={
                      setsChange > 0
                        ? "bg-green-500/20 text-green-700 dark:text-green-400 mt-1"
                        : "bg-muted text-muted-foreground mt-1"
                    }
                  >
                    {setsChange > 0 ? "+" : ""}
                    {setsChange}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Exercise Breakdown */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Exercise Performance
            </h3>
            <div className="space-y-2">
              {exerciseComparisons.map((comp, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{comp.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {comp.currentSets} sets • {comp.currentMaxWeight} lbs max
                      {comp.previousTotalVolume > 0 && (
                          <> • Vol: {comp.currentTotalVolume.toLocaleString()} lbs
                            {comp.volumeChange > 0 && (
                              <span className="text-green-600 dark:text-green-400"> (+{comp.volumeChange.toLocaleString()})</span>
                            )}
                          </>
                        )}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      comp.status === "progressed"
                        ? "bg-green-500/20 text-green-700 dark:text-green-400"
                        : comp.status === "decreased"
                        ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {comp.status === "progressed" && (
                      <>
                        <TrendingUp className="h-3 w-3 mr-1" /> +{comp.change}
                      </>
                    )}
                    {comp.status === "maintained" && (
                      <>
                        <Minus className="h-3 w-3 mr-1" /> Same
                      </>
                    )}
                    {comp.status === "decreased" && (
                      <>
                        <TrendingDown className="h-3 w-3 mr-1" /> -{comp.change}
                      </>
                    )}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Progressive Overload Streak */}
          {progressStreak.current > 0 && (
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold text-orange-700 dark:text-orange-400">
                  Progress Streak
                </h3>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{progressStreak.current}</p>
                  <p className="text-xs text-muted-foreground">Current streak</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-muted-foreground">
                    {progressStreak.best}
                  </p>
                  <p className="text-xs text-muted-foreground">Best streak</p>
                </div>
              </div>
            </div>
          )}

          {/* Next Workout Goals */}
          {nextWorkoutGoals.length > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold text-blue-700 dark:text-blue-400">
                  Next Workout Goals
                </h3>
              </div>
              <div className="space-y-2">
                {nextWorkoutGoals.map((goal, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <Zap className="h-3 w-3 text-blue-500" />
                    <span>{goal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button className="flex-1" onClick={() => onOpenChange(false)}>
              Return
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkoutRecapDialog;
