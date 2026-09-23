import React, { useState, useEffect, useRef } from 'react';
import { ActivePage, TaskBlock, StreakData, DayActivity, SoundSettings } from './types';
import {
  getStoredTasks,
  saveStoredTasks,
  getStoredStreak,
  saveStoredStreak,
  getStoredCalendar,
  saveStoredCalendar,
  getStoredSoundSettings,
  saveStoredSoundSettings,
  recordTaskCompletion,
  generateInitialTasks,
  generateInitialCalendarActivity,
  resetAllStorage,
  formatDate,
  formatTime12h,
} from './utils/storage';
import { soundManager } from './utils/audio';
import { Navbar } from './components/layout/Navbar';
import { ClockPage } from './components/clock/ClockPage';
import { Clock3DCanvas } from './components/clock/Clock3D';
import { StudyBlockPage } from './components/study/StudyBlockPage';
import { StreakPage } from './components/streak/StreakPage';
import { CalendarPage } from './components/calendar/CalendarPage';
import { ToastNotification } from './components/ui/ToastNotification';
import { motion, AnimatePresence } from 'framer-motion';

export const App: React.FC = () => {
  const [activePage, setActivePage] = useState<ActivePage>('clock');
  const [tasks, setTasks] = useState<TaskBlock[]>(() => getStoredTasks());
  const [streakData, setStreakData] = useState<StreakData>(() => getStoredStreak());
  const [calendarData, setCalendarData] = useState<Record<string, DayActivity>>(() =>
    getStoredCalendar()
  );
  const [soundSettings, setSoundSettings] = useState<SoundSettings>(() =>
    getStoredSoundSettings()
  );
  const [alertTask, setAlertTask] = useState<TaskBlock | null>(null);
  const [resetKey, setResetKey] = useState<number>(0);

  // Sync sound manager volume & mute
  useEffect(() => {
    soundManager.setMuted(!soundSettings.enabled);
    soundManager.setVolume(soundSettings.volume);
    saveStoredSoundSettings(soundSettings);
  }, [soundSettings]);

  // Persist tasks whenever changed
  useEffect(() => {
    saveStoredTasks(tasks);
  }, [tasks]);

  // Request notification permission for background tab alerts
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Real-time End-Time Detection Engine: Triggers siren & notification across tabs & wake from sleep
  const triggeredTaskIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const checkTaskAlerts = () => {
      const now = new Date();
      const curHour = now.getHours();
      const curMin = now.getMinutes();
      const curSec = now.getSeconds();
      const totalCurrentSec = curHour * 3600 + curMin * 60 + curSec;

      tasks.forEach((task) => {
        if (task.completed) return;

        const [startH, startM] = task.startTime.split(':').map(Number);
        const [endH, endM] = task.endTime.split(':').map(Number);
        const totalStartSec = startH * 3600 + startM * 60;
        let totalEndSec = endH * 3600 + endM * 60;
        if (totalEndSec <= totalStartSec) totalEndSec += 24 * 3600;

        let effectiveCurrentSec = totalCurrentSec;
        if (effectiveCurrentSec < totalStartSec && totalEndSec > 24 * 3600) {
          effectiveCurrentSec += 24 * 3600;
        }

        // Trigger alert if current time reached end time (checked immediately on wake/tab return)
        if (
          effectiveCurrentSec >= totalEndSec &&
          effectiveCurrentSec - totalEndSec <= 7200 &&
          !triggeredTaskIdsRef.current.has(task.id)
        ) {
          triggeredTaskIdsRef.current.add(task.id);
          triggerTaskAlert(task);
        }
      });
    };

    // Immediate check
    checkTaskAlerts();

    // Listen to tab switch and sleep wake events
    const handleWake = () => checkTaskAlerts();
    document.addEventListener('visibilitychange', handleWake);
    window.addEventListener('focus', handleWake);
    window.addEventListener('pageshow', handleWake);

    const interval = setInterval(checkTaskAlerts, 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleWake);
      window.removeEventListener('focus', handleWake);
      window.removeEventListener('pageshow', handleWake);
      clearInterval(interval);
    };
  }, [tasks]);

  const triggerTaskAlert = (task: TaskBlock) => {
    soundManager.playSirenAlert();
    setAlertTask(task);

    // Native desktop notification if tab is in background
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`⚡ TimeBlocks Alarm: ${task.title}`, {
          body: `Study session (${formatTime12h(task.startTime)} - ${formatTime12h(task.endTime)}) is complete! Take a break.`,
          icon: '/favicon.ico',
        });
      } catch (e) {
        // Notification fallback
      }
    }
  };

  // Task Handlers
  const handleAddTask = (newTaskData: Omit<TaskBlock, 'id'>) => {
    const newTask: TaskBlock = {
      ...newTaskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };
    const updated = [...tasks, newTask];
    setTasks(updated);
    saveStoredTasks(updated);
  };

  const handleUpdateTask = (id: string, updatedFields: Partial<TaskBlock>) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, ...updatedFields } : t));
    setTasks(updated);
    saveStoredTasks(updated);

    // If marked completed, record to streak and calendar
    if (updatedFields.completed) {
      const task = updated.find((t) => t.id === id);
      if (task) {
        recordTaskCompletion(task);
        setStreakData(getStoredStreak());
        setCalendarData(getStoredCalendar());
      }
    }
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    saveStoredTasks(updated);
  };

  const handleResetTasks = () => {
    const initial = generateInitialTasks();
    setTasks(initial);
    saveStoredTasks(initial);
  };

  const handleLogDailyFocus = () => {
    const today = formatDate(new Date());
    const streak = { ...streakData };
    streak.currentStreak += 1;
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }
    streak.totalMinutesLogged += 60;
    streak.totalTasksCompleted += 1;
    streak.lastActiveDate = today;
    if (!streak.activeDates.includes(today)) {
      streak.activeDates.push(today);
    }
    streak.badges = (streak.badges || []).map((b) => {
      if (!b.unlockedAt && streak.currentStreak >= b.requiredDays) {
        return { ...b, unlockedAt: today };
      }
      return b;
    });
    saveStoredStreak(streak);
    setStreakData(streak);
  };

  const handleSeedDemoCalendar = () => {
    const initialCal = generateInitialCalendarActivity();
    saveStoredCalendar(initialCal);
    setCalendarData(initialCal);
  };

  const handleDismissAlert = () => {
    setAlertTask(null);
  };

  const handleCompleteAlert = (task: TaskBlock) => {
    handleUpdateTask(task.id, { completed: true });
    setAlertTask(null);
  };

  const handleResetEverything = () => {
    const fresh = resetAllStorage();
    setTasks(fresh.tasks);
    setStreakData(fresh.streak);
    setCalendarData(fresh.calendar);
    setSoundSettings(fresh.sound);
    triggeredTaskIdsRef.current.clear();
    setAlertTask(null);
    setResetKey((k) => k + 1);
    soundManager.playChime();
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col selection:bg-neon-cyan/30 selection:text-neon-cyan relative overflow-hidden">
      {/* Persistent 3D Background with Rain Scene; Clock Dial only shown on 3D Clock page */}
      <div
        className={`fixed inset-0 z-0 select-none ${
          activePage === 'clock' ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        style={{ minHeight: '100vh', width: '100vw' }}
      >
        <Clock3DCanvas
          tasks={tasks}
          simulatedTime={null}
          cameraPreset="cyber"
          isLocked={activePage !== 'clock'}
          resetKey={resetKey}
          filterMode="next12h"
          showClock={activePage === 'clock'}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/25 pointer-events-none" />
      </div>

      {/* Subtle readability veil when viewing overlay pages */}
      {activePage !== 'clock' && (
        <div className="fixed inset-0 pointer-events-none bg-black/20 backdrop-blur-[1px] z-0 transition-opacity duration-300" />
      )}

      {/* Top Cyber Navigation Bar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        streakCount={streakData.currentStreak}
        soundSettings={soundSettings}
        setSoundSettings={setSoundSettings}
        onResetAll={handleResetEverything}
      />

      {/* Main Page Routing Container with Transitions */}
      <main className="flex-1 relative z-10 overflow-x-hidden">
        <AnimatePresence mode="wait">
          {activePage === 'clock' && (
            <motion.div
              key="clock"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              <ClockPage
                tasks={tasks}
                setActivePage={setActivePage}
                onAddTask={handleAddTask}
                triggerTaskAlert={triggerTaskAlert}
              />
            </motion.div>
          )}

          {activePage === 'study' && (
            <motion.div
              key="study"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <StudyBlockPage
                tasks={tasks}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onResetTasks={handleResetTasks}
              />
            </motion.div>
          )}

          {activePage === 'streak' && (
            <motion.div
              key="streak"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <StreakPage
                streakData={streakData}
                onLogDailyFocus={handleLogDailyFocus}
              />
            </motion.div>
          )}

          {activePage === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <CalendarPage
                calendarData={calendarData}
                onSeedDemoCalendar={handleSeedDemoCalendar}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Task Siren Alert Modal */}
      <ToastNotification
        alertTask={alertTask}
        onDismiss={handleDismissAlert}
        onComplete={handleCompleteAlert}
      />
    </div>
  );
};

