import React, { useState } from 'react';
import { TaskBlock } from '../../types';
import { soundManager } from '../../utils/audio';
import { formatTime12h } from '../../utils/storage';
import {
  Plus,
  Trash2,
  Edit2,
  Copy,
  CheckCircle,
  Clock,
  Palette,
  Layers,
  Calendar,
  Tag,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StudyBlockPageProps {
  tasks: TaskBlock[];
  onAddTask: (task: Omit<TaskBlock, 'id'>) => void;
  onUpdateTask: (id: string, updated: Partial<TaskBlock>) => void;
  onDeleteTask: (id: string) => void;
  onResetTasks?: () => void;
}

const NEON_PRESET_COLORS = [
  { name: 'Cyber Cyan', hex: '#00f0ff' },
  { name: 'Electric Purple', hex: '#a855f7' },
  { name: 'Emerald Glow', hex: '#22c55e' },
  { name: 'Neon Rose', hex: '#ff007f' },
  { name: 'Amber Solar', hex: '#f59e0b' },
  { name: 'Cobalt Matrix', hex: '#3b82f6' },
  { name: 'Hyper Teal', hex: '#14b8a6' },
  { name: 'Golden Glow', hex: '#eab308' },
];

const CATEGORIES = [
  { id: 'study', label: 'Study & Research', icon: '📚' },
  { id: 'coding', label: 'Coding & Systems', icon: '💻' },
  { id: 'deepwork', label: 'Deep Work', icon: '🧠' },
  { id: 'reading', label: 'Reading', icon: '📖' },
  { id: 'workout', label: 'Workout & Fitness', icon: '⚡' },
  { id: 'break', label: 'Rest & Nutrition', icon: '☕' },
  { id: 'custom', label: 'Other Block', icon: '✨' },
];

export const StudyBlockPage: React.FC<StudyBlockPageProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onResetTasks,
}) => {
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskBlock['category']>('study');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [color, setColor] = useState('#00f0ff');
  const [notes, setNotes] = useState('');

  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);

  const calculateDuration = (start: string, end: string) => {
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    let diff = (eH * 60 + eM) - (sH * 60 + sM);
    if (diff < 0) diff += 24 * 60;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingId) {
      onUpdateTask(editingId, {
        title,
        category,
        startTime,
        endTime,
        color,
        notes,
      });
      setEditingId(null);
      soundManager.playChime();
    } else {
      onAddTask({
        title,
        category,
        startTime,
        endTime,
        color,
        notes,
        completed: false,
      });
      soundManager.playChime();
    }

    // Reset Form
    setTitle('');
    setNotes('');
  };

  const handleEdit = (task: TaskBlock) => {
    soundManager.playClick();
    setEditingId(task.id);
    setTitle(task.title);
    setCategory(task.category);
    setStartTime(task.startTime);
    setEndTime(task.endTime);
    setColor(task.color);
    setNotes(task.notes || '');
  };

  const handleDuplicate = (task: TaskBlock) => {
    soundManager.playClick();
    const [sH, sM] = task.startTime.split(':').map(Number);
    const [eH, eM] = task.endTime.split(':').map(Number);
    const dur = (eH * 60 + eM) - (sH * 60 + sM);
    const newStartTotal = (eH * 60 + eM + 15) % (24 * 60);
    const newEndTotal = (newStartTotal + dur) % (24 * 60);
    const pad = (n: number) => String(n).padStart(2, '0');

    onAddTask({
      title: `${task.title} (Copy)`,
      category: task.category,
      startTime: `${pad(Math.floor(newStartTotal / 60))}:${pad(newStartTotal % 60)}`,
      endTime: `${pad(Math.floor(newEndTotal / 60))}:${pad(newEndTotal % 60)}`,
      color: task.color,
      notes: task.notes,
      completed: false,
    });
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan">
              <Clock className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-cyber text-slate-100 tracking-wide">
              Study Block Timetable Creator
            </h1>
          </div>
          <p className="text-sm text-slate-400 font-mono-cyber mt-1.5">
            Configure your daily focus blocks. Scheduled blocks dynamically render onto the 3D clock face.
          </p>
        </div>
      </div>

      {/* 24-Hour Visual Timeline Strip */}
      <div className="glass-panel p-5 rounded-2xl border border-white/15">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs uppercase tracking-wider font-mono-cyber text-slate-300 font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neon-cyan" />
            24-Hour Schedule Distribution
          </h3>
          <span className="text-xs font-mono-cyber text-neon-cyan">
            {tasks.length} Blocks Configured
          </span>
        </div>

        {/* Timeline bar */}
        <div className="relative h-10 w-full bg-black/40 rounded-xl overflow-hidden border border-white/10">
          {/* Hour grid markers */}
          <div className="absolute inset-0 grid grid-cols-12 pointer-events-none opacity-20">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border-r border-slate-500 h-full text-[9px] font-mono pl-1 text-slate-400">
                {i * 2}h
              </div>
            ))}
          </div>

          {/* Task block ribbons */}
          {tasks.map((task) => {
            const [sH, sM] = task.startTime.split(':').map(Number);
            const [eH, eM] = task.endTime.split(':').map(Number);
            const startMin = sH * 60 + sM;
            const endMin = eH * 60 + eM;

            if (endMin <= startMin) {
              const seg1Start = startMin / (24 * 60);
              const seg1Width = (24 * 60 - startMin) / (24 * 60);
              const seg2Start = 0;
              const seg2Width = endMin / (24 * 60);

              return (
                <React.Fragment key={task.id}>
                  <div
                    title={`${task.title} (${task.startTime} - ${task.endTime})`}
                    className="absolute top-1 bottom-1 rounded-md transition-all cursor-pointer hover:brightness-125 opacity-90 shadow-sm"
                    style={{
                      left: `${seg1Start * 100}%`,
                      width: `${Math.max(0.01, seg1Width) * 100}%`,
                      backgroundColor: task.color,
                      boxShadow: `0 0 10px ${task.color}40`,
                    }}
                  />
                  {endMin > 0 && (
                    <div
                      title={`${task.title} (${task.startTime} - ${task.endTime})`}
                      className="absolute top-1 bottom-1 rounded-md transition-all cursor-pointer hover:brightness-125 opacity-90 shadow-sm"
                      style={{
                        left: `${seg2Start * 100}%`,
                        width: `${Math.max(0.01, seg2Width) * 100}%`,
                        backgroundColor: task.color,
                        boxShadow: `0 0 10px ${task.color}40`,
                      }}
                    />
                  )}
                </React.Fragment>
              );
            }

            const startRatio = startMin / (24 * 60);
            const widthRatio = Math.max(0.015, (endMin - startMin) / (24 * 60));

            return (
              <div
                key={task.id}
                title={`${task.title} (${task.startTime} - ${task.endTime})`}
                className="absolute top-1 bottom-1 rounded-md transition-all cursor-pointer hover:brightness-125 opacity-90 shadow-sm"
                style={{
                  left: `${startRatio * 100}%`,
                  width: `${widthRatio * 100}%`,
                  backgroundColor: task.color,
                  boxShadow: `0 0 10px ${task.color}40`,
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Task Creator / Editor Form */}
        <div className="lg:col-span-5">
          <div className="glass-panel-neon p-6 rounded-3xl border border-white/15 shadow-xl sticky top-28">
            <h2 className="text-lg font-bold font-cyber text-slate-100 mb-5 flex items-center justify-between">
              <span className="flex items-center gap-2">
                {editingId ? <Edit2 className="w-5 h-5 text-neon-purple" /> : <Plus className="w-5 h-5 text-neon-cyan" />}
                {editingId ? 'Edit Study Block' : 'Create New Focus Block'}
              </span>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setTitle('');
                    setNotes('');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel Edit
                </button>
              )}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Task Title */}
              <div>
                <label className="block text-xs font-mono-cyber text-slate-300 mb-1.5 font-semibold">
                  Block Title / Task Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced TypeScript & R3F"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-slate-100 text-sm focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan transition-all backdrop-blur-md"
                />
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-mono-cyber text-slate-300 mb-1.5 font-semibold">
                  Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as TaskBlock['category'])}
                      className={`flex items-center space-x-1.5 px-2.5 py-2 rounded-xl text-xs font-medium border text-left transition-all backdrop-blur-md ${
                        category === cat.id
                          ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan font-bold'
                          : 'bg-black/35 border-white/10 text-slate-300 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono-cyber text-slate-300 font-semibold">
                      Start Time
                    </label>
                    <span className="text-[10px] font-mono-cyber text-neon-cyan font-bold">
                      {formatTime12h(startTime)}
                    </span>
                  </div>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-slate-100 text-sm font-mono-cyber focus:border-neon-cyan focus:outline-none backdrop-blur-md"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono-cyber text-slate-300 font-semibold">
                      End Time
                    </label>
                    <span className="text-[10px] font-mono-cyber text-neon-cyan font-bold">
                      {formatTime12h(endTime)}
                    </span>
                  </div>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-slate-100 text-sm font-mono-cyber focus:border-neon-cyan focus:outline-none backdrop-blur-md"
                  />
                </div>
              </div>

              <div className="text-[11px] font-mono-cyber text-slate-300 text-right">
                Calculated Duration: <span className="text-neon-cyan font-bold">{calculateDuration(startTime, endTime)}</span>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-mono-cyber text-slate-300 mb-1.5 font-semibold flex items-center justify-between">
                  <span>3D Clock Arc Color</span>
                  <span className="font-mono text-[10px] text-slate-400">{color}</span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {NEON_PRESET_COLORS.map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      title={preset.name}
                      onClick={() => setColor(preset.hex)}
                      className={`w-8 h-8 rounded-xl border-2 transition-transform ${
                        color.toLowerCase() === preset.hex.toLowerCase()
                          ? 'scale-110 border-white shadow-md'
                          : 'border-transparent opacity-75 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: preset.hex,
                        boxShadow: color.toLowerCase() === preset.hex.toLowerCase() ? `0 0 12px ${preset.hex}` : 'none',
                      }}
                    />
                  ))}
                  <div className="relative">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-8 h-8 rounded-xl cursor-pointer bg-transparent border-0 opacity-0 absolute inset-0"
                    />
                    <div className="w-8 h-8 rounded-xl border border-white/15 bg-black/40 flex items-center justify-center text-slate-300 hover:text-white pointer-events-none backdrop-blur-md">
                      <Palette className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes / Details */}
              <div>
                <label className="block text-xs font-mono-cyber text-slate-300 mb-1.5 font-semibold">
                  Notes / Focus Goals (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Chapter 4 exercises, solve 2 graph algorithm problems"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-slate-100 text-xs focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan backdrop-blur-md"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-neon-cyan via-teal-400 to-neon-purple text-dark-900 font-bold font-cyber text-sm hover:brightness-110 transition-all shadow-lg shadow-neon-cyan/20 active:scale-[0.99]"
              >
                {editingId ? 'Update Study Block' : 'Add Block to 3D Clock'}
              </button>
            </form>
          </div>
        </div>

        {/* Task List / Management Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-cyber text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-neon-purple" />
              Scheduled Timetable ({tasks.length})
            </h2>
            {onResetTasks && (
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onResetTasks();
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-white/15 bg-black/35 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono-cyber transition-all backdrop-blur-md active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5 text-neon-cyan" />
                <span>Reset Blocks</span>
              </button>
            )}
          </div>

          {tasks.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center border border-white/15 space-y-3">
              <Clock className="w-12 h-12 text-slate-500 mx-auto animate-pulse" />
              <h3 className="text-base font-bold text-slate-200 font-cyber">No study blocks scheduled</h3>
              <p className="text-xs text-slate-400 font-mono-cyber max-w-sm mx-auto">
                Add a study block using the form on the left or click the Pomodoro presets above to populate your 3D clock.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {tasks.map((task) => {
                  const duration = calculateDuration(task.startTime, task.endTime);
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`glass-panel p-4 sm:p-5 rounded-2xl border transition-all ${
                        task.completed
                          ? 'border-white/10 opacity-60'
                          : 'border-white/15 hover:border-white/30'
                      }`}
                      style={{
                        borderLeftWidth: '4px',
                        borderLeftColor: task.color,
                      }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Task Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: task.color }}
                            />
                            <h3
                              className={`text-base font-bold font-cyber truncate ${
                                task.completed ? 'line-through text-slate-400' : 'text-slate-100'
                              }`}
                            >
                              {task.title}
                            </h3>
                            {task.completed && (
                              <span className="px-2 py-0.5 text-[10px] font-mono-cyber font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                Completed
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono-cyber text-slate-400">
                            <span className="flex items-center gap-1 text-slate-200 font-semibold">
                              <Clock className="w-3.5 h-3.5 text-neon-cyan" />
                              {formatTime12h(task.startTime)} – {formatTime12h(task.endTime)} ({duration})
                            </span>
                            <span className="capitalize text-slate-400 flex items-center gap-1">
                              <Tag className="w-3.5 h-3.5 text-slate-500" />
                              {task.category}
                            </span>
                          </div>

                          {task.notes && (
                            <p className="text-xs text-slate-300 font-sans mt-2 bg-black/35 p-2 rounded-lg border border-white/10 backdrop-blur-sm">
                              {task.notes}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-1.5 self-end sm:self-center">
                          {/* Toggle Complete */}
                          <button
                            onClick={() => {
                              soundManager.playClick();
                              onUpdateTask(task.id, { completed: !task.completed });
                            }}
                            title={task.completed ? 'Mark as active' : 'Mark as complete'}
                            className={`p-2 rounded-xl border transition-all ${
                              task.completed
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                : 'bg-black/40 border-white/15 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 backdrop-blur-sm'
                            }`}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleEdit(task)}
                            title="Edit Block"
                            className="p-2 rounded-xl bg-black/40 border border-white/15 text-slate-300 hover:text-neon-cyan hover:border-neon-cyan/40 transition-all backdrop-blur-sm"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicate(task)}
                            title="Duplicate Block"
                            className="p-2 rounded-xl bg-black/40 border border-white/15 text-slate-300 hover:text-neon-purple hover:border-neon-purple/40 transition-all backdrop-blur-sm"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              soundManager.playClick();
                              onDeleteTask(task.id);
                            }}
                            title="Delete Block"
                            className="p-2 rounded-xl bg-black/40 border border-white/15 text-slate-300 hover:text-neon-rose hover:border-neon-rose/40 transition-all backdrop-blur-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
