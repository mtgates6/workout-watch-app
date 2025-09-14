import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, Circle, Plus, Minus } from "lucide-react";
import { useHealth } from "@/context/HealthContext";
import { HealthGoal } from "@/types/health";
import { format } from "date-fns";

const DailyTracker = () => {
  const { 
    getActiveGoalsByFrequency, 
    getDailyHealthSummary, 
    markGoalComplete, 
    markGoalIncomplete,
    getEntryForGoalAndDate 
  } = useHealth();

  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [goalValues, setGoalValues] = useState<Record<string, number>>({});

  const dailyGoals = getActiveGoalsByFrequency('daily');
  const dailySummary = getDailyHealthSummary(selectedDate);

  const handleGoalToggle = (goal: HealthGoal, checked: boolean) => {
    if (checked) {
      const value = goal.target ? (goalValues[goal.id] || goal.target) : undefined;
      markGoalComplete(goal.id, selectedDate, value);
    } else {
      markGoalIncomplete(goal.id, selectedDate);
    }
  };

  const handleValueChange = (goalId: string, value: number) => {
    setGoalValues(prev => ({ ...prev, [goalId]: value }));
  };

  const isGoalCompleted = (goalId: string) => {
    const entry = getEntryForGoalAndDate(goalId, selectedDate);
    return entry?.completed || false;
  };

  const getGoalValue = (goal: HealthGoal) => {
    const entry = getEntryForGoalAndDate(goal.id, selectedDate);
    return entry?.value || goalValues[goal.id] || (goal.target || 0);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
            {isToday && (
              <Badge variant="secondary">Today</Badge>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
              </span>
              <span className="text-sm text-muted-foreground">
                {dailySummary.completedGoals} of {dailySummary.totalGoals} goals completed
              </span>
            </div>
            <Progress value={dailySummary.completionRate} className="h-2" />
            <div className="text-center text-sm font-medium">
              {dailySummary.completionRate}% Complete
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Goals List */}
      {dailyGoals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No daily goals yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mt-2">
              Create your first daily health goal to start tracking your habits.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {dailyGoals.map((goal) => {
            const isCompleted = isGoalCompleted(goal.id);
            const currentValue = getGoalValue(goal);

            return (
              <Card key={goal.id} className={isCompleted ? "border-green-200 bg-green-50/50" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={(checked) => handleGoalToggle(goal, checked as boolean)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {goal.emoji && <span className="text-xl">{goal.emoji}</span>}
                        <h3 className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                          {goal.name}
                        </h3>
                        <Badge variant={isCompleted ? "default" : "outline"} className="ml-auto">
                          {goal.type}
                        </Badge>
                      </div>

                      {goal.description && (
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      )}

                      {goal.target && goal.unit && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleValueChange(goal.id, Math.max(0, currentValue - 1))}
                            disabled={isCompleted}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          
                          <div className="flex items-center gap-2 min-w-0">
                            <Input
                              type="number"
                              value={currentValue}
                              onChange={(e) => handleValueChange(goal.id, parseInt(e.target.value) || 0)}
                              className="w-20 text-center"
                              disabled={isCompleted}
                              min={0}
                            />
                            <span className="text-sm text-muted-foreground">
                              / {goal.target} {goal.unit}
                            </span>
                          </div>

                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleValueChange(goal.id, currentValue + 1)}
                            disabled={isCompleted}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {goal.target && goal.unit && (
                        <div className="space-y-1">
                          <Progress value={Math.min(100, (currentValue / goal.target) * 100)} className="h-2" />
                          <div className="text-xs text-muted-foreground">
                            {Math.round((currentValue / goal.target) * 100)}% of target
                          </div>
                        </div>
                      )}
                    </div>

                    {isCompleted && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DailyTracker;