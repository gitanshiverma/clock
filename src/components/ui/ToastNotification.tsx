import React from 'react';
import { TaskBlock } from '../../types';
import { soundManager } from '../../utils/audio';
import { formatTime12h } from '../../utils/storage';
import { Bell, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastNotificationProps {
  alertTask: TaskBlock | null;
  onDismiss: () => void;
  onComplete: (task: TaskBlock) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  alertTask,
  onDismiss,
  onComplete,
}) => {
  if (!alertTask) return null;

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 right-6 z-50 max-w-md w-full px-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="glass-panel-neon p-5 rounded-3xl border-2 border-neon-rose shadow-neon-pink pointer-events-auto bg-dark-900/95"
        >
          <div className="flex items-start justify-between gap-3">
            {/* Siren animated icon */}
            <div className="w-12 h-12 rounded-2xl bg-neon-rose/20 border border-neon-rose/50 flex items-center justify-center flex-shrink-0 animate-bounce">
              <Bell className="w-6 h-6 text-neon-rose fill-neon-rose/30" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono-cyber font-bold uppercase tracking-wider text-neon-rose px-2 py-0.5 rounded-full bg-neon-rose/10 border border-neon-rose/30">
                  Focus Block Ended
                </span>
              </div>

              <h4 className="text-base font-bold font-cyber text-slate-100 mt-1 truncate">
                {alertTask.title}
              </h4>

              <p className="text-xs text-slate-400 font-mono-cyber mt-0.5">
                Scheduled time window ({formatTime12h(alertTask.startTime)} – {formatTime12h(alertTask.endTime)}) is complete.
              </p>

              <div className="flex items-center space-x-2 mt-3.5">
                <button
                  onClick={() => {
                    soundManager.playChime();
                    onComplete(alertTask);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-dark-900 font-bold font-cyber text-xs hover:brightness-110 flex items-center space-x-1.5 shadow-md shadow-emerald-500/20"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mark Done & Log</span>
                </button>

                <button
                  onClick={onDismiss}
                  className="px-3 py-1.5 rounded-xl bg-dark-850 border border-slate-700 text-slate-300 hover:text-slate-100 text-xs font-semibold"
                >
                  Dismiss
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onDismiss}
              className="text-slate-500 hover:text-slate-300 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
