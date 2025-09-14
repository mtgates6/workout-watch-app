import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Target, TrendingUp, Edit, Trash2 } from "lucide-react";
import { useHealth } from "@/context/HealthContext";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

const WeeklyGoals = () => {
  const { 
    getActiveGoalsByFrequency, 
    getDailyHealthSummary,
    deleteHealthGoal,
    toggleGoalActive
  } = useHealth();

  const weeklyGoals = getActiveGoalsByFrequency('weekly');
  
  // Get current week dates
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Calculate weekly progress for daily goals
  const dailyGoals = getActiveGoalsByFrequency('daily');
  const weeklyProgress = weekDays.map(day => {
    const dateStr = day.toISOString().split('T')[0];
    return getDailyHealthSummary(dateStr);
  });

  const averageCompletionRate = weeklyProgress.reduce((acc, day) => acc + day.completionRate, 0) / 7;
  const totalDailyGoalsThisWeek = weeklyProgress.reduce((acc, day) => acc + day.totalGoals, 0);
  const completedDailyGoalsThisWeek = weeklyProgress.reduce((acc, day) => acc + day.completedGoals, 0);

  return (
    <div className="space-y-6">
      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-sm font-medium">Daily Goals Progress</div>
              <div className="text-2xl font-bold">{Math.round(averageCompletionRate)}%</div>
              <div className="text-xs text-muted-foreground">
                {completedDailyGoalsThisWeek} of {totalDailyGoalsThisWeek} daily goals completed
              </div>
              <Progress value={averageCompletionRate} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Weekly Goals</div>
              <div className="text-2xl font-bold">{weeklyGoals.length}</div>
              <div className="text-xs text-muted-foreground">
                active weekly objectives
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Consistency</div>
              <div className="text-2xl font-bold">
                {weeklyProgress.filter(day => day.completionRate === 100).length}/7
              </div>
              <div className="text-xs text-muted-foreground">
                perfect days this week
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Progress Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Progress This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => {
              const summary = weeklyProgress[index];
              const isToday = day.toDateString() === today.toDateString();
              const isFuture = day > today;
              
              return (
                <div
                  key={day.toISOString()}
                  className={`p-3 rounded-lg border text-center space-y-2 ${
                    isToday ? 'ring-2 ring-primary ring-offset-2' : ''
                  } ${isFuture ? 'opacity-50' : ''}`}
                >
                  <div className="text-xs font-medium">
                    {format(day, 'EEE')}
                  </div>
                  <div className="text-lg font-bold">
                    {format(day, 'd')}
                  </div>
                  {!isFuture && (
                    <>
                      <div className="text-xs text-muted-foreground">
                        {summary.completedGoals}/{summary.totalGoals}
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${summary.completionRate}%` }}
                        />
                      </div>
                      <div className="text-xs font-medium">
                        {summary.completionRate}%
                      </div>
                    </>
                  )}
                  {isFuture && (
                    <div className="text-xs text-muted-foreground">Upcoming</div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Goals List */}
      {weeklyGoals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Target className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No weekly goals yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mt-2">
              Set weekly objectives to track broader health and wellness targets.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Weekly Objectives</h3>
          {weeklyGoals.map((goal) => (
            <Card key={goal.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      {goal.emoji && <span className="text-xl">{goal.emoji}</span>}
                      <h4 className="font-medium">{goal.name}</h4>
                      <Badge variant="outline">{goal.type}</Badge>
                    </div>
                    
                    {goal.description && (
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    )}

                    {goal.target && goal.unit && (
                      <div className="text-sm text-muted-foreground">
                        Target: {goal.target} {goal.unit} this week
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Created {format(new Date(goal.createdAt), 'MMM d, yyyy')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleGoalActive(goal.id)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteHealthGoal(goal.id)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeeklyGoals;