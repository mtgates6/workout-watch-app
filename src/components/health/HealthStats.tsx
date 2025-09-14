import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar,
  Activity,
  Award
} from "lucide-react";
import { useHealth } from "@/context/HealthContext";
import { format, subDays, eachDayOfInterval } from "date-fns";

const HealthStats = () => {
  const { 
    goals, 
    healthStats, 
    getDailyHealthSummary, 
    getActiveGoalsByFrequency 
  } = useHealth();

  // Get last 30 days of data for trends
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date()
  });

  const last30DaysData = last30Days.map(day => {
    const dateStr = day.toISOString().split('T')[0];
    return {
      date: dateStr,
      ...getDailyHealthSummary(dateStr)
    };
  });

  // Calculate trends
  const recentWeekAvg = last30DaysData.slice(-7).reduce((acc, day) => acc + day.completionRate, 0) / 7;
  const previousWeekAvg = last30DaysData.slice(-14, -7).reduce((acc, day) => acc + day.completionRate, 0) / 7;
  const weekOverWeekChange = recentWeekAvg - previousWeekAvg;

  // Goal type breakdown
  const goalsByType = goals.reduce((acc, goal) => {
    acc[goal.type] = (acc[goal.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const activeGoalsByType = goals.filter(g => g.active).reduce((acc, goal) => {
    acc[goal.type] = (acc[goal.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate completion streaks
  const perfectDays = last30DaysData.filter(day => day.totalGoals > 0 && day.completionRate === 100).length;
  const activeDays = last30DaysData.filter(day => day.totalGoals > 0).length;

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Trend</CardTitle>
            {weekOverWeekChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weekOverWeekChange >= 0 ? '+' : ''}{Math.round(weekOverWeekChange)}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs last week ({Math.round(recentWeekAvg)}% avg this week)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perfect Days</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{perfectDays}</div>
            <p className="text-xs text-muted-foreground">
              out of {activeDays} active days (30d)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consistency</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeDays > 0 ? Math.round((perfectDays / activeDays) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              perfect day rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goal Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goal Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(goalsByType).map(([type, total]) => {
            const active = activeGoalsByType[type] || 0;
            const percentage = total > 0 ? (active / total) * 100 : 0;
            
            return (
              <div key={type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{type}</span>
                    <Badge variant="outline">{active} active</Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {active} of {total} goals
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
          
          {Object.keys(goalsByType).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No goals created yet. Start by adding your first health goal!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Last 30 Days Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            30-Day Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-1">
              {last30Days.map((day, index) => {
                const summary = last30DaysData[index];
                const isToday = day.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`aspect-square rounded border text-xs flex flex-col items-center justify-center relative ${
                      isToday ? 'ring-2 ring-primary ring-offset-1' : ''
                    }`}
                    title={`${format(day, 'MMM d')}: ${summary.completionRate}% complete`}
                  >
                    {summary.totalGoals > 0 && (
                      <div
                        className="absolute inset-1 rounded opacity-50"
                        style={{
                          backgroundColor: `hsl(${Math.min(120, summary.completionRate * 1.2)} 50% 50%)`,
                        }}
                      />
                    )}
                    <span className="relative z-10 font-medium">
                      {format(day, 'd')}
                    </span>
                    {summary.totalGoals > 0 && (
                      <span className="relative z-10 text-[10px]">
                        {summary.completionRate}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border"></div>
                <span>No goals</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-300"></div>
                <span>0-50%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-yellow-300"></div>
                <span>50-80%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-300"></div>
                <span>80-100%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthStats;