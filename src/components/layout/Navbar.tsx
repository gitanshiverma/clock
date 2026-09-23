import React, { useState, useEffect } from 'react';
import { ActivePage, SoundSettings } from '../../types';
import { soundManager } from '../../utils/audio';
import {
  Clock,
  BookOpen,
  Flame,
  Calendar as CalendarIcon,
  Volume2,
  VolumeX,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  streakCount: number;
  soundSettings: SoundSettings;
  setSoundSettings: React.Dispatch<React.SetStateAction<SoundSettings>>;
  onResetAll?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  streakCount,
  soundSettings,
  setSoundSettings,
  onResetAll,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [periodStr, setPeriodStr] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setTimeStr(`${String(hours).padStart(2, '0')}:${minutes}:${seconds}`);
      setPeriodStr(period);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const next = !soundSettings.enabled;
    setSoundSettings((prev) => ({ ...prev, enabled: next }));
    soundManager.setMuted(!next);
    if (next) {
      soundManager.playChime();
    }
  };

  const navItems = [
    { id: 'clock' as ActivePage, label: '3D Clock', icon: Clock },
    { id: 'study' as ActivePage, label: 'Study Blocks', icon: BookOpen },
    { id: 'streak' as ActivePage, label: 'Streak Tracker', icon: Flame },
    { id: 'calendar' as ActivePage, label: 'Calendar Grid', icon: CalendarIcon },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 bg-black/35 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <div
            onClick={() => {
              soundManager.playClick();
              setActivePage('clock');
            }}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan/20 via-neon-purple/20 to-transparent p-0.5 border border-neon-cyan/40 group-hover:border-neon-cyan transition-all duration-300 shadow-neon-cyan/20 group-hover:shadow-neon-cyan/50">
              <div className="w-full h-full bg-black/50 rounded-[10px] flex items-center justify-center backdrop-blur-sm">
                <Clock className="w-5 h-5 text-neon-cyan group-hover:rotate-45 transition-transform duration-500" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-neon-cyan"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-bold font-cyber tracking-wider bg-gradient-to-r from-neon-cyan via-slate-100 to-neon-purple bg-clip-text text-transparent">
                  TIMEBLOCKS
                </span>
                <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan font-mono-cyber">
                  3D
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono-cyber hidden sm:block">
                Cybernetic Focus Dial
              </p>
            </div>
          </div>

          {/* Nav Items (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1 bg-black/40 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    soundManager.playClick();
                    setActivePage(item.id);
                  }}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-neon-cyan/25 to-neon-purple/25 text-neon-cyan border border-neon-cyan/50 shadow-sm shadow-neon-cyan/20'
                      : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-neon-cyan' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Live Cyber Clock */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 font-mono-cyber text-xs backdrop-blur-md">
              <span className="text-neon-cyan font-bold tracking-wider">{timeStr}</span>
              <span className="text-[10px] text-slate-400 font-semibold">{periodStr}</span>
            </div>

            {/* Streak Counter Pill */}
            <button
              onClick={() => {
                soundManager.playClick();
                setActivePage('streak');
              }}
              title="View Streak Tracker"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/40 text-amber-400 hover:border-amber-400 transition-all text-xs font-bold font-mono-cyber shadow-sm group backdrop-blur-md"
            >
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse group-hover:scale-110 transition-transform" />
              <span>{streakCount}d Streak</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              title={soundSettings.enabled ? 'Sound alerts enabled (Click to mute)' : 'Sound alerts muted (Click to enable)'}
              className={`p-2.5 rounded-xl border transition-all duration-200 backdrop-blur-md ${
                soundSettings.enabled
                  ? 'bg-neon-cyan/15 border-neon-cyan/40 text-neon-cyan shadow-sm shadow-neon-cyan/20 hover:bg-neon-cyan/25'
                  : 'bg-black/40 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              {soundSettings.enabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* Reset All Data Button */}
            {onResetAll && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowResetConfirm(true);
                }}
                title="Reset Everything (Tasks, Streaks, Calendar)"
                className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:border-rose-400/60 transition-all duration-200 backdrop-blur-md group"
              >
                <RotateCcw className="w-4 h-4 group-hover:-rotate-90 transition-transform duration-300" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden overflow-x-auto py-2.5 space-x-2 border-t border-white/10 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundManager.playClick();
                  setActivePage(item.id);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 font-semibold'
                    : 'text-slate-300 bg-black/40 border border-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel p-6 rounded-3xl max-w-md w-full border border-rose-500/40 shadow-2xl relative text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center mx-auto mb-4 text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-cyber text-slate-100 mb-2">
                Reset Everything?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6 font-mono-cyber">
                This will reset all study blocks, streak history, calendar statistics, and sound preferences back to clean defaults.
              </p>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setShowResetConfirm(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 text-xs font-semibold font-cyber transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    soundManager.playChime();
                    setShowResetConfirm(false);
                    onResetAll?.();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-bold font-cyber shadow-lg shadow-rose-500/30 transition-all active:scale-95"
                >
                  Reset Everything
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};

