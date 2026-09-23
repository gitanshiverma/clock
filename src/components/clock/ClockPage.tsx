import React, { useState, useEffect, useRef } from 'react';
import { TaskBlock, ActivePage } from '../../types';
import { soundManager } from '../../utils/audio';
import { formatTime12h } from '../../utils/storage';
import {
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ClockPageProps {
  tasks: TaskBlock[];
  setActivePage?: (page: ActivePage) => void;
  onAddTask?: (task: Omit<TaskBlock, 'id'>) => void;
  triggerTaskAlert?: (task: TaskBlock) => void;
}

export const ClockPage: React.FC<ClockPageProps> = ({
  tasks,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hideHUD, setHideHUD] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Update real-time clock tick
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen to native fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    soundManager.playClick();
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any)?.webkitRequestFullscreen) {
          await (document.documentElement as any).webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any)?.webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen((prev) => !prev);
    }
  };

  // Compute active task and time remaining
  const activeTask = tasks.find((t) => {
    if (t.completed) return false;
    const [sH, sM] = t.startTime.split(':').map(Number);
    const [eH, eM] = t.endTime.split(':').map(Number);
    const curMin = currentTime.getHours() * 60 + currentTime.getMinutes() + currentTime.getSeconds() / 60;
    const startMin = sH * 60 + sM;
    const endMin = eH * 60 + eM;
    return endMin > startMin
      ? curMin >= startMin && curMin < endMin
      : curMin >= startMin || curMin < endMin;
  });

  const nextTask = tasks
    .filter((t) => !t.completed && t.id !== activeTask?.id)
    .map((t) => {
      const [sH, sM] = t.startTime.split(':').map(Number);
      const curMin = currentTime.getHours() * 60 + currentTime.getMinutes();
      const startMin = sH * 60 + sM;
      const minutesUntil = (startMin - curMin + 1440) % 1440;
      return { task: t, minutesUntil };
    })
    .sort((a, b) => a.minutesUntil - b.minutesUntil)[0]?.task;

  // Calculate remaining minutes for active task
  let activeRemainingMin = 0;
  let activeProgress = 0;
  if (activeTask) {
    const [sH, sM] = activeTask.startTime.split(':').map(Number);
    const [eH, eM] = activeTask.endTime.split(':').map(Number);
    const curMin = currentTime.getHours() * 60 + currentTime.getMinutes() + currentTime.getSeconds() / 60;
    const startMin = sH * 60 + sM;
    let endMin = eH * 60 + eM;
    if (endMin <= startMin) endMin += 24 * 60;
    let effectiveCurMin = curMin;
    if (effectiveCurMin < startMin) effectiveCurMin += 24 * 60;

    const totalDuration = endMin - startMin;
    const elapsed = effectiveCurMin - startMin;
    activeRemainingMin = Math.max(0, Math.ceil(endMin - effectiveCurMin));
    activeProgress = Math.min(100, Math.max(0, (elapsed / (totalDuration || 1)) * 100));
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen bg-black/20' : 'h-[calc(100vh-4.5rem)] min-h-[640px]'
      } flex flex-col justify-between overflow-hidden bg-transparent pointer-events-none select-none`}
    >
      {/* Floating Zen Mode Toggle (Visible in Fullscreen) */}
      {isFullscreen && (
        <button
          onClick={() => {
            soundManager.playClick();
            setHideHUD((prev) => !prev);
          }}
          className="absolute top-4 right-20 z-40 p-2.5 rounded-xl glass-panel border border-white/15 text-slate-300 hover:text-neon-cyan transition-all pointer-events-auto shadow-lg"
          title={hideHUD ? 'Show HUD' : 'Hide HUD'}
        >
          {hideHUD ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      )}

      {/* Top Floating Bar: Active Task & Full Screen Button */}
      {!hideHUD && (
        <div className="relative z-10 p-4 sm:p-6 flex items-start justify-between gap-4 pointer-events-none">
          {/* Active Task Card */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-4 rounded-2xl max-w-xs w-full pointer-events-auto shadow-2xl border border-white/15 backdrop-blur-xl"
          >
            {activeTask ? (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-neon-cyan font-mono-cyber">
                    <span className="w-2 h-2 rounded-full bg-neon-cyan animate-ping inline-block" />
                    <span>Active Block</span>
                  </span>
                  <span className="text-xs font-mono-cyber text-slate-300">
                    {activeRemainingMin}m left
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 font-cyber flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: activeTask.color }}
                  />
                  {activeTask.title}
                </h3>
                {/* Progress bar */}
                <div className="w-full bg-black/50 rounded-full h-1.5 mt-2 overflow-hidden border border-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${activeProgress}%`,
                      backgroundColor: activeTask.color,
                      boxShadow: `0 0 8px ${activeTask.color}`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono-cyber mt-1.5">
                  <span>{formatTime12h(activeTask.startTime)}</span>
                  <span>{formatTime12h(activeTask.endTime)}</span>
                </div>
              </div>
            ) : (
              <div>
                <span className="text-[11px] font-mono-cyber text-slate-400 uppercase tracking-wide">Status</span>
                <p className="text-xs font-medium text-slate-200">No active block</p>
                {nextTask && (
                  <p className="text-[11px] text-neon-purple mt-0.5 font-mono-cyber truncate">
                    Next: {nextTask.title} ({formatTime12h(nextTask.startTime)})
                  </p>
                )}
              </div>
            )}
          </motion.div>

          {/* Full Screen Button ONLY */}
          <div className="pointer-events-auto">
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl glass-panel border border-white/15 text-slate-200 hover:text-neon-cyan hover:border-neon-cyan/50 text-xs font-semibold font-cyber transition-all shadow-lg hover:shadow-neon-cyan/20 active:scale-95 backdrop-blur-xl"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 text-neon-cyan" /> : <Maximize2 className="w-4 h-4 text-neon-cyan" />}
              <span>{isFullscreen ? 'Exit Fullscreen' : 'Full Screen'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

