"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import type { Phase, Task, TaskStatus as TStatus } from "@/lib/types";
import {
  format,
  differenceInDays,
  startOfMonth,
  addDays,
  isToday,
  startOfISOWeek,
  addWeeks,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  isSameDay,
  differenceInWeeks,
  differenceInMonths,
  addMonths,
  startOfYear,
  endOfYear,
  isWithinInterval
} from "date-fns";
import TaskSidePanel from "./TaskSidePanel";
import { updateTaskDates } from "@/lib/queries";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Target,
  Calendar as CalendarIcon,
  Maximize2,
  Filter,
  Search,
  MoreHorizontal,
  Plus,
  X
} from "lucide-react";

type ZoomLevel = "day" | "week" | "month";

interface GanttChartProps {
  phases: (Phase & { type?: string; color?: string })[];
  showFilter?: boolean;
}

const COLUMN_WIDTHS: Record<ZoomLevel, number> = {
  day: 40,
  week: 100,
  month: 150
};

const STATUS_THEMES: Record<string, { bg: string; border: string; text: string; light: string }> = {
  not_started: { bg: "bg-slate-200", border: "border-slate-300", text: "text-slate-600", light: "bg-slate-50" },
  in_progress: { bg: "bg-blue-500", border: "border-blue-600", text: "text-white", light: "bg-blue-50" },
  completed: { bg: "bg-emerald-500", border: "border-emerald-600", text: "text-white", light: "bg-emerald-50" },
  blocked: { bg: "bg-amber-500", border: "border-amber-600", text: "text-white", light: "bg-amber-50" },
  critical: { bg: "bg-rose-500", border: "border-rose-600", text: "text-white", light: "bg-rose-50" },
};

export default function GanttChart({ phases, showFilter = true }: GanttChartProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState<ZoomLevel>("day");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [dragTask, setDragTask] = useState<{ id: string, startX: number, originalStart: Date, originalEnd: Date, type: 'move' | 'resize-start' | 'resize-end' } | null>(null);

  // Internal Search & Filter (for standalone use cases like Roadmap)
  const [internalSearch, setInternalSearch] = useState("");
  const [internalStatus, setInternalStatus] = useState<TStatus | "all">("all");

  const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const filteredPhases = useMemo(() => {
    if (!showFilter) return phases; // If controlled by parent (PlanView), trust the prop
    const query = internalSearch.toLowerCase();
    return phases.map(phase => ({
      ...phase,
      tasks: phase.tasks.filter(task => {
        const matchesSearch = task.name.toLowerCase().includes(query) || task.wbs.toLowerCase().includes(query);
        const matchesStatus = internalStatus === "all" || task.status === internalStatus;
        return matchesSearch && matchesStatus;
      })
    })).filter(phase => phase.tasks.length > 0 || internalSearch === "");
  }, [phases, internalSearch, internalStatus, showFilter]);

  const allTasks = useMemo(() => filteredPhases.flatMap(p => p.tasks), [filteredPhases]);

  // Determine chart range — Asana typically shows a wide range
  const { chartStart, chartEnd, totalDays } = useMemo(() => {
    const today = new Date();
    const start = startOfMonth(addMonths(today, -3));
    const end = endOfMonth(addMonths(today, 9));
    return {
      chartStart: start,
      chartEnd: end,
      totalDays: differenceInDays(end, start) + 1
    };
  }, []);

  const colWidth = COLUMN_WIDTHS[zoom];
  const rowHeight = 48; // Standard Asana row height

  const dateToPx = useCallback((date: Date) => {
    const days = differenceInDays(date, chartStart);
    return days * (colWidth / (zoom === 'day' ? 1 : zoom === 'week' ? 7 : 30));
  }, [chartStart, colWidth, zoom]);

  const pxToDate = useCallback((px: number) => {
    const days = px / (colWidth / (zoom === 'day' ? 1 : zoom === 'week' ? 7 : 30));
    return addDays(chartStart, Math.round(days));
  }, [chartStart, colWidth, zoom]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (headerRef.current) headerRef.current.scrollLeft = e.currentTarget.scrollLeft;
    if (sidebarRef.current) sidebarRef.current.scrollTop = e.currentTarget.scrollTop;
  };

  const syncScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (gridRef.current) gridRef.current.scrollTop = e.currentTarget.scrollTop;
  };

  useEffect(() => {
    if (mounted && gridRef.current) {
      const today = new Date();
      const offset = dateToPx(today);
      const containerWidth = gridRef.current.clientWidth;
      gridRef.current.scrollLeft = offset - containerWidth / 3;
    }
  }, [mounted, zoom, dateToPx]);

  const handleDragStart = (e: React.MouseEvent, task: Task, type: 'move' | 'resize-start' | 'resize-end') => {
    e.stopPropagation();
    if (!task.start_date || !task.end_date) return;
    setDragTask({
      id: task.id,
      startX: e.clientX,
      originalStart: new Date(task.start_date),
      originalEnd: new Date(task.end_date),
      type
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragTask) return;
      // Real-time visual feedback handled by local state in Row if we wanted, 
      // but for simplicity we'll just handle the drop. 
      // High-perf asana clone would use a ghost element.
    };

    const handleMouseUp = async (e: MouseEvent) => {
      if (!dragTask) return;
      const deltaX = e.clientX - dragTask.startX;
      const deltaDays = Math.round(deltaX / (colWidth / (zoom === 'day' ? 1 : zoom === 'week' ? 7 : 30)));

      let newStart = dragTask.originalStart;
      let newEnd = dragTask.originalEnd;

      if (dragTask.type === 'move') {
        newStart = addDays(dragTask.originalStart, deltaDays);
        newEnd = addDays(dragTask.originalEnd, deltaDays);
      } else if (dragTask.type === 'resize-start') {
        newStart = addDays(dragTask.originalStart, deltaDays);
        if (newStart > newEnd) newStart = newEnd;
      } else if (dragTask.type === 'resize-end') {
        newEnd = addDays(dragTask.originalEnd, deltaDays);
        if (newEnd < newStart) newEnd = newStart;
      }

      if (deltaDays !== 0) {
        try {
          await updateTaskDates(dragTask.id, newStart.toISOString(), newEnd.toISOString());
          router.refresh();
        } catch (err) {
          toast.error("Failed to update timeline");
        }
      }
      setDragTask(null);
    };

    if (dragTask) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragTask, colWidth, zoom, router]);

  // Calculate task positions for dependency lines
  const taskPositions = useMemo(() => {
    const pos: Record<string, { x: number, y: number, w: number, center: { x: number, y: number } }> = {};
    let currentY = 12 * 4; // Skip the top axis (12 and sync it with the content)
    // Actually, in the main grid, each phase header is 48px, then each task is 48px.
    // Let's compute this more precisely.
    let yOffset = 0;
    phases.forEach(phase => {
      yOffset += 48; // Phase header
      phase.tasks.forEach(task => {
        if (task.start_date && task.end_date) {
          const x = dateToPx(new Date(task.start_date));
          const w = dateToPx(addDays(new Date(task.end_date), 1)) - x;
          pos[task.id] = {
            x,
            y: yOffset,
            w,
            center: { x: x + w / 2, y: yOffset + 24 }
          };
        }
        yOffset += 48;
      });
    });
    return pos;
  }, [phases, dateToPx]);

  if (!mounted) return <div className="h-[600px] bg-slate-50 rounded-[40px] animate-pulse" />;

  const todayOffset = dateToPx(new Date());

  return (
    <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-[800px] relative font-sans select-none">
      {/* Top Toolbar */}
      <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white shrink-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(["day", "week", "month"] as ZoomLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setZoom(level)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${zoom === level ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                {level}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-slate-100 mx-2" />
          <button
            onClick={() => {
              const today = new Date();
              gridRef.current?.scrollTo({ left: dateToPx(today) - gridRef.current.clientWidth / 2, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all border border-slate-100"
          >
            <Target className="w-3.5 h-3.5" />
            Today
          </button>
        </div>

        {showFilter && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                placeholder="Search tasks..."
                className="bg-transparent border-none text-[10px] font-bold text-slate-700 outline-none w-32 placeholder:text-slate-300"
                value={internalSearch}
                onChange={(e) => setInternalSearch(e.target.value)}
              />
              {internalSearch && (
                <button onClick={() => setInternalSearch("")}>
                  <X className="w-2.5 h-2.5 text-slate-300 hover:text-slate-500" />
                </button>
              )}
            </div>

            <div className="relative">
              <select
                value={internalStatus}
                onChange={(e) => setInternalStatus(e.target.value as any)}
                className="appearance-none bg-slate-50 border border-slate-100 rounded-xl pl-3 pr-8 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="all">Status</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
                <option value="critical">Critical</option>
              </select>
              <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-slate-400 pointer-events-none" />
            </div>

            <button className="bg-slate-900 text-white px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2">
              <Plus className="w-3 h-3" />
              Add Task
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar: Task Names */}
        <div className="w-72 border-r border-slate-100 flex flex-col shrink-0 z-40 bg-white shadow-[10px_0_30px_-15px_rgba(0,0,0,0.05)]">
          <div className="h-12 border-b border-slate-100 flex items-center px-6 bg-slate-50/50">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workstream / Task</span>
          </div>
          <div
            ref={sidebarRef}
            className="flex-1 overflow-hidden no-scrollbar bg-white"
            onScroll={syncScroll}
          >
            {filteredPhases.map(phase => (
              <div key={phase.id}>
                {/* Phase Row */}
                <div className="h-12 flex items-center px-6 bg-slate-50/80 border-b border-slate-100/50 group sticky left-0 z-20">
                  <div
                    className={`w-2 h-2 rounded-full mr-3 shadow-sm ${phase.color?.includes('bg-') ? phase.color : ''}`}
                    style={{ backgroundColor: phase.color?.includes('bg-') ? undefined : (phase.color || '#3b82f6') }}
                  />
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest truncate">{phase.name}</span>
                </div>
                {/* Task Rows */}
                {phase.tasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => { setSelectedTask(task); setIsPanelOpen(true); }}
                    className={`h-12 flex items-center px-6 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group ${selectedTask?.id === task.id ? 'bg-blue-50/50' : ''}`}
                  >
                    <span className="text-[9px] font-black text-slate-400 font-mono w-8 shrink-0">{task.wbs}</span>
                    <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 truncate tracking-tight">{task.name}</span>
                    <button className="ml-auto opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded-md transition-all">
                      <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          {/* Header Axis */}
          <div
            ref={headerRef}
            className="h-12 border-b border-slate-100 bg-slate-50/50 flex overflow-hidden shrink-0 border-r border-transparent"
          >
            <div className="relative h-full" style={{ width: totalDays * (colWidth / (zoom === 'day' ? 1 : zoom === 'week' ? 7 : 30)) }}>
              {zoom === 'day' && eachDayOfInterval({ start: chartStart, end: chartEnd }).map((day, i) => (
                <div
                  key={i}
                  className={`absolute h-full border-r border-slate-100 flex flex-col items-center justify-center ${day.getDay() === 0 || day.getDay() === 6 ? 'bg-slate-100/30' : ''}`}
                  style={{ left: i * colWidth, width: colWidth }}
                >
                  <span className={`text-[8px] font-black uppercase mb-0.5 ${isToday(day) ? 'text-blue-600' : 'text-slate-400'}`}>{format(day, "EEE")}</span>
                  <span className={`text-[10px] font-black ${isToday(day) ? 'text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-lg' : 'text-slate-600'}`}>{format(day, "d")}</span>
                </div>
              ))}
              {zoom === 'week' && eachWeekOfInterval({ start: chartStart, end: chartEnd }).map((week, i) => (
                <div
                  key={i}
                  className="absolute h-full border-r border-slate-100 flex flex-col items-center justify-center"
                  style={{ left: i * colWidth, width: colWidth }}
                >
                  <span className="text-[8px] font-black text-slate-400 uppercase mb-0.5">{format(week, "MMM")}</span>
                  <span className="text-[10px] font-black text-slate-600">{format(week, "d")}</span>
                </div>
              ))}
              {zoom === 'month' && eachMonthOfInterval({ start: chartStart, end: chartEnd }).map((month, i) => (
                <div
                  key={i}
                  className="absolute h-full border-r border-slate-100 flex flex-col items-center justify-center bg-white/20"
                  style={{ left: i * colWidth, width: colWidth }}
                >
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{format(month, "MMMM")}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main Grid Body */}
          <div
            ref={gridRef}
            className="flex-1 overflow-auto bg-white relative no-scrollbar"
            onScroll={handleScroll}
          >
            {/* Grid Lines Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="h-full relative" style={{ width: totalDays * (colWidth / (zoom === 'day' ? 1 : zoom === 'week' ? 7 : 30)) }}>
                {/* Vertical lines */}
                {zoom === 'day' && eachDayOfInterval({ start: chartStart, end: chartEnd }).map((day, i) => (
                  <div key={i} className={`absolute inset-y-0 border-r border-slate-50/50 ${(day.getDay() === 0 || day.getDay() === 6) ? 'bg-slate-50/20' : ''}`} style={{ left: i * colWidth, width: colWidth }} />
                ))}
                {/* Today line */}
                <div className="absolute inset-y-0 w-px bg-blue-500/50 z-30" style={{ left: todayOffset }}>
                  <div className="absolute top-0 -left-[4.5px] w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
                </div>
              </div>
            </div>

            <div className="relative z-10" style={{ width: totalDays * (colWidth / (zoom === 'day' ? 1 : zoom === 'week' ? 7 : 30)) }}>
              {/* SVG Dependency Layer */}
              <svg className="absolute inset-0 pointer-events-none z-10" style={{ width: '100%', height: '100%' }}>
                <defs>
                  <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orientation="auto">
                    <path d="M0,0 L6,2 L0,4 Z" fill="#94a3b8" />
                  </marker>
                </defs>
                {allTasks.map(task => {
                  if (!task.blocked_by || task.blocked_by.length === 0) return null;
                  return task.blocked_by.map(blockId => {
                    const from = taskPositions[blockId];
                    const to = taskPositions[task.id];
                    if (!from || !to) return null;

                    // Connector logic: Out from end of 'from' to start of 'to'
                    const x1 = from.x + from.w;
                    const y1 = from.y + 24;
                    const x2 = to.x;
                    const y2 = to.y + 24;

                    const cp1x = x1 + Math.abs(x2 - x1) * 0.5;
                    const cp2x = x2 - Math.abs(x2 - x1) * 0.5;

                    return (
                      <path
                        key={`${task.id}-${blockId}`}
                        d={`M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`}
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="1.5"
                        strokeDasharray={from.y > to.y ? "4,4" : "0"}
                        markerEnd="url(#arrowhead)"
                        className="opacity-40"
                      />
                    );
                  });
                })}
              </svg>

              {filteredPhases.map(phase => (
                <div key={phase.id}>
                  {/* Phase Row Background */}
                  <div className="h-12 bg-slate-50/20 border-b border-slate-50" />
                  {/* Task Bars */}
                  {phase.tasks.map(task => {
                    if (!task.start_date || !task.end_date) return <div key={task.id} className="h-12 border-b border-slate-50" />;

                    const left = dateToPx(new Date(task.start_date));
                    const width = dateToPx(addDays(new Date(task.end_date), 1)) - left;
                    const theme = STATUS_THEMES[task.status] || STATUS_THEMES.not_started;

                    return (
                      <div
                        key={task.id}
                        className="h-12 border-b border-slate-50 relative group/row hover:bg-slate-50/30 transition-colors"
                      >
                        <motion.div
                          layoutId={`bar-${task.id}`}
                          onMouseDown={(e) => handleDragStart(e, task, 'move')}
                          className={`absolute top-2.5 bottom-2.5 rounded-lg border-2 shadow-sm flex items-center px-4 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md z-20 ${theme.bg} ${theme.border} ${theme.text}`}
                          style={{ left, width: Math.max(width, 24) }}
                        >
                          {/* Resize handles */}
                          <div
                            onMouseDown={(e) => handleDragStart(e, task, 'resize-start')}
                            className="absolute left-0 top-0 bottom-0 w-1.5 hover:w-2.5 cursor-ew-resize rounded-l-lg transition-all hover:bg-white/30 z-30"
                          />
                          <div
                            onMouseDown={(e) => handleDragStart(e, task, 'resize-end')}
                            className="absolute right-0 top-0 bottom-0 w-1.5 hover:w-2.5 cursor-ew-resize rounded-r-lg transition-all hover:bg-white/30 z-30"
                          />

                          <span className="text-[10px] font-black truncate uppercase tracking-tighter opacity-90 select-none">
                            {width > 80 ? task.name : ''}
                          </span>

                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl opacity-0 group-hover/row:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-2xl z-50">
                            {format(new Date(task.start_date), "MMM d")} — {format(new Date(task.end_date), "MMM d")}
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <TaskSidePanel
        task={selectedTask}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
}

