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

export type BackgroundVideoOption =
  | 'study_01'
  | 'study_02'
  | 'study_03'
  | 'study_04'
  | 'coding'
  | 'dark'
  | 'music'
  | 'spring'
  | 'rain'
  | 'wheel';

export interface BackgroundSettings {
  video: BackgroundVideoOption;
  clockPageOnly: boolean;
  brightness: number; // 0.1 to 1.0 (overlay dark level: 0 = dark, 1 = bright)
  motion3D: boolean;
  motionIntensity: number; // 0.2 to 2.0
  particlesEnabled: boolean;
}

export interface Clock3DSettings {
  positionX: number; // -4 to 4
  positionY: number; // -4 to 4
  positionZ: number; // -5 to 5
  scale: number;     // 0.5 to 1.6
  rotationZ: number; // -180 to 180 degrees
  cameraPreset: 'cyber' | 'front' | 'top' | 'free';
  isLocked: boolean;
}

export type ActivePage = 'clock' | 'study' | 'streak' | 'calendar';

