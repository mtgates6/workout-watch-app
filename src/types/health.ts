export type HealthGoalType = 'supplement' | 'hydration' | 'sleep' | 'activity' | 'custom';
export type HealthGoalFrequency = 'daily' | 'weekly';

export interface HealthGoal {
  id: string;
  name: string;
  type: HealthGoalType;
  frequency: HealthGoalFrequency;
  target?: number; // for quantifiable goals
  unit?: string; // 'glasses', 'hours', 'minutes', 'steps'
  emoji?: string;
  description?: string;
  active: boolean;
  createdAt: string;
}

export interface HealthEntry {
  id: string;
  goalId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  value?: number; // actual amount completed
  notes?: string;
  completedAt?: string; // ISO timestamp when marked complete
}

export interface DailyHealthSummary {
  date: string;
  totalGoals: number;
  completedGoals: number;
  completionRate: number;
  entries: HealthEntry[];
}

export interface WeeklyHealthSummary {
  weekStart: string;
  weekEnd: string;
  totalDailyGoals: number;
  completedDailyGoals: number;
  weeklyGoals: HealthGoal[];
  weeklyEntries: HealthEntry[];
  averageCompletionRate: number;
}

export interface HealthStats {
  totalGoals: number;
  activeGoals: number;
  currentStreak: number;
  longestStreak: number;
  thisWeekCompletion: number;
  lastWeekCompletion: number;
}