import React from 'react';
import { StreakData } from '../../types';
import { soundManager } from '../../utils/audio';
import { formatDate } from '../../utils/storage';
import confetti from 'canvas-confetti';
import {
  Flame,
  Trophy,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Lock,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface StreakPageProps {
  streakData: StreakData;
  onLogDailyFocus: () => void;
}

export const StreakPage: React.FC<StreakPageProps> = ({
  streakData,
  onLogDailyFocus,
}) => {
  const triggerCelebration = () => {
    soundManager.playChime();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00f0ff', '#a855f7', '#ff007f', '#22c55e', '#f59e0b'],
    });
    onLogDailyFocus();
  };

  // Generate 7-day weekly tracker
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const currentDayIndex = (today.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(today);
  monday.setDate(today.getDate() - currentDayIndex);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Flame className="w-5 h-5 fill-amber-400" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-cyber text-slate-100 tracking-wide">
              Cyber Streak & Focus Tracker
            </h1>
          </div>
          <p className="text-sm text-slate-400 font-mono-cyber mt-1.5">
            Maintain daily focus consistency by opening and completing your scheduled 3D study blocks.
          </p>
        </div>

        <button
          onClick={triggerCelebration}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-neon-rose text-dark-900 font-bold font-cyber text-xs hover:brightness-110 shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-all self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Log Daily Session (+1 Day)</span>
        </button>
      </div>

      {/* Hero Streak Flame Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 glass-panel p-8 lg:p-12 shadow-2xl">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Flame Icon & Counter */}
          <div className="md:col-span-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <motion.div
              animate={{
                scale: streakData.currentStreak > 0 ? [1, 1.08, 1] : 1,
                filter: streakData.currentStreak > 0 ? [
                  'drop-shadow(0 0 20px rgba(245, 158, 11, 0.6))',
                  'drop-shadow(0 0 35px rgba(255, 0, 127, 0.8))',
                  'drop-shadow(0 0 20px rgba(245, 158, 11, 0.6))',
                ] : 'none',
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl ${
                streakData.currentStreak > 0 ? 'bg-amber-500/15 border-amber-500/50' : 'bg-black/40 border-white/10'
              } border flex items-center justify-center flex-shrink-0 backdrop-blur-md`}
            >
              <Flame className={`w-14 h-14 sm:w-16 sm:h-16 ${streakData.currentStreak > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
            </motion.div>

            <div className="space-y-1">
              <span className="text-xs uppercase font-mono-cyber tracking-widest text-amber-400 font-semibold">
                Current Focus Streak
              </span>
              <div className="flex items-baseline justify-center sm:justify-start space-x-2">
                <span className="text-5xl sm:text-6xl font-extrabold font-cyber text-slate-100">
                  {streakData.currentStreak}
                </span>
                <span className="text-xl font-bold font-cyber text-amber-400">
                  {streakData.currentStreak === 1 ? 'Day' : 'Days'}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono-cyber">
                Last active:{' '}
                <span className="text-slate-100 font-semibold">{streakData.lastActiveDate || 'None (Ready for session 1)'}</span>
              </p>
            </div>
          </div>

          {/* Quick Stat Pill Highlights */}
          <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-white/15">
              <div className="flex items-center space-x-2 text-neon-purple mb-1">
                <Trophy className="w-4 h-4" />
                <span className="text-xs font-mono-cyber uppercase">Longest</span>
              </div>
              <p className="text-2xl font-bold font-cyber text-slate-100">
                {streakData.longestStreak} <span className="text-xs text-slate-300">Days</span>
              </p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-white/15">
              <div className="flex items-center space-x-2 text-neon-cyan mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-mono-cyber uppercase">Total Focus</span>
              </div>
              <p className="text-2xl font-bold font-cyber text-slate-100">
                {Math.round(streakData.totalMinutesLogged / 60)}{' '}
                <span className="text-xs text-slate-300">Hours</span>
              </p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-white/15">
              <div className="flex items-center space-x-2 text-emerald-400 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-mono-cyber uppercase">Completed</span>
              </div>
              <p className="text-2xl font-bold font-cyber text-slate-100">
                {streakData.totalTasksCompleted}{' '}
                <span className="text-xs text-slate-300">Blocks</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly 7-Day Consistency Meter */}
      <div className="glass-panel-neon p-6 rounded-3xl border border-white/15">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold font-cyber text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-neon-cyan" />
            Weekly Consistency Tracker
          </h3>
          <span className="text-xs font-mono-cyber text-slate-300">This Week</span>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4">
          {daysOfWeek.map((day, idx) => {
            const isToday = idx === currentDayIndex;
            const dayDate = new Date(monday);
            dayDate.setDate(monday.getDate() + idx);
            const dateStr = formatDate(dayDate);
            const isCompleted = Boolean(streakData.activeDates && streakData.activeDates.includes(dateStr));

            return (
              <div
                key={day}
                className={`p-3 sm:p-4 rounded-2xl text-center border transition-all ${
                  isToday
                    ? 'border-neon-cyan/70 bg-neon-cyan/15 shadow-neon-cyan/20 backdrop-blur-md'
                    : isCompleted
                    ? 'border-amber-500/40 bg-amber-500/10 backdrop-blur-md'
                    : 'border-white/10 bg-black/25 opacity-50 backdrop-blur-sm'
                }`}
              >
                <span className="block text-[11px] font-mono-cyber text-slate-300 mb-1">{day}</span>
                <div className="w-8 h-8 mx-auto rounded-full flex items-center justify-center">
                  {isCompleted ? (
                    <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  )}
                </div>
                {isToday && (
                  <span className="inline-block mt-1 text-[9px] font-mono-cyber text-neon-cyan uppercase font-bold">
                    Today
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cyber Focus Milestones & Badges */}
      {streakData.badges && streakData.badges.length > 0 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/15 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-cyber text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Cyber Focus Milestones & Badges
            </h3>
            <span className="text-xs font-mono-cyber text-slate-400">
              {streakData.badges.filter((b) => b.unlockedAt).length} / {streakData.badges.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {streakData.badges.map((badge) => {
              const isUnlocked = Boolean(badge.unlockedAt);
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isUnlocked
                      ? 'border-amber-500/40 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                      : 'border-white/10 bg-black/30 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{badge.icon}</span>
                    {isUnlocked ? (
                      <span className="text-[10px] uppercase font-mono-cyber px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                        Unlocked
                      </span>
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 font-cyber truncate mb-1">
                    {badge.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono-cyber leading-tight">
                    {badge.description}
                  </p>
                  <div className="mt-2 text-[10px] text-slate-500 font-mono-cyber">
                    Target: {badge.requiredDays} {badge.requiredDays === 1 ? 'Day' : 'Days'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

