import React from 'react';
import { ActivePage, TaskBlock, StreakData } from '../../types';
import { soundManager } from '../../utils/audio';
import {
  Clock,
  BookOpen,
  Flame,
  Calendar as CalendarIcon,
  ArrowUpRight,
  Sparkles,
  Activity,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardProps {
  setActivePage: (page: ActivePage) => void;
  tasks: TaskBlock[];
  streakData: StreakData;
}

export const Dashboard: React.FC<DashboardProps> = ({
  setActivePage,
  tasks,
  streakData,
}) => {
  const cards = [
    {
      id: 'clock' as ActivePage,
      title: '3D Cyber Clock',
      subtitle: 'Continuous smooth hands & dynamic task arc overlay',
      icon: Clock,
      badge: 'Main Engine',
      glowColor: 'neon-cyan',
      borderHover: 'hover:border-neon-cyan',
      glowClass: 'shadow-neon-cyan/20 group-hover:shadow-neon-cyan/50',
      gradient: 'from-neon-cyan/20 via-cyan-500/10 to-transparent',
      iconColor: 'text-neon-cyan',
      stats: `${tasks.length} Scheduled Blocks`,
    },
    {
      id: 'study' as ActivePage,
      title: 'Study Block Timetable',
      subtitle: 'Create, edit & color-code your daily focus sessions',
      icon: BookOpen,
      badge: 'Schedule Creator',
      glowColor: 'neon-purple',
      borderHover: 'hover:border-neon-purple',
      glowClass: 'shadow-neon-purple/20 group-hover:shadow-neon-purple/50',
      gradient: 'from-neon-purple/20 via-purple-500/10 to-transparent',
      iconColor: 'text-neon-purple',
      stats: 'Visual 24H Timeline',
    },
    {
      id: 'streak' as ActivePage,
      title: 'Streak & Habits',
      subtitle: 'Track consecutive days, focus hours & cyber badges',
      icon: Flame,
      badge: 'Daily Consistency',
      glowColor: 'amber-400',
      borderHover: 'hover:border-amber-400',
      glowClass: 'shadow-amber-500/20 group-hover:shadow-amber-500/50',
      gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
      iconColor: 'text-amber-400',
      stats: `${streakData.currentStreak}-Day Active Flame`,
    },
    {
      id: 'calendar' as ActivePage,
      title: 'Activity Calendar',
      subtitle: 'Heatmap tiles with stacked time distribution bars',
      icon: CalendarIcon,
      badge: 'Heatmap Grid',
      glowColor: 'emerald-400',
      borderHover: 'hover:border-emerald-400',
      glowClass: 'shadow-emerald-500/20 group-hover:shadow-emerald-500/50',
      gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      iconColor: 'text-emerald-400',
      stats: `${Math.round(streakData.totalMinutesLogged / 60)}h Total Focus`,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/15 glass-panel p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 rounded-full bg-neon-cyan/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-72 h-72 rounded-full bg-neon-purple/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-mono-cyber font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TimeBlocks Cybernetic Workspace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-cyber text-slate-100 tracking-tight leading-tight">
            Visualize Time in{' '}
            <span className="bg-gradient-to-r from-neon-cyan via-purple-400 to-neon-rose bg-clip-text text-transparent">
              3D Dimensions
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-mono-cyber leading-relaxed">
            A high-performance focus system combining real-time continuous 3D clock dials,
            scheduled task arc projections, streak tracking, and multi-colored time distribution analytics.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                soundManager.playClick();
                setActivePage('clock');
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-neon-cyan via-teal-400 to-neon-purple text-dark-900 font-bold font-cyber text-sm hover:brightness-110 shadow-lg shadow-neon-cyan/30 transition-all flex items-center space-x-2"
            >
              <Clock className="w-4 h-4" />
              <span>Launch 3D Clock</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setActivePage('study');
              }}
              className="px-6 py-3 rounded-2xl bg-black/40 border border-white/15 text-slate-200 hover:text-neon-cyan hover:border-neon-cyan/50 font-semibold text-sm transition-all flex items-center space-x-2 backdrop-blur-md"
            >
              <BookOpen className="w-4 h-4" />
              <span>Plan Today's Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Large Animated Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -6 }}
              onClick={() => {
                soundManager.playClick();
                setActivePage(card.id);
              }}
              className={`group relative glass-panel p-8 rounded-3xl border border-white/15 cursor-pointer overflow-hidden transition-all duration-300 ${card.borderHover} ${card.glowClass}`}
            >
              {/* Background gradient on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
                <div className="flex items-start justify-between">
                  {/* Large Animated Icon */}
                  <motion.div
                    whileHover={{ rotate: 12, scale: 1.1 }}
                    className="w-16 h-16 rounded-2xl bg-black/40 border border-white/15 group-hover:border-white/30 flex items-center justify-center transition-colors shadow-lg backdrop-blur-md"
                  >
                    <Icon className={`w-8 h-8 ${card.iconColor}`} />
                  </motion.div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono-cyber font-bold px-2.5 py-1 rounded-full bg-black/40 border border-white/15 text-slate-300 group-hover:text-white backdrop-blur-sm">
                      {card.badge}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-black/40 border border-white/15 flex items-center justify-center text-slate-300 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform backdrop-blur-sm">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold font-cyber text-slate-100 group-hover:text-white mb-2">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-300 font-mono-cyber leading-relaxed">
                    {card.subtitle}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono-cyber">
                  <span className="text-slate-300 font-semibold">{card.stats}</span>
                  <span className="text-slate-400 group-hover:text-neon-cyan transition-colors flex items-center gap-1 font-bold">
                    Open Module →
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Focus Overview */}
        <div className="glass-panel p-6 rounded-2xl border border-white/15 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono-cyber text-slate-300">
            <span className="flex items-center gap-1.5 text-neon-cyan font-bold uppercase">
              <Activity className="w-4 h-4" /> Active Overview
            </span>
            <span>{tasks.length} Blocks</span>
          </div>
          <p className="text-lg font-bold font-cyber text-slate-100">
            {tasks.filter((t) => t.completed).length} of {tasks.length} Completed
          </p>
          <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/10">
            <div
              className="h-full bg-neon-cyan rounded-full transition-all duration-500"
              style={{
                width: `${tasks.length ? (tasks.filter((t) => t.completed).length / tasks.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Focus Consistency */}
        <div className="glass-panel p-6 rounded-2xl border border-white/15 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono-cyber text-slate-300">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold uppercase">
              <Flame className="w-4 h-4 fill-amber-400" /> Focus Streak
            </span>
            <span>Current</span>
          </div>
          <p className="text-lg font-bold font-cyber text-slate-100">
            {streakData.currentStreak} Days Consecutive
          </p>
          <p className="text-xs text-slate-300 font-mono-cyber">
            Record: <span className="text-slate-100 font-bold">{streakData.longestStreak} days</span>
          </p>
        </div>
      </div>
    </div>
  );
};
