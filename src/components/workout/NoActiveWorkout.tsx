
import React from 'react';
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const NoActiveWorkout: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold tracking-tight">No active workout</h2>
      <p className="text-muted-foreground">Start a workout from the home page to begin.</p>
      <Button onClick={() => navigate("/")} className="mt-4">
        Go to Home
      </Button>
    </div>
  );
};
