export interface TaskBlock {
  id: string;
  title: string;
  category: 'study' | 'coding' | 'reading' | 'workout' | 'deepwork' | 'break' | 'custom';
  startTime: string; // "HH:MM" 24-hour format
  endTime: string;   // "HH:MM" 24-hour format
  color: string;     // Hex color code, e.g., "#00f0ff"
  completed?: boolean;
  notes?: string;
  date?: string;     // "YYYY-MM-DD"
  alertTriggered?: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // "YYYY-MM-DD"
  totalTasksCompleted: number;
  totalMinutesLogged: number;
  activeDates: string[]; // List of YYYY-MM-DD
  badges: Badge[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredDays: number;
  unlockedAt?: string;
}

export interface TaskTimeSlice {
  title: string;
  color: string;
  durationMinutes: number;
  category: string;
}

export interface DayActivity {
  date: string; // "YYYY-MM-DD"
  tasks: TaskTimeSlice[];
  totalMinutes: number;
}

export interface SoundSettings {
  enabled: boolean;
  volume: number; // 0 to 1
  alertType: 'siren' | 'alarm' | 'chime';
}

export type ActivePage = 'clock' | 'study' | 'streak' | 'calendar';
