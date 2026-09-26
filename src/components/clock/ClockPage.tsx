import React, { useState, useEffect, useRef } from 'react';
import { TaskBlock, ActivePage, BackgroundSettings, Clock3DSettings, BackgroundVideoOption } from '../../types';
import { soundManager } from '../../utils/audio';
import { formatTime12h, DEFAULT_BACKGROUND_SETTINGS, DEFAULT_CLOCK3D_SETTINGS } from '../../utils/storage';
import {
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Sliders,
  Sparkles,
  Move,
  RotateCcw,
  Video,
  Layers,
  Compass,
  Check,
  X,
  Sun,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClockPageProps {
  tasks: TaskBlock[];
  setActivePage?: (page: ActivePage) => void;
  onAddTask?: (task: Omit<TaskBlock, 'id'>) => void;
  triggerTaskAlert?: (task: TaskBlock) => void;
  backgroundSettings: BackgroundSettings;
  setBackgroundSettings: React.Dispatch<React.SetStateAction<BackgroundSettings>>;
  clockSettings: Clock3DSettings;
  setClockSettings: React.Dispatch<React.SetStateAction<Clock3DSettings>>;
}

const BACKGROUND_OPTIONS: { id: BackgroundVideoOption; title: string; subtitle: string; icon: string }[] = [
  { id: 'study_01', title: 'Study Space 01', subtitle: 'study_01.mp4 • Focus Ambient', icon: '📚' },
  { id: 'study_02', title: 'Study Space 02', subtitle: 'study_02.mp4 • Deep Concentration', icon: '📖' },
  { id: 'study_03', title: 'Study Space 03', subtitle: 'study_03.mp4 • Zen Workspace', icon: '✍️' },
  { id: 'study_04', title: 'Study Space 04', subtitle: 'study_04.mp4 • Quiet Room', icon: '💡' },
  { id: 'coding', title: 'Coding Station', subtitle: 'coding.mp4 • Dev Setup', icon: '💻' },
  { id: 'dark', title: 'Dark Scene', subtitle: 'dark.mp4 • Obsidian Mood', icon: '🌙' },
  { id: 'music', title: 'Music Vibe', subtitle: 'music.mp4 • Soundwave Glow', icon: '🎵' },
  { id: 'spring', title: 'Spring Nature', subtitle: 'spring.mp4 • Blossom Breeze', icon: '🌸' },
  { id: 'rain', title: 'Rainy City', subtitle: 'rain.mp4 • Rain Drops', icon: '🌧️' },
  { id: 'wheel', title: 'Ferris Wheel', subtitle: 'wheel.mp4 • Golden Bokeh', icon: '🎡' },
];

export const ClockPage: React.FC<ClockPageProps> = ({
  tasks,
  backgroundSettings,
  setBackgroundSettings,
  clockSettings,
  setClockSettings,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hideHUD, setHideHUD] = useState<boolean>(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'background' | 'clock'>('background');
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

  const handleResetSettings = () => {
    soundManager.playClick();
    setBackgroundSettings(DEFAULT_BACKGROUND_SETTINGS);
    setClockSettings(DEFAULT_CLOCK3D_SETTINGS);
  };

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

      {/* Top Floating Bar: Active Task & Control Buttons */}
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

          {/* Action Buttons: Background & Clock Controls + Full Screen */}
          <div className="flex items-center gap-3 pointer-events-auto">
            <button
              onClick={() => {
                soundManager.playClick();
                setShowSettingsPanel((prev) => !prev);
              }}
              title="Customize 3D Background & Clock position"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl glass-panel border ${
                showSettingsPanel
                  ? 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan'
                  : 'border-white/15 text-slate-200 hover:text-neon-cyan hover:border-neon-cyan/50'
              } text-xs font-semibold font-cyber transition-all shadow-lg hover:shadow-neon-cyan/20 active:scale-95 backdrop-blur-xl`}
            >
              <Sliders className="w-4 h-4" />
              <span>3D & Background</span>
            </button>

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

      {/* Interactive 3D Background & Clock Customization Drawer Panel */}
      <AnimatePresence>
        {showSettingsPanel && !hideHUD && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute top-20 right-6 z-40 w-96 max-w-[calc(100vw-3rem)] max-h-[calc(100vh-7rem)] overflow-y-auto custom-scrollbar glass-panel rounded-3xl p-5 border border-white/20 shadow-2xl backdrop-blur-2xl text-slate-100 pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-neon-cyan" />
                <h3 className="font-cyber font-bold text-sm tracking-wide text-white">
                  3D & Background Controls
                </h3>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowSettingsPanel(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-black/40 p-1 rounded-xl mb-4 border border-white/10">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab('background');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-cyber font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                  activeTab === 'background'
                    ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Background</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab('clock');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-cyber font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                  activeTab === 'clock'
                    ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Move className="w-3.5 h-3.5" />
                <span>3D Clock</span>
              </button>
            </div>

            {/* Background Tab Content */}
            {activeTab === 'background' && (
              <div className="space-y-4">
                {/* Background Video Selector */}
                <div>
                  <label className="text-xs font-mono-cyber text-slate-300 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-neon-cyan" />
                      <span>Select Video Background</span>
                    </span>
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {BACKGROUND_OPTIONS.map((opt) => {
                      const isSelected = backgroundSettings.video === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            soundManager.playClick();
                            setBackgroundSettings((prev) => ({ ...prev, video: opt.id }));
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-neon-cyan/15 border-neon-cyan text-white shadow-md'
                              : 'bg-white/5 border-white/15 text-slate-300 hover:bg-white/10 hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{opt.icon}</span>
                            <div>
                              <div className="text-xs font-bold font-cyber flex items-center gap-1.5">
                                <span>{opt.title}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono-cyber">
                                {opt.subtitle}
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-neon-cyan" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clock Page Only Option */}
                <div className="pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-neon-cyan" />
                        <span>Clock Page Only</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Restrict 3D video to clock page only
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        setBackgroundSettings((prev) => ({
                          ...prev,
                          clockPageOnly: !prev.clockPageOnly,
                        }));
                      }}
                      className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                        backgroundSettings.clockPageOnly ? 'bg-neon-cyan' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          backgroundSettings.clockPageOnly ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Background Brightness Slider */}
                <div className="pt-2 border-t border-white/10">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-200 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-neon-cyan" />
                      <span>Background Brightness</span>
                    </span>
                    <span className="font-mono-cyber text-neon-cyan">
                      {Math.round(backgroundSettings.brightness * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={backgroundSettings.brightness}
                    onChange={(e) =>
                      setBackgroundSettings((prev) => ({
                        ...prev,
                        brightness: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-neon-cyan cursor-pointer h-1.5 rounded-lg bg-slate-700"
                  />
                </div>

                {/* 3D Motion Controls */}
                <div className="pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-neon-cyan" />
                        <span>Dynamic 3D Parallax Motion</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Camera tilts & moves dynamically with mouse
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        setBackgroundSettings((prev) => ({
                          ...prev,
                          motion3D: !prev.motion3D,
                        }));
                      }}
                      className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                        backgroundSettings.motion3D ? 'bg-neon-cyan' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          backgroundSettings.motion3D ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {backgroundSettings.motion3D && (
                    <div className="mt-2">
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Motion Intensity</span>
                        <span className="font-mono-cyber text-neon-cyan">
                          {backgroundSettings.motionIntensity.toFixed(1)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="2.0"
                        step="0.1"
                        value={backgroundSettings.motionIntensity}
                        onChange={(e) =>
                          setBackgroundSettings((prev) => ({
                            ...prev,
                            motionIntensity: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full accent-neon-cyan cursor-pointer h-1.5 rounded-lg bg-slate-700"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3D Clock Tab Content */}
            {activeTab === 'clock' && (
              <div className="space-y-4">
                {/* Camera Angle Mode Selector */}
                <div>
                  <label className="text-xs font-mono-cyber text-slate-300 mb-2 block">
                    3D Camera View Angle
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { id: 'cyber', label: 'Cyber 3D Angle' },
                        { id: 'front', label: 'Front 2D View' },
                        { id: 'top', label: 'Top View' },
                        { id: 'free', label: 'Free 3D Orbit' },
                      ] as const
                    ).map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => {
                          soundManager.playClick();
                          setClockSettings((prev) => ({ ...prev, cameraPreset: mode.id }));
                        }}
                        className={`p-2 rounded-xl border text-xs font-cyber transition-all ${
                          clockSettings.cameraPreset === mode.id
                            ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size / Scale Slider */}
                <div className="pt-2 border-t border-white/10">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-200 mb-1">
                    <span>Clock Size / Scale</span>
                    <span className="font-mono-cyber text-neon-cyan">
                      {Math.round(clockSettings.scale * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.6"
                    step="0.05"
                    value={clockSettings.scale}
                    onChange={(e) =>
                      setClockSettings((prev) => ({
                        ...prev,
                        scale: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-neon-cyan cursor-pointer h-1.5 rounded-lg bg-slate-700"
                  />
                </div>

                {/* Horizontal Position X */}
                <div className="pt-2 border-t border-white/10">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-200 mb-1">
                    <span>Horizontal Position (X)</span>
                    <span className="font-mono-cyber text-neon-cyan">
                      {clockSettings.positionX.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-4.0"
                    max="4.0"
                    step="0.1"
                    value={clockSettings.positionX}
                    onChange={(e) =>
                      setClockSettings((prev) => ({
                        ...prev,
                        positionX: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-neon-cyan cursor-pointer h-1.5 rounded-lg bg-slate-700"
                  />
                </div>

                {/* Vertical Position Y */}
                <div className="pt-2 border-t border-white/10">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-200 mb-1">
                    <span>Vertical Position (Y)</span>
                    <span className="font-mono-cyber text-neon-cyan">
                      {clockSettings.positionY.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-4.0"
                    max="4.0"
                    step="0.1"
                    value={clockSettings.positionY}
                    onChange={(e) =>
                      setClockSettings((prev) => ({
                        ...prev,
                        positionY: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-neon-cyan cursor-pointer h-1.5 rounded-lg bg-slate-700"
                  />
                </div>

                {/* Depth Position Z */}
                <div className="pt-2 border-t border-white/10">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-200 mb-1">
                    <span>Depth Distance (Z)</span>
                    <span className="font-mono-cyber text-neon-cyan">
                      {clockSettings.positionZ.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-5.0"
                    max="5.0"
                    step="0.2"
                    value={clockSettings.positionZ}
                    onChange={(e) =>
                      setClockSettings((prev) => ({
                        ...prev,
                        positionZ: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-neon-cyan cursor-pointer h-1.5 rounded-lg bg-slate-700"
                  />
                </div>

                {/* Rotation Z */}
                <div className="pt-2 border-t border-white/10">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-200 mb-1">
                    <span>Clock Rotation</span>
                    <span className="font-mono-cyber text-neon-cyan">
                      {Math.round(clockSettings.rotationZ)}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="5"
                    value={clockSettings.rotationZ}
                    onChange={(e) =>
                      setClockSettings((prev) => ({
                        ...prev,
                        rotationZ: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full accent-neon-cyan cursor-pointer h-1.5 rounded-lg bg-slate-700"
                  />
                </div>
              </div>
            )}

            {/* Footer Reset Button */}
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={handleResetSettings}
                className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowSettingsPanel(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-neon-cyan text-slate-950 text-xs font-bold font-cyber hover:bg-cyan-300 transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
