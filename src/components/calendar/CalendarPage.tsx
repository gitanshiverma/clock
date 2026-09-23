import React, { useState } from 'react';
import { DayActivity } from '../../types';
import { soundManager } from '../../utils/audio';
import { formatDate } from '../../utils/storage';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  Layers,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface CalendarPageProps {
  calendarData: Record<string, DayActivity>;
  onSeedDemoCalendar?: () => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  calendarData,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<{
    dateStr: string;
    activity?: DayActivity;
  } | null>(null);

  // Month navigation
  const prevMonth = () => {
    soundManager.playClick();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    soundManager.playClick();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  const currentMonthIdx = currentDate.getMonth();

  // Days in month calculation
  const firstDayOfWeek = new Date(currentYear, currentMonthIdx, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();

  // Adjusted for Monday start (0=Mon .. 6=Sun)
  const startOffset = (firstDayOfWeek + 6) % 7;

  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Today's formatted string
  const todayStr = formatDate(new Date());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-cyber text-slate-100 tracking-wide">
              Activity Calendar & Time Distribution
            </h1>
          </div>
          <p className="text-sm text-slate-400 font-mono-cyber mt-1.5">
            Mini stacked colored bars display the proportion of focus time invested across subjects each day.
          </p>
        </div>
      </div>

      {/* Main Calendar View Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar Grid Card */}
        <div className="lg:col-span-8 glass-panel-neon p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl space-y-6">
          {/* Month & Nav Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl sm:text-2xl font-bold font-cyber text-slate-100 tracking-wider">
                {monthName} <span className="text-neon-cyan">{currentYear}</span>
              </h2>
            </div>

            <div className="flex items-center space-x-2 bg-black/40 p-1 rounded-xl border border-white/15 backdrop-blur-md">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setCurrentDate(new Date());
                }}
                className="px-2.5 py-1 text-xs font-mono-cyber text-slate-300 hover:text-neon-cyan"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div
                key={day}
                className="text-xs font-mono-cyber font-semibold text-slate-400 uppercase tracking-wider py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day Grid Blocks */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {/* Blank leading offset days */}
            {Array.from({ length: startOffset }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="aspect-square rounded-2xl bg-black/10 border border-white/5 opacity-20"
              />
            ))}

            {/* Actual Month Days */}
            {monthDays.map((day) => {
              const dayPadded = String(day).padStart(2, '0');
              const monthPadded = String(currentMonthIdx + 1).padStart(2, '0');
              const dateKey = `${currentYear}-${monthPadded}-${dayPadded}`;
              const dayActivity = calendarData[dateKey];
              const hasActivity = dayActivity && dayActivity.tasks && dayActivity.tasks.length > 0;
              const isToday = dateKey === todayStr;
              const isSelected = selectedDay?.dateStr === dateKey;

              return (
                <motion.div
                  key={day}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedDay({ dateStr: dateKey, activity: dayActivity });
                  }}
                  className={`relative aspect-square rounded-2xl p-2 flex flex-col justify-between cursor-pointer transition-all duration-300 border ${
                    isSelected
                      ? 'border-neon-cyan ring-2 ring-neon-cyan/40 bg-neon-cyan/15 backdrop-blur-md'
                      : isToday
                      ? 'border-neon-purple/70 bg-neon-purple/15 backdrop-blur-md shadow-neon-purple/20'
                      : hasActivity
                      ? 'border-white/20 bg-black/35 backdrop-blur-md hover:border-neon-cyan/50 shadow-md'
                      : 'border-white/5 bg-black/20 backdrop-blur-sm opacity-40 hover:opacity-70'
                  }`}
                  style={{
                    boxShadow: hasActivity
                      ? '0 0 15px -3px rgba(0, 240, 255, 0.15)'
                      : 'none',
                  }}
                >
                  {/* Day Number */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono-cyber font-bold ${
                        isToday
                          ? 'text-neon-purple'
                          : hasActivity
                          ? 'text-slate-100'
                          : 'text-slate-500'
                      }`}
                    >
                      {day}
                    </span>
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-ping" />
                    )}
                  </div>

                  {/* Stacked Colored Time Distribution Bars */}
                  {hasActivity ? (
                    <div className="w-full mt-auto space-y-1">
                      {/* Mini Horizontal Stacked Distribution Bar */}
                      <div className="w-full h-2 rounded-full overflow-hidden flex bg-black/60 border border-white/10">
                        {dayActivity.tasks.map((task, tIdx) => {
                          const ratio = Math.max(
                            8,
                            (task.durationMinutes / (dayActivity.totalMinutes || 1)) * 100
                          );
                          return (
                            <div
                              key={tIdx}
                              title={`${task.title} (${task.durationMinutes}m)`}
                              style={{
                                width: `${ratio}%`,
                                backgroundColor: task.color,
                              }}
                              className="h-full transition-all"
                            />
                          );
                        })}
                      </div>

                      {/* Total Minutes Tag */}
                      <span className="block text-[9px] font-mono-cyber text-slate-300 truncate">
                        {Math.round(dayActivity.totalMinutes / 60 * 10) / 10}h
                      </span>
                    </div>
                  ) : (
                    <div className="w-full h-1.5 rounded-full bg-white/5 mt-auto" />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono-cyber text-slate-300 pt-4 border-t border-white/10">
            <div className="flex items-center space-x-2">
              <div className="w-3.5 h-3.5 rounded-md bg-black/30 border border-white/10 opacity-40" />
              <span>Grey: Inactive Day</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3.5 h-3.5 rounded-md bg-black/40 border border-neon-cyan shadow-sm shadow-neon-cyan/40" />
              <span>Neon Border: Active Focus Day</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-2 rounded-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-rose" />
              <span>Stacked Bars: Time Distribution</span>
            </div>
          </div>
        </div>

        {/* Selected Day Inspector / Breakdown Panel */}
        <div className="lg:col-span-4">
          <div className="glass-panel p-6 rounded-3xl border border-white/15 sticky top-28 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold font-cyber text-slate-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-neon-cyan" />
                Day Breakdown
              </h3>
              {selectedDay && (
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {selectedDay ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono-cyber text-slate-200 font-bold">
                    {selectedDay.dateStr}
                  </span>
                  {selectedDay.activity ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono-cyber font-bold bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30">
                      {selectedDay.activity.totalMinutes} mins total
                    </span>
                  ) : (
                    <span className="text-xs font-mono-cyber text-slate-400">
                      No activity recorded
                    </span>
                  )}
                </div>

                {selectedDay.activity && selectedDay.activity.tasks.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono-cyber uppercase text-slate-300 tracking-wider">
                      Tasks Completed ({selectedDay.activity.tasks.length})
                    </h4>

                    {selectedDay.activity.tasks.map((task, idx) => {
                      const percentage = Math.round(
                        (task.durationMinutes / selectedDay.activity!.totalMinutes) * 100
                      );

                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2 backdrop-blur-md"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center space-x-2 font-semibold text-slate-200 truncate">
                              <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: task.color }}
                              />
                              <span className="truncate">{task.title}</span>
                            </span>
                            <span className="font-mono-cyber text-slate-300">
                              {task.durationMinutes}m ({percentage}%)
                            </span>
                          </div>

                          <div className="w-full bg-black/60 rounded-full h-1.5 overflow-hidden border border-white/5">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: task.color,
                                boxShadow: `0 0 8px ${task.color}`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-black/30 text-center border border-white/10 space-y-2 backdrop-blur-md">
                    <Clock className="w-8 h-8 text-slate-500 mx-auto" />
                    <p className="text-xs text-slate-300 font-mono-cyber">
                      No study sessions logged for this day. Click on any active day in the calendar to inspect its breakdown.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-black/30 text-center border border-white/10 space-y-3 backdrop-blur-md">
                <Info className="w-8 h-8 text-neon-cyan/70 mx-auto animate-pulse" />
                <h4 className="text-sm font-bold font-cyber text-slate-200">
                  Select a Calendar Day
                </h4>
                <p className="text-xs text-slate-400 font-mono-cyber">
                  Click on any day tile to explore the detailed stacked time breakdown and subjects studied.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
