
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import WorkoutPage from "./pages/WorkoutPage";
import ExercisesPage from "./pages/ExercisesPage";
import HistoryPage from "./pages/HistoryPage";
import PlannerPage from "./pages/PlannerPage";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import { WorkoutProvider } from "./context/WorkoutContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WorkoutProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/workout" element={<WorkoutPage />} />
              <Route path="/exercises" element={<ExercisesPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/planner" element={<PlannerPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </WorkoutProvider>
  </QueryClientProvider>
);

export default App;
