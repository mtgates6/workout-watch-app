import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, Target, Calendar } from "lucide-react";
import { useHealth } from "@/context/HealthContext";
import DailyTracker from "@/components/health/DailyTracker";
import WeeklyGoals from "@/components/health/WeeklyGoals";
import HealthStats from "@/components/health/HealthStats";
import AddHealthGoalDialog from "@/components/health/AddHealthGoalDialog";

const HealthPage = () => {
  const { healthStats } = useHealth();
  const [addGoalDialogOpen, setAddGoalDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Health Tracking</h1>
          <p className="text-muted-foreground">
            Track your daily habits and weekly wellness goals
          </p>
        </div>
        <Button onClick={() => setAddGoalDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Goal
        </Button>
      </div>

      {/* Health Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthStats.activeGoals}</div>
            <p className="text-xs text-muted-foreground">
              of {healthStats.totalGoals} total goals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthStats.currentStreak}</div>
            <p className="text-xs text-muted-foreground">
              days in a row
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthStats.thisWeekCompletion}%</div>
            <p className="text-xs text-muted-foreground">
              completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthStats.longestStreak}</div>
            <p className="text-xs text-muted-foreground">
              days personal best
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="daily" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">Daily Tracking</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Goals</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6">
          <DailyTracker />
        </TabsContent>

        <TabsContent value="weekly" className="space-y-6">
          <WeeklyGoals />
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <HealthStats />
        </TabsContent>
      </Tabs>

      <AddHealthGoalDialog 
        open={addGoalDialogOpen}
        onOpenChange={setAddGoalDialogOpen}
      />
    </div>
  );
};

export default HealthPage;