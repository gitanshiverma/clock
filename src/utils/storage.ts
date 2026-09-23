import { TaskBlock, StreakData, DayActivity, SoundSettings, Badge } from '../types';

const STORAGE_KEYS = {
  TASKS: 'timeblocks_tasks_v2',
  STREAK: 'timeblocks_streak',
  CALENDAR: 'timeblocks_calendar',
  SOUND: 'timeblocks_sound_settings',
};

const DEFAULT_BADGES: Badge[] = [
  {
    id: 'ignite',
    title: 'Spark of Focus',
    description: 'Log your first study block',
    icon: '⚡',
    requiredDays: 1,
  },
  {
    id: 'dynamo_3',
    title: '3-Day Dynamo',
    description: 'Maintain a 3-day consecutive focus streak',
    icon: '🔥',
    requiredDays: 3,
  },
  {
    id: 'cyber_7',
    title: 'Cyber Architect',
    description: 'Reach a 7-day focus milestone',
    icon: '🛡️',
    requiredDays: 7,
  },
  {
    id: 'habit_14',
    title: 'Neural Master',
    description: 'Hit a 14-day study streak',
    icon: '💎',
    requiredDays: 14,
  },
  {
    id: 'legend_30',
    title: 'Time Titan',
    description: 'Complete a legendary 30-day streak',
    icon: '👑',
    requiredDays: 30,
  },
];

// Helper to format Date to YYYY-MM-DD
export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to format "HH:MM" (24h) to "hh:mm AM/PM" (12h)
export function formatTime12h(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr ? mStr.padStart(2, '0') : '00';
  if (isNaN(h)) return time24;
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${m} ${period}`;
}

// Generates dynamic 2D plane zones around the 12h dial with bright, vibrant colors
export function generateInitialTasks(): TaskBlock[] {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const pad = (n: number) => String(n).padStart(2, '0');

  // Active zone right now
  const activeStartHour = currentHour;
  const activeStartMin = Math.max(0, currentMinute - 20);
  const activeEndHour = (currentHour + 1) % 24;
  const activeEndMin = (currentMinute + 40) % 60;

  return [
    {
      id: 'zone-active-now',
      title: 'Deep Work: React & 3D WebGL',
      category: 'coding',
      startTime: `${pad(activeStartHour)}:${pad(activeStartMin)}`,
      endTime: `${pad(activeEndHour)}:${pad(activeEndMin)}`,
      color: '#00f0ff', // Bright Electric Cyan
      completed: false,
      notes: 'Active session currently illuminated on clock face',
    },
    {
      id: 'zone-upcoming-1',
      title: 'Algorithm & AI Architecture',
      category: 'study',
      startTime: `${pad((currentHour + 2) % 24)}:00`,
      endTime: `${pad((currentHour + 3) % 24)}:45`,
      color: '#ff007f', // Vivid Hot Pink
      completed: false,
      notes: 'Graph algorithms & neural networks review',
    },
    {
      id: 'zone-upcoming-2',
      title: 'System Design & Refactor',
      category: 'deepwork',
      startTime: `${pad((currentHour + 4) % 24)}:15`,
      endTime: `${pad((currentHour + 6) % 24)}:00`,
      color: '#a855f7', // Bright Electric Violet
      completed: false,
      notes: 'Full-stack distributed architecture',
    },
    {
      id: 'zone-upcoming-3',
      title: 'Fitness & Cardio Reset',
      category: 'workout',
      startTime: `${pad((currentHour + 6) % 24)}:30`,
      endTime: `${pad((currentHour + 7) % 24)}:30`,
      color: '#f59e0b', // Bright Solar Amber
      completed: false,
      notes: 'Physical training and stretching',
    },
  ];
}

// Generate realistic calendar history for the past 30 days
export function generateInitialCalendarActivity(): Record<string, DayActivity> {
  const result: Record<string, DayActivity> = {};
  const today = new Date();

  const colors = ['#00f0ff', '#ff007f', '#22c55e', '#a855f7', '#f59e0b', '#3b82f6'];
  const titles = [
    'Three.js Shaders',
    'Data Structures',
    'Full-stack Dev',
    'Math & Algorithms',
    'Workout Reset',
    'Language Study',
    'System Design',
    'Open Source Contribution',
  ];

  for (let i = 28; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = formatDate(d);

    const hasActivity = i === 12 ? false : Math.random() > 0.15;

    if (hasActivity) {
      const taskCount = Math.floor(Math.random() * 3) + 2;
      const dayTasks: DayActivity['tasks'] = [];
      let totalMins = 0;

      for (let t = 0; t < taskCount; t++) {
        const dur = [30, 45, 60, 90, 120][Math.floor(Math.random() * 5)];
        totalMins += dur;
        dayTasks.push({
          title: titles[(i + t) % titles.length],
          color: colors[(i + t) % colors.length],
          durationMinutes: dur,
          category: 'study',
        });
      }

      result[dateStr] = {
        date: dateStr,
        tasks: dayTasks,
        totalMinutes: totalMins,
      };
    }
  }

  return result;
}

const SCHEMA_VERSION_KEY = 'timeblocks_zero_schema_v3';

function ensureZeroSchema() {
  try {
    if (typeof window !== 'undefined' && localStorage.getItem(SCHEMA_VERSION_KEY) !== 'v3') {
      localStorage.clear();
      localStorage.setItem(SCHEMA_VERSION_KEY, 'v3');
    }
  } catch (e) {
    // Ignore
  }
}

ensureZeroSchema();

export function getStoredTasks(): TaskBlock[] {
  ensureZeroSchema();
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!stored) {
      const initial: TaskBlock[] = [];
      saveStoredTasks(initial);
      return initial;
    }
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveStoredTasks(tasks: TaskBlock[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks to localStorage', e);
  }
}

export function getStoredStreak(): StreakData {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.STREAK);
    if (!stored) {
      const initial: StreakData = {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: '',
        totalTasksCompleted: 0,
        totalMinutesLogged: 0,
        activeDates: [],
        badges: DEFAULT_BADGES.map(b => ({ ...b, unlockedAt: undefined })),
      };
      saveStoredStreak(initial);
      return initial;
    }
    return JSON.parse(stored);
  } catch {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
      totalTasksCompleted: 0,
      totalMinutesLogged: 0,
      activeDates: [],
      badges: DEFAULT_BADGES.map(b => ({ ...b, unlockedAt: undefined })),
    };
  }
}

export function saveStoredStreak(streak: StreakData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
  } catch (e) {
    console.error('Failed to save streak', e);
  }
}

export function getStoredCalendar(): Record<string, DayActivity> {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CALENDAR);
    if (!stored) {
      const initial: Record<string, DayActivity> = {};
      saveStoredCalendar(initial);
      return initial;
    }
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

export function saveStoredCalendar(calendar: Record<string, DayActivity>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(calendar));
  } catch (e) {
    console.error('Failed to save calendar', e);
  }
}

export function getStoredSoundSettings(): SoundSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SOUND);
    if (!stored) {
      const initial: SoundSettings = { enabled: true, volume: 0.7, alertType: 'siren' };
      saveStoredSoundSettings(initial);
      return initial;
    }
    return JSON.parse(stored);
  } catch {
    return { enabled: true, volume: 0.7, alertType: 'siren' };
  }
}

export function saveStoredSoundSettings(settings: SoundSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SOUND, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save sound settings', e);
  }
}

// Records completion of a task into streak and daily activity
export function recordTaskCompletion(task: TaskBlock) {
  const today = formatDate(new Date());

  const calendar = getStoredCalendar();
  const [startH, startM] = task.startTime.split(':').map(Number);
  const [endH, endM] = task.endTime.split(':').map(Number);
  let duration = (endH * 60 + endM) - (startH * 60 + startM);
  if (duration <= 0) duration = 45;

  const dayAct: DayActivity = calendar[today] || {
    date: today,
    tasks: [],
    totalMinutes: 0,
  };

  const exists = dayAct.tasks.some(t => t.title === task.title);
  if (!exists) {
    dayAct.tasks.push({
      title: task.title,
      color: task.color,
      durationMinutes: duration,
      category: task.category,
    });
    dayAct.totalMinutes += duration;
    calendar[today] = dayAct;
    saveStoredCalendar(calendar);
  }

  const streak = getStoredStreak();
  streak.totalTasksCompleted += 1;
  streak.totalMinutesLogged += duration;

  if (!streak.activeDates.includes(today)) {
    streak.activeDates.push(today);
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  if (streak.currentStreak === 0) {
    streak.currentStreak = 1;
  } else if (streak.lastActiveDate === yesterdayStr) {
    streak.currentStreak += 1;
  } else if (streak.lastActiveDate !== today) {
    streak.currentStreak = 1;
  }
  streak.lastActiveDate = today;
  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
  }

  streak.badges = streak.badges.map(b => {
    if (!b.unlockedAt && streak.currentStreak >= b.requiredDays) {
      return { ...b, unlockedAt: today };
    }
    return b;
  });

  saveStoredStreak(streak);
}

// Full wipe and factory reset of all application storage to 0
export function resetAllStorage(): {
  tasks: TaskBlock[];
  streak: StreakData;
  calendar: Record<string, DayActivity>;
  sound: SoundSettings;
} {
  try {
    localStorage.clear();
    localStorage.setItem(SCHEMA_VERSION_KEY, 'v3');
  } catch (e) {
    console.error('Failed to clear storage keys', e);
  }

  const tasks: TaskBlock[] = [];
  saveStoredTasks(tasks);

  const streak: StreakData = {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    totalTasksCompleted: 0,
    totalMinutesLogged: 0,
    activeDates: [],
    badges: DEFAULT_BADGES.map(b => ({ ...b, unlockedAt: undefined })),
  };
  saveStoredStreak(streak);

  const calendar: Record<string, DayActivity> = {};
  saveStoredCalendar(calendar);

  const sound: SoundSettings = { enabled: true, volume: 0.7, alertType: 'siren' };
  saveStoredSoundSettings(sound);

  return { tasks, streak, calendar, sound };
}
