import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { 
  HealthGoal, 
  HealthEntry, 
  DailyHealthSummary, 
  HealthStats, 
  HealthGoalType,
  HealthGoalFrequency 
} from "@/types/health";

interface HealthContextType {
  goals: HealthGoal[];
  entries: HealthEntry[];
  healthStats: HealthStats;
  createHealthGoal: (
    name: string, 
    type: HealthGoalType, 
    frequency: HealthGoalFrequency, 
    target?: number, 
    unit?: string,
    emoji?: string,
    description?: string
  ) => void;
  updateHealthGoal: (goalId: string, updates: Partial<HealthGoal>) => void;
  deleteHealthGoal: (goalId: string) => void;
  toggleGoalActive: (goalId: string) => void;
  markGoalComplete: (goalId: string, date: string, value?: number, notes?: string) => void;
  markGoalIncomplete: (goalId: string, date: string) => void;
  updateHealthEntry: (entryId: string, updates: Partial<HealthEntry>) => void;
  getDailyHealthSummary: (date: string) => DailyHealthSummary;
  getActiveGoalsByFrequency: (frequency: HealthGoalFrequency) => HealthGoal[];
  getEntriesForDate: (date: string) => HealthEntry[];
  getEntryForGoalAndDate: (goalId: string, date: string) => HealthEntry | undefined;
}

const initialStats: HealthStats = {
  totalGoals: 0,
  activeGoals: 0,
  currentStreak: 0,
  longestStreak: 0,
  thisWeekCompletion: 0,
  lastWeekCompletion: 0,
};

const STORAGE_KEY = "fitness_health_data";

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<HealthGoal[]>(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return parsedData.goals || [];
    }
    return [];
  });

  const [entries, setEntries] = useState<HealthEntry[]>(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return parsedData.entries || [];
    }
    return [];
  });

  const [healthStats, setHealthStats] = useState<HealthStats>(initialStats);

  // Save data to localStorage whenever goals or entries change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
      goals, 
      entries 
    }));
  }, [goals, entries]);

  // Calculate health stats whenever goals or entries change
  useEffect(() => {
    const activeGoals = goals.filter(goal => goal.active);
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate current streak (consecutive days with all daily goals completed)
    let currentStreak = 0;
    let longestStreak = 0;
    let currentStreakTemp = 0;
    
    // Get the last 30 days to calculate streaks
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dailySummary = getDailyHealthSummary(dateStr);
      const allDailyGoalsCompleted = dailySummary.totalGoals > 0 && dailySummary.completionRate === 100;
      
      if (allDailyGoalsCompleted) {
        if (i === 0) currentStreak++;
        currentStreakTemp++;
        longestStreak = Math.max(longestStreak, currentStreakTemp);
      } else {
        if (i === 0) currentStreak = 0;
        currentStreakTemp = 0;
      }
    }

    // Calculate this week and last week completion rates
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    
    const thisWeekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(thisWeekStart);
      date.setDate(date.getDate() + i);
      return date.toISOString().split('T')[0];
    });
    
    const lastWeekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(lastWeekStart);
      date.setDate(date.getDate() + i);
      return date.toISOString().split('T')[0];
    });

    const thisWeekCompletion = thisWeekDays.reduce((acc, date) => {
      const summary = getDailyHealthSummary(date);
      return acc + summary.completionRate;
    }, 0) / 7;

    const lastWeekCompletion = lastWeekDays.reduce((acc, date) => {
      const summary = getDailyHealthSummary(date);
      return acc + summary.completionRate;
    }, 0) / 7;

    setHealthStats({
      totalGoals: goals.length,
      activeGoals: activeGoals.length,
      currentStreak,
      longestStreak,
      thisWeekCompletion: Math.round(thisWeekCompletion),
      lastWeekCompletion: Math.round(lastWeekCompletion),
    });
  }, [goals, entries]);

  const createHealthGoal = (
    name: string, 
    type: HealthGoalType, 
    frequency: HealthGoalFrequency, 
    target?: number, 
    unit?: string,
    emoji?: string,
    description?: string
  ) => {
    const newGoal: HealthGoal = {
      id: uuidv4(),
      name,
      type,
      frequency,
      target,
      unit,
      emoji,
      description,
      active: true,
      createdAt: new Date().toISOString(),
    };

    setGoals(prev => [...prev, newGoal]);
  };

  const updateHealthGoal = (goalId: string, updates: Partial<HealthGoal>) => {
    setGoals(prev => 
      prev.map(goal => 
        goal.id === goalId ? { ...goal, ...updates } : goal
      )
    );
  };

  const deleteHealthGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
    setEntries(prev => prev.filter(entry => entry.goalId !== goalId));
  };

  const toggleGoalActive = (goalId: string) => {
    setGoals(prev => 
      prev.map(goal => 
        goal.id === goalId ? { ...goal, active: !goal.active } : goal
      )
    );
  };

  const markGoalComplete = (goalId: string, date: string, value?: number, notes?: string) => {
    const existingEntry = entries.find(entry => entry.goalId === goalId && entry.date === date);
    
    if (existingEntry) {
      setEntries(prev => 
        prev.map(entry => 
          entry.id === existingEntry.id 
            ? { ...entry, completed: true, value, notes, completedAt: new Date().toISOString() }
            : entry
        )
      );
    } else {
      const newEntry: HealthEntry = {
        id: uuidv4(),
        goalId,
        date,
        completed: true,
        value,
        notes,
        completedAt: new Date().toISOString(),
      };
      setEntries(prev => [...prev, newEntry]);
    }
  };

  const markGoalIncomplete = (goalId: string, date: string) => {
    setEntries(prev => 
      prev.map(entry => 
        entry.goalId === goalId && entry.date === date
          ? { ...entry, completed: false, completedAt: undefined }
          : entry
      )
    );
  };

  const updateHealthEntry = (entryId: string, updates: Partial<HealthEntry>) => {
    setEntries(prev => 
      prev.map(entry => 
        entry.id === entryId ? { ...entry, ...updates } : entry
      )
    );
  };

  const getDailyHealthSummary = (date: string): DailyHealthSummary => {
    const dailyGoals = goals.filter(goal => goal.active && goal.frequency === 'daily');
    const dateEntries = entries.filter(entry => entry.date === date);
    const completedEntries = dateEntries.filter(entry => entry.completed);
    
    return {
      date,
      totalGoals: dailyGoals.length,
      completedGoals: completedEntries.length,
      completionRate: dailyGoals.length > 0 ? Math.round((completedEntries.length / dailyGoals.length) * 100) : 0,
      entries: dateEntries,
    };
  };

  const getActiveGoalsByFrequency = (frequency: HealthGoalFrequency): HealthGoal[] => {
    return goals.filter(goal => goal.active && goal.frequency === frequency);
  };

  const getEntriesForDate = (date: string): HealthEntry[] => {
    return entries.filter(entry => entry.date === date);
  };

  const getEntryForGoalAndDate = (goalId: string, date: string): HealthEntry | undefined => {
    return entries.find(entry => entry.goalId === goalId && entry.date === date);
  };

  return (
    <HealthContext.Provider
      value={{
        goals,
        entries,
        healthStats,
        createHealthGoal,
        updateHealthGoal,
        deleteHealthGoal,
        toggleGoalActive,
        markGoalComplete,
        markGoalIncomplete,
        updateHealthEntry,
        getDailyHealthSummary,
        getActiveGoalsByFrequency,
        getEntriesForDate,
        getEntryForGoalAndDate,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = (): HealthContextType => {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error("useHealth must be used within a HealthProvider");
  }
  return context;
};