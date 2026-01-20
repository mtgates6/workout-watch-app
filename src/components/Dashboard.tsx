import React from "react";
import { useWorkout } from "@/context/WorkoutContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CalendarDays, Dumbbell, TrendingUp, CalendarPlus } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import WeeklyRecapCard from "@/components/dashboard/WeeklyRecapCard";

const Dashboard = () => {
  const { workoutSummary, startWorkout } = useWorkout();
  const navigate = useNavigate();

  const handleStartWorkout = () => {
    startWorkout("New Workout");
    navigate("/workout");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button onClick={handleStartWorkout} className="bg-fitness-primary hover:bg-fitness-secondary">
          Start Workout
        </Button>
      </div>



      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Workout Summary</CardTitle>
            <CardDescription>Your fitness progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Total Workouts</span>
                <span className="text-2xl font-bold text-fitness-primary">{workoutSummary.totalWorkouts}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">This Week</span>
                <span className="text-2xl font-bold text-fitness-primary">{workoutSummary.thisWeekWorkouts}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Total Time</span>
                <span className="text-2xl font-bold text-fitness-primary">{formatDuration(workoutSummary.totalDuration)}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Favorite Exercise</span>
                <span className="text-lg font-bold text-fitness-primary truncate">
                  {workoutSummary.favoriteExercise || "None"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
            <CardDescription>Get started quickly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={handleStartWorkout}
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <Dumbbell className="mr-2 h-4 w-4" />
              Start a new workout
            </Button>
            <Button
              onClick={() => navigate("/planner")}
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarPlus className="mr-2 h-4 w-4" />
              Plan weekly workouts
            </Button>
            <Button
              onClick={() => navigate("/exercises")}
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Browse exercises
            </Button>
            <Button
              onClick={() => navigate("/history")}
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              View workout history
            </Button>
          </CardContent>
        </Card>
      </div>

      

      {workoutSummary.totalWorkouts > 0 ? (
        <div>
          {/* Weekly Recap Card - Full Width */}
          <WeeklyRecapCard />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Complete your first workout to see your progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
              <Dumbbell size={48} className="text-fitness-primary" />
              <p>Start your fitness journey today by logging your first workout!</p>
              <Button onClick={handleStartWorkout} className="bg-fitness-primary hover:bg-fitness-secondary">
                Start First Workout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
