
import React from "react";
import WorkoutHistory from "@/components/WorkoutHistory";
import { TooltipProvider } from "@/components/ui/tooltip";

const HistoryPage = () => {
  return (
    <TooltipProvider>
      <WorkoutHistory />
    </TooltipProvider>
  );
};

export default HistoryPage;
