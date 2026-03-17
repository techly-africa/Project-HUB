"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import type { Phase, Task } from "@/lib/types";
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
  differenceInMonths
} from "date-fns";
import TaskSidePanel from "./TaskSidePanel";

type ZoomLevel = "day" | "week" | "month";

interface GanttChartProps {
  phases: (Phase & { type?: string })[];
}

const COLUMN_WIDTHS: Record<ZoomLevel, number> = {
  day: 40,
  week: 100,
  month: 150
};

const STATUS_COLORS: Record<string, { bg: string; border: string; dot: string }> = {
  not_started: { bg: "bg-slate-800/10", border: "border-slate-800", dot: "bg-slate-800" },
  in_progress: { bg: "bg-accent-primary/10", border: "border-accent-primary/40", dot: "bg-accent-primary" },
  completed: { bg: "bg-accent-success/10", border: "border-accent-success/40", dot: "bg-accent-success" },
  blocked: { bg: "bg-accent-secondary/10", border: "border-accent-secondary/40", dot: "bg-accent-secondary" },
  critical: { bg: "bg-accent-secondary/20", border: "border-accent-secondary", dot: "bg-accent-secondary" },
};

export default function GanttChart({ phases }: GanttChartProps) {
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState<ZoomLevel>("day");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const allTasks = useMemo(() => phases.flatMap(p => p.tasks), [phases]);

  // Determine chart range
  const { chartStart, chartEnd, totalDays, totalWeeks, totalMonths } = useMemo(() => {
    const dates = allTasks
      .flatMap(t => [t.start_date, t.end_date])
      .filter(Boolean)
      .map(d => new Date(d!));

    const today = new Date();
    const start = dates.length ? new Date(Math.min(...dates.map(d => d.getTime()), startOfMonth(today).getTime())) : startOfMonth(today);
    const end = dates.length ? new Date(Math.max(...dates.map(d => d.getTime()), endOfMonth(addDays(today, 90)).getTime())) : endOfMonth(addDays(today, 90));

    const cStart = startOfMonth(start);
    const cEnd = endOfMonth(addDays(end, 30));

    return {
      chartStart: cStart,
      chartEnd: cEnd,
      totalDays: differenceInDays(cEnd, cStart) + 1,
      totalWeeks: differenceInWeeks(cEnd, cStart) + 1,
      totalMonths: differenceInMonths(cEnd, cStart) + 1
    };
  }, [allTasks]);

  // Flatten phases and tasks for virtualization
  const flattenedItems = useMemo(() => {
    const items: ({ type: "phase"; data: Phase & { workstreamType?: string } } | { type: "task"; data: Task & { phaseName: string } })[] = [];
    phases.forEach(phase => {
      items.push({ type: "phase", data: { ...phase, workstreamType: phase.type } });
      phase.tasks.forEach(task => {
        items.push({ type: "task", data: { ...task, phaseName: phase.name } });
      });
    });
    return items;
  }, [phases]);

  const colWidth = COLUMN_WIDTHS[zoom];

  const getTimelineScale = () => {
    if (zoom === "day") return totalDays;
    if (zoom === "week") return totalWeeks;
    return totalMonths;
  };

  const timelineScale = getTimelineScale();

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (headerRef.current) {
      headerRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  useEffect(() => {
    if (mounted && gridRef.current) {
      const today = new Date();
      let offset = 0;
      
      if (zoom === "day") {
        offset = differenceInDays(today, chartStart) * colWidth;
      } else if (zoom === "week") {
        offset = (differenceInDays(today, chartStart) / 7) * colWidth;
      } else {
        offset = (differenceInDays(today, chartStart) / 30.44) * colWidth;
      }

      const containerWidth = gridRef.current.clientWidth;
      gridRef.current.scrollLeft = offset - containerWidth / 3;
    }
  }, [mounted, zoom, chartStart, colWidth]);

  const openTask = (t: Task) => {
    setSelectedTask(t);
    setIsPanelOpen(true);
  };

  if (!mounted) return <div className="h-[600px] bg-surface-elevated rounded-[40px] animate-pulse" />;

  const Row = ({ index }: { index: number }) => {
    const item = flattenedItems[index];

    const rowWidth = 256 + timelineScale * colWidth;

    if (item.type === "phase") {
      return (
        <div className="flex border-b border-border-subtle bg-surface-elevated" style={{ width: rowWidth }}>
          <div className="w-64 flex-shrink-0 p-4 flex items-center gap-3 border-r border-border-subtle sticky left-0 bg-surface/90 backdrop-blur-xl z-20">
            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${item.data.workstreamType === 'Product & Tech' ? 'text-accent-primary bg-accent-primary' :
              item.data.workstreamType === 'Legal' ? 'text-accent-warning bg-accent-warning' : 'text-accent-secondary bg-accent-secondary'
              }`} />
            <span className="text-[10px] font-black text-white truncate uppercase tracking-widest">{item.data.name}</span>
          </div>
          <div className="flex-shrink-0 relative" style={{ width: timelineScale * colWidth }} />
        </div>
      );
    }

    const task = item.data;
    if (!task.start_date || !task.end_date) {
      return (
        <div className="flex border-b border-border-subtle hover:bg-surface-elevated transition-colors" style={{ width: rowWidth }}>
          <div className="w-64 flex-shrink-0 p-4 pl-10 flex items-center border-r border-border-subtle sticky left-0 bg-surface/80 backdrop-blur-md z-20">
            <span className="text-xs font-bold text-muted italic">Schedule Pending</span>
          </div>
          <div className="flex-shrink-0 relative" style={{ width: timelineScale * colWidth }} />
        </div>
      );
    }

    const tStart = new Date(task.start_date);
    const tEnd = new Date(task.end_date);
    const isMilestone = isSameDay(tStart, tEnd);
    const duration = differenceInDays(tEnd, tStart) + 1;

    // Exact positioning logic
    let left = 0;
    let width = 0;

    if (zoom === "day") {
      left = differenceInDays(tStart, chartStart) * colWidth;
      width = duration * colWidth;
    } else if (zoom === "week") {
      left = (differenceInDays(tStart, chartStart) / 7) * colWidth;
      width = (duration / 7) * colWidth;
    } else {
      left = (differenceInDays(tStart, chartStart) / 30.44) * colWidth;
      width = (duration / 30.44) * colWidth;
    }

    const statusStyle = STATUS_COLORS[task.status] || STATUS_COLORS.not_started;

    return (
      <div className="flex border-b border-border-subtle hover:bg-surface-elevated transition-colors group" style={{ width: rowWidth }}>
        <div
          className="w-64 flex-shrink-0 p-4 pl-10 flex items-center border-r border-border-subtle cursor-pointer sticky left-0 bg-surface group-hover:bg-surface-elevated z-20 transition-colors shadow-[8px_0_16px_-8px_rgba(0,0,0,0.5)]"
          onClick={() => openTask(task)}
        >
          <span className="text-[12px] font-bold text-secondary truncate tracking-tight">{task.name}</span>
        </div>

        <div className="flex-shrink-0 relative" style={{ width: timelineScale * colWidth }}>
          {isMilestone ? (
            <div
              onClick={() => openTask(task)}
              className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rotate-45 border-2 cursor-pointer z-10 hover:scale-125 transition-transform ${statusStyle.bg} ${statusStyle.border}`}
              style={{ left: left + (colWidth / 2) - 8 }}
              title={`${task.name} (Milestone: ${format(tStart, "MMM d")})`}
            />
          ) : (
            <div
              onClick={() => openTask(task)}
              className={`absolute top-1/2 -translate-y-1/2 h-5 rounded-full border-2 shadow-lg transition-all cursor-pointer flex items-center px-3 z-10 hover:brightness-110 hover:scale-y-110
                ${statusStyle.bg} ${statusStyle.border}
              `}
              style={{ left: left + 6, width: Math.max(width - 12, 24) }}
            >
              <span className="text-[9px] font-black uppercase tracking-tighter truncate text-white opacity-80">
                {duration > 5 ? task.name : ''}
              </span>

              {/* Enhanced Tooltip */}
              <div className="absolute opacity-0 group-hover:opacity-100 bg-surface border border-border-medium p-5 rounded-3xl text-[10px] z-[100] pointer-events-none transition-all duration-300 shadow-premium w-72 -top-40 left-1/2 -translate-x-1/2 backdrop-blur-2xl scale-95 group-hover:scale-100">
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <p className="font-semibold text-sm text-contrast leading-tight">{task.name}</p>
                    <span className={`text-[10px] font-medium px-2.5 py-1 rounded-lg border ${statusStyle.bg} ${statusStyle.border} text-white`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-6 border-t border-border-subtle pt-4">
                    <div>
                      <p className="text-muted text-xs mb-1">Timeline</p>
                      <p className="text-contrast font-semibold text-xs">{format(tStart, "MMM d")} — {format(tEnd, "MMM d")}</p>
                    </div>
                    <div>
                      <p className="text-muted text-xs mb-1">Duration</p>
                      <p className="text-contrast font-semibold text-xs">{duration} Days</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-t border-border-subtle pt-4">
                    <div className="w-6 h-6 rounded-full bg-accent-primary/20 flex items-center justify-center text-[10px] font-semibold text-accent-primary border border-accent-primary/20">
                      {task.owner?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-contrast font-semibold text-xs">{task.owner}</p>
                      <p className="text-xs text-muted">Owner</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderHeader = () => {
    const headerItems = [];
    if (zoom === "day") {
      for (let i = 0; i < totalDays; i++) {
        const day = addDays(chartStart, i);
        const isFirst = day.getDate() === 1 || i === 0;
        headerItems.push(
          <div key={i} className={`flex-shrink-0 h-14 border-r border-border-subtle flex flex-col items-center justify-center relative ${day.getDay() === 1 ? 'bg-surface-elevated' : ''}`} style={{ width: colWidth }}>
            {isFirst && (
              <span className="absolute top-1 left-2 text-[10px] font-semibold text-accent-primary bg-surface-elevated border border-border-subtle px-1.5 py-0.5 shadow-sm rounded-md z-10 whitespace-nowrap">
                {format(day, "MMMM yyyy")}
              </span>
            )}
            <span className={`text-[10px] font-black ${isToday(day) ? 'text-accent-secondary' : 'text-slate-500'}`}>
              {format(day, "d")}
            </span>
            <span className="text-[7px] text-muted uppercase font-black opacity-30">{format(day, "EE").charAt(0)}</span>
            {isToday(day) && <div className="absolute bottom-0 w-full h-0.5 bg-accent-secondary shadow-[0_0_8px_rgba(219,39,119,0.5)]" />}
          </div>
        );
      }
    } else if (zoom === "week") {
      for (let i = 0; i < totalWeeks; i++) {
        const week = addWeeks(chartStart, i);
        headerItems.push(
          <div key={i} className="flex-shrink-0 h-14 border-r border-border-subtle flex flex-col items-center justify-center relative px-2 bg-transparent" style={{ width: colWidth }}>
            <span className="text-[9px] font-black text-muted uppercase tracking-tighter mb-0.5">
              Week {format(week, "w")}
            </span>
            <span className="text-[10px] font-bold text-white">
              {format(week, "MMM d")}
            </span>
          </div>
        );
      }
    } else {
      const months = eachMonthOfInterval({ start: chartStart, end: chartEnd });
      months.forEach((month, i) => {
        headerItems.push(
          <div key={i} className="flex-shrink-0 h-14 border-r border-border-subtle flex flex-col items-center justify-center bg-transparent" style={{ width: colWidth }}>
            <span className="text-[12px] font-black text-accent-primary uppercase tracking-widest">{format(month, "MMM")}</span>
            <span className="text-[9px] font-black text-muted tracking-widest">{format(month, "yyyy")}</span>
          </div>
        );
      });
    }
    return headerItems;
  };

  return (
    <div className="bg-surface rounded-[40px] border border-border-subtle shadow-premium overflow-hidden flex flex-col h-[750px] group/gantt relative">
      {/* Header Axis */}
      <div className="flex border-b border-border-subtle bg-surface flex-shrink-0">
        <div className="w-64 flex-shrink-0 border-r border-border-subtle p-8 flex flex-col justify-center z-30 bg-surface/95 backdrop-blur-md">
          <p className="text-[9px] font-black text-accent-primary uppercase tracking-[0.3em] mb-1 leading-none">System Telemetry</p>
          <h4 className="text-[12px] font-black text-white uppercase tracking-[0.1em] leading-none">Strategy Matrix</h4>
        </div>
        <div ref={headerRef} className="flex-1 overflow-x-hidden relative scroll-smooth no-scrollbar">
          <div className="flex h-14" style={{ width: timelineScale * colWidth }}>
            {renderHeader()}
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2 px-6 border-l border-border-subtle bg-surface/95">
          {(["day", "week", "month"] as ZoomLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => setZoom(level)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${zoom === level
                ? "bg-accent-primary text-[#020617] shadow-[0_0_12px_rgba(20,184,166,0.3)]"
                : "text-muted hover:text-contrast hover:bg-surface-elevated"
                }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div 
        ref={gridRef}
        className="flex-1 overflow-auto no-scrollbar scroll-smooth relative" 
        onScroll={handleScroll}
      >
        {/* Subtle mesh overlay */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        
        <div className="relative z-10">
          {flattenedItems.map((_, index) => (
            <Row key={index} index={index} />
          ))}
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
