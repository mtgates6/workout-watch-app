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
import { supabase } from "@/integrations/supabase/client";
import { getUserUuid } from "@/context/UserContext";

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

function mapGoal(row: any): HealthGoal {
  return {
    id: row.id,
    name: row.name,
    type: row.type as HealthGoalType,
    frequency: row.frequency as HealthGoalFrequency,
    target: row.target ?? undefined,
    unit: row.unit ?? undefined,
    emoji: row.emoji ?? undefined,
    description: row.description ?? undefined,
    active: row.active,
    createdAt: row.created_at,
  };
}

function mapEntry(row: any): HealthEntry {
  return {
    id: row.id,
    goalId: row.goal_id,
    date: row.date,
    completed: row.completed,
    value: row.value ?? undefined,
    notes: row.notes ?? undefined,
    completedAt: row.completed_at ?? undefined,
  };
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const userId = getUserUuid();

  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [entries, setEntries] = useState<HealthEntry[]>([]);
  const [healthStats, setHealthStats] = useState<HealthStats>(initialStats);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const [goalsRes, entriesRes] = await Promise.all([
        supabase.from("health_goals").select("*").eq("user_id", userId),
        supabase.from("health_entries").select("*").eq("user_id", userId),
      ]);
      if (goalsRes.data) setGoals(goalsRes.data.map(mapGoal));
      if (entriesRes.data) setEntries(entriesRes.data.map(mapEntry));
    };
    load();
  }, []);

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

  useEffect(() => {
    const activeGoals = goals.filter(goal => goal.active);

    let currentStreak = 0;
    let longestStreak = 0;
    let currentStreakTemp = 0;

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
      return acc + getDailyHealthSummary(date).completionRate;
    }, 0) / 7;

    const lastWeekCompletion = lastWeekDays.reduce((acc, date) => {
      return acc + getDailyHealthSummary(date).completionRate;
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

  const createHealthGoal = async (
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

    if (userId) {
      const { error } = await supabase.from("health_goals").insert({
        id: newGoal.id,
        name,
        type,
        frequency,
        target: target ?? null,
        unit: unit ?? null,
        emoji: emoji ?? null,
        description: description ?? null,
        active: true,
        user_id: userId,
      });
      if (error) console.error("Error saving health goal:", error);
    }
  };

  const updateHealthGoal = async (goalId: string, updates: Partial<HealthGoal>) => {
    setGoals(prev => prev.map(goal => goal.id === goalId ? { ...goal, ...updates } : goal));

    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
    if (updates.target !== undefined) dbUpdates.target = updates.target ?? null;
    if (updates.unit !== undefined) dbUpdates.unit = updates.unit ?? null;
    if (updates.emoji !== undefined) dbUpdates.emoji = updates.emoji ?? null;
    if (updates.description !== undefined) dbUpdates.description = updates.description ?? null;
    if (updates.active !== undefined) dbUpdates.active = updates.active;

    if (Object.keys(dbUpdates).length > 0) {
      const { error } = await supabase.from("health_goals").update(dbUpdates).eq("id", goalId);
      if (error) console.error("Error updating health goal:", error);
    }
  };

  const deleteHealthGoal = async (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
    setEntries(prev => prev.filter(entry => entry.goalId !== goalId));

    await supabase.from("health_entries").delete().eq("goal_id", goalId);
    await supabase.from("health_goals").delete().eq("id", goalId);
  };

  const toggleGoalActive = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    const newActive = !goal.active;
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, active: newActive } : g));
    await supabase.from("health_goals").update({ active: newActive }).eq("id", goalId);
  };

  const markGoalComplete = async (goalId: string, date: string, value?: number, notes?: string) => {
    const existingEntry = entries.find(entry => entry.goalId === goalId && entry.date === date);
    const now = new Date().toISOString();

    if (existingEntry) {
      setEntries(prev =>
        prev.map(entry =>
          entry.id === existingEntry.id
            ? { ...entry, completed: true, value, notes, completedAt: now }
            : entry
        )
      );
      await supabase.from("health_entries").update({
        completed: true,
        value: value ?? null,
        notes: notes ?? null,
        completed_at: now,
      }).eq("id", existingEntry.id);
    } else {
      const newEntry: HealthEntry = {
        id: uuidv4(),
        goalId,
        date,
        completed: true,
        value,
        notes,
        completedAt: now,
      };
      setEntries(prev => [...prev, newEntry]);

      if (userId) {
        await supabase.from("health_entries").insert({
          id: newEntry.id,
          goal_id: goalId,
          date,
          completed: true,
          value: value ?? null,
          notes: notes ?? null,
          completed_at: now,
          user_id: userId,
        });
      }
    }
  };

  const markGoalIncomplete = async (goalId: string, date: string) => {
    const entry = entries.find(e => e.goalId === goalId && e.date === date);
    setEntries(prev =>
      prev.map(e =>
        e.goalId === goalId && e.date === date
          ? { ...e, completed: false, completedAt: undefined }
          : e
      )
    );
    if (entry) {
      await supabase.from("health_entries").update({ completed: false, completed_at: null }).eq("id", entry.id);
    }
  };

  const updateHealthEntry = async (entryId: string, updates: Partial<HealthEntry>) => {
    setEntries(prev => prev.map(entry => entry.id === entryId ? { ...entry, ...updates } : entry));

    const dbUpdates: Record<string, any> = {};
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
    if (updates.value !== undefined) dbUpdates.value = updates.value ?? null;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes ?? null;
    if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt ?? null;

    if (Object.keys(dbUpdates).length > 0) {
      await supabase.from("health_entries").update(dbUpdates).eq("id", entryId);
    }
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
