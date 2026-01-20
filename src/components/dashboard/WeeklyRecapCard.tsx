import React, { useMemo } from "react";
import { useWorkout } from "@/context/WorkoutContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Flame, Target, Dumbbell, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface MuscleGroupStats {
  name: string;
  currentSets: number;
  previousSets: number;
  change: number;
  changePercent: number;
}

interface ExerciseProgress {
  name: string;
  currentMaxWeight: number;
  previousMaxWeight: number;
  currentMaxReps: number;
  previousMaxReps: number;
  improved: boolean;
  improvementType: 'weight' | 'reps' | 'both' | 'none';
}

const WeeklyRecapCard = () => {
  const { workouts } = useWorkout();

  const weeklyStats = useMemo(() => {
    const now = new Date();
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - 7);
    startOfThisWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    // Filter completed workouts
    const completedWorkouts = workouts.filter(w => w.completed);

    const thisWeekWorkouts = completedWorkouts.filter(w => {
      const workoutDate = new Date(w.date);
      return workoutDate >= startOfThisWeek && workoutDate <= now;
    });

    const lastWeekWorkouts = completedWorkouts.filter(w => {
      const workoutDate = new Date(w.date);
      return workoutDate >= startOfLastWeek && workoutDate < startOfThisWeek;
    });

    // Calculate sets per muscle group
    const muscleGroupSets: Record<string, { current: number; previous: number }> = {};

    thisWeekWorkouts.forEach(workout => {
      workout.exercises.forEach(ex => {
        ex.exercise.muscleGroups.forEach(muscle => {
          if (!muscleGroupSets[muscle]) {
            muscleGroupSets[muscle] = { current: 0, previous: 0 };
          }
          muscleGroupSets[muscle].current += ex.sets.filter(s => s.completed).length;
        });
      });
    });

    lastWeekWorkouts.forEach(workout => {
      workout.exercises.forEach(ex => {
        ex.exercise.muscleGroups.forEach(muscle => {
          if (!muscleGroupSets[muscle]) {
            muscleGroupSets[muscle] = { current: 0, previous: 0 };
          }
          muscleGroupSets[muscle].previous += ex.sets.filter(s => s.completed).length;
        });
      });
    });

    const muscleGroupStats: MuscleGroupStats[] = Object.entries(muscleGroupSets)
      .map(([name, stats]) => ({
        name,
        currentSets: stats.current,
        previousSets: stats.previous,
        change: stats.current - stats.previous,
        changePercent: stats.previous > 0 
          ? Math.round(((stats.current - stats.previous) / stats.previous) * 100)
          : stats.current > 0 ? 100 : 0
      }))
      .sort((a, b) => b.currentSets - a.currentSets);

    // Track exercise progress (weight/reps improvements)
    const exerciseProgress: ExerciseProgress[] = [];
    const exerciseMap = new Map<string, { thisWeek: { maxWeight: number; maxReps: number }; lastWeek: { maxWeight: number; maxReps: number } }>();

    thisWeekWorkouts.forEach(workout => {
      workout.exercises.forEach(ex => {
        const exerciseName = ex.exercise.name;
        if (!exerciseMap.has(exerciseName)) {
          exerciseMap.set(exerciseName, {
            thisWeek: { maxWeight: 0, maxReps: 0 },
            lastWeek: { maxWeight: 0, maxReps: 0 }
          });
        }
        const data = exerciseMap.get(exerciseName)!;
        ex.sets.forEach(set => {
          if (set.completed) {
            const weight = typeof set.weight === 'number' ? set.weight : 0;
            const reps = typeof set.reps === 'number' ? set.reps : 0;
            if (weight > data.thisWeek.maxWeight) {
              data.thisWeek.maxWeight = weight;
            }
            if (reps > data.thisWeek.maxReps) {
              data.thisWeek.maxReps = reps;
            }
          }
        });
      });
    });

    lastWeekWorkouts.forEach(workout => {
      workout.exercises.forEach(ex => {
        const exerciseName = ex.exercise.name;
        if (!exerciseMap.has(exerciseName)) {
          exerciseMap.set(exerciseName, {
            thisWeek: { maxWeight: 0, maxReps: 0 },
            lastWeek: { maxWeight: 0, maxReps: 0 }
          });
        }
        const data = exerciseMap.get(exerciseName)!;
        ex.sets.forEach(set => {
          if (set.completed) {
            const weight = typeof set.weight === 'number' ? set.weight : 0;
            const reps = typeof set.reps === 'number' ? set.reps : 0;
            if (weight > data.lastWeek.maxWeight) {
              data.lastWeek.maxWeight = weight;
            }
            if (reps > data.lastWeek.maxReps) {
              data.lastWeek.maxReps = reps;
            }
          }
        });
      });
    });

    exerciseMap.forEach((data, name) => {
      if (data.thisWeek.maxWeight > 0 || data.lastWeek.maxWeight > 0) {
        const weightImproved = data.thisWeek.maxWeight > data.lastWeek.maxWeight && data.lastWeek.maxWeight > 0;
        const repsImproved = data.thisWeek.maxReps > data.lastWeek.maxReps && data.lastWeek.maxReps > 0;
        
        let improvementType: 'weight' | 'reps' | 'both' | 'none' = 'none';
        if (weightImproved && repsImproved) improvementType = 'both';
        else if (weightImproved) improvementType = 'weight';
        else if (repsImproved) improvementType = 'reps';

        exerciseProgress.push({
          name,
          currentMaxWeight: data.thisWeek.maxWeight,
          previousMaxWeight: data.lastWeek.maxWeight,
          currentMaxReps: data.thisWeek.maxReps,
          previousMaxReps: data.lastWeek.maxReps,
          improved: weightImproved || repsImproved,
          improvementType
        });
      }
    });

    // Calculate total volume
    const thisWeekVolume = thisWeekWorkouts.reduce((total, workout) => {
      return total + workout.exercises.reduce((exTotal, ex) => {
        return exTotal + ex.sets.reduce((setTotal, set) => {
          if (set.completed) {
            const weight = typeof set.weight === 'number' ? set.weight : 0;
            const reps = typeof set.reps === 'number' ? set.reps : 0;
            return setTotal + (weight * reps);
          }
          return setTotal;
        }, 0);
      }, 0);
    }, 0);

    const lastWeekVolume = lastWeekWorkouts.reduce((total, workout) => {
      return total + workout.exercises.reduce((exTotal, ex) => {
        return exTotal + ex.sets.reduce((setTotal, set) => {
          if (set.completed) {
            const weight = typeof set.weight === 'number' ? set.weight : 0;
            const reps = typeof set.reps === 'number' ? set.reps : 0;
            return setTotal + (weight * reps);
          }
          return setTotal;
        }, 0);
      }, 0);
    }, 0);

    const volumeChange = lastWeekVolume > 0 
      ? Math.round(((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100)
      : thisWeekVolume > 0 ? 100 : 0;

    const progressCount = exerciseProgress.filter(e => e.improved).length;

    return {
      muscleGroupStats,
      exerciseProgress: exerciseProgress.filter(e => e.improved).slice(0, 5),
      thisWeekWorkouts: thisWeekWorkouts.length,
      lastWeekWorkouts: lastWeekWorkouts.length,
      thisWeekVolume,
      lastWeekVolume,
      volumeChange,
      progressCount,
      totalExercises: exerciseProgress.length
    };
  }, [workouts]);

  const maxSets = Math.max(...weeklyStats.muscleGroupStats.map(m => m.currentSets), 1);

  if (weeklyStats.thisWeekWorkouts === 0 && weeklyStats.lastWeekWorkouts === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-fitness-primary" />
            <CardTitle className="text-lg font-medium">Weekly Recap</CardTitle>
          </div>
          <CardDescription>Your progress over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Dumbbell className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No workouts in the last 2 weeks</p>
            <p className="text-sm text-muted-foreground mt-1">Start training to see your progress!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-fitness-primary/10 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-fitness-primary/20">
              <Flame className="h-5 w-5 text-fitness-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-medium">Weekly Recap</CardTitle>
              <CardDescription>Last 7 days of progress</CardDescription>
            </div>
          </div>
          {weeklyStats.progressCount > 0 && (
            <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
              <TrendingUp className="h-3 w-3 mr-1" />
              {weeklyStats.progressCount} PR{weeklyStats.progressCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 space-y-5">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-fitness-primary">{weeklyStats.thisWeekWorkouts}</p>
            <p className="text-xs text-muted-foreground">Workouts</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-fitness-primary">
              {weeklyStats.thisWeekVolume >= 1000 
                ? `${(weeklyStats.thisWeekVolume / 1000).toFixed(1)}k` 
                : weeklyStats.thisWeekVolume}
            </p>
            <p className="text-xs text-muted-foreground">Volume (lbs)</p>
          </div>
          <div className={`text-center p-3 rounded-lg ${weeklyStats.volumeChange > 0 ? 'bg-green-500/10' : weeklyStats.volumeChange < 0 ? 'bg-yellow-500/10' : 'bg-muted/50'}`}>
            <div className="flex items-center justify-center gap-1">
              {weeklyStats.volumeChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : weeklyStats.volumeChange < 0 ? (
                <TrendingDown className="h-4 w-4 text-yellow-500" />
              ) : (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )}
              <p className={`text-2xl font-bold ${weeklyStats.volumeChange > 0 ? 'text-green-500' : weeklyStats.volumeChange < 0 ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                {weeklyStats.volumeChange > 0 ? '+' : ''}{weeklyStats.volumeChange}%
              </p>
            </div>
            <p className="text-xs text-muted-foreground">vs Last Week</p>
          </div>
        </div>

        {/* Progress Highlights */}
        {weeklyStats.exerciseProgress.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              <h4 className="font-medium text-sm">Progress This Week</h4>
            </div>
            <div className="space-y-1.5">
              {weeklyStats.exerciseProgress.map((exercise, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-green-500/10 border border-green-500/20"
                >
                  <span className="text-sm font-medium truncate flex-1">{exercise.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {exercise.improvementType === 'weight' || exercise.improvementType === 'both' ? (
                      <Badge variant="outline" className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30 text-xs">
                        +{exercise.currentMaxWeight - exercise.previousMaxWeight} lbs
                      </Badge>
                    ) : null}
                    {exercise.improvementType === 'reps' || exercise.improvementType === 'both' ? (
                      <Badge variant="outline" className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30 text-xs">
                        +{exercise.currentMaxReps - exercise.previousMaxReps} reps
                      </Badge>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sets per Muscle Group */}
        {weeklyStats.muscleGroupStats.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-fitness-primary" />
              <h4 className="font-medium text-sm">Sets per Muscle Group</h4>
            </div>
            <div className="space-y-2">
              {weeklyStats.muscleGroupStats.slice(0, 6).map((muscle, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize">{muscle.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{muscle.currentSets} sets</span>
                      {muscle.change !== 0 && (
                        <span className={`text-xs ${muscle.change > 0 ? 'text-green-500' : 'text-yellow-500'}`}>
                          {muscle.change > 0 ? '+' : ''}{muscle.change}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={(muscle.currentSets / maxSets) * 100} 
                      className="h-2"
                    />
                    {muscle.change > 0 && (
                      <div 
                        className="absolute top-0 h-2 bg-green-500/50 rounded-full transition-all"
                        style={{ 
                          left: `${((muscle.currentSets - muscle.change) / maxSets) * 100}%`,
                          width: `${(muscle.change / maxSets) * 100}%`
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progressive Overload Tip */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-fitness-primary/10 to-fitness-secondary/10 border border-fitness-primary/20">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">💪 Progressive Overload Tip:</span>{' '}
            {weeklyStats.volumeChange > 0 
              ? "Great progress! Keep adding small increments each week."
              : weeklyStats.volumeChange < 0
              ? "Volume dropped this week. Try to match or exceed last week's numbers."
              : "Maintain consistency and try adding 2.5-5 lbs next session."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyRecapCard;
