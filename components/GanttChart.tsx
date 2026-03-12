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

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  not_started: { bg: "bg-slate-100/50", border: "border-slate-300", text: "text-slate-500" },
  in_progress: { bg: "bg-blue-500/10", border: "border-blue-500", text: "text-blue-700" },
  completed: { bg: "bg-emerald-500/10", border: "border-emerald-500", text: "text-emerald-700" },
  blocked: { bg: "bg-red-500/10", border: "border-red-500", text: "text-red-700" },
  critical: { bg: "bg-orange-500/10", border: "border-orange-500", text: "text-orange-700" },
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

  const openTask = (t: Task) => {
    setSelectedTask(t);
    setIsPanelOpen(true);
  };

  if (!mounted) return <div className="h-[600px] bg-slate-50/50 rounded-[32px] animate-pulse" />;

  const Row = ({ index }: { index: number }) => {
    const item = flattenedItems[index];

    const rowWidth = 256 + timelineScale * colWidth;

    if (item.type === "phase") {
      return (
        <div className="flex border-b border-slate-100 bg-slate-50/30" style={{ width: rowWidth }}>
          <div className="w-64 flex-shrink-0 p-3 flex items-center gap-2 border-r border-slate-100 sticky left-0 bg-slate-50/80 backdrop-blur-sm z-20">
            <span className={`w-1.5 h-1.5 rounded-full ${item.data.workstreamType === 'Product & Tech' ? 'bg-brand-blue' :
              item.data.workstreamType === 'Legal' ? 'bg-amber-500' : 'bg-brand-pink'
              }`} />
            <span className="text-[10px] font-black text-slate-900 truncate uppercase tracking-tight">{item.data.name}</span>
          </div>
          <div className="flex-shrink-0 relative" style={{ width: timelineScale * colWidth }} />
        </div>
      );
    }

    const task = item.data;
    if (!task.start_date || !task.end_date) {
      return (
        <div className="flex border-b border-slate-100 hover:bg-slate-50 transition-colors" style={{ width: rowWidth }}>
          <div className="w-64 flex-shrink-0 p-3 pl-8 flex items-center border-r border-slate-100 sticky left-0 bg-white/80 backdrop-blur-sm z-20">
            <span className="text-[11px] font-medium text-slate-400 italic">No dates set</span>
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
      // Month scale positioning is approximate but visually correct for long roadmaps
      left = (differenceInDays(tStart, chartStart) / 30.44) * colWidth;
      width = (duration / 30.44) * colWidth;
    }

    const statusStyle = STATUS_COLORS[task.status] || STATUS_COLORS.not_started;

    return (
      <div className="flex border-b border-slate-50 hover:bg-slate-50/50 transition-colors group" style={{ width: rowWidth }}>
        <div
          className="w-64 flex-shrink-0 p-3 pl-8 flex items-center border-r border-slate-100 cursor-pointer sticky left-0 bg-white group-hover:bg-slate-50 z-20 transition-colors shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]"
          onClick={() => openTask(task)}
        >
          <span className="text-[11px] font-bold text-slate-600 truncate">{task.name}</span>
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
              className={`absolute top-1/2 -translate-y-1/2 h-6 rounded-lg border-2 shadow-sm transition-all cursor-pointer flex items-center px-2 z-10 hover:shadow-md 
                ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}
              `}
              style={{ left: left + 4, width: Math.max(width - 8, 20) }}
            >
              <span className="text-[8px] font-black uppercase tracking-tighter truncate">
                {duration > 5 ? task.name : ''}
              </span>

              {/* Enhanced Tooltip */}
              <div className="absolute opacity-0 group-hover:opacity-100 bg-slate-900 text-white p-4 rounded-[20px] text-[10px] z-[100] pointer-events-none transition-opacity shadow-2xl w-64 -top-32 left-1/2 -translate-x-1/2 border border-white/10 backdrop-blur-lg backdrop-saturate-150">
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <p className="font-black text-[13px] text-white leading-tight">{task.name}</p>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border ${statusStyle.bg} ${statusStyle.border}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-3">
                    <div>
                      <p className="text-slate-400 text-[8px] uppercase font-black mb-1">Timeline</p>
                      <p className="text-white font-bold">{format(tStart, "MMM d")} – {format(tEnd, "MMM d")}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[8px] uppercase font-black mb-1">Duration</p>
                      <p className="text-white font-bold">{duration} Days</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t border-white/10 pt-3">
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-black text-slate-300">
                      {task.owner?.charAt(0) || "?"}
                    </div>
                    <span className="text-slate-200 font-bold">{task.owner}</span>
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
          <div key={i} className={`flex-shrink-0 h-14 border-r border-slate-100/50 flex flex-col items-center justify-center relative ${day.getDay() === 1 ? 'bg-slate-100/30' : ''}`} style={{ width: colWidth }}>
            {isFirst && (
              <span className="absolute top-1 left-2 text-[8px] font-black text-brand-blue uppercase bg-white/80 backdrop-blur-sm px-1.5 py-0.5 shadow-sm rounded-md z-10 whitespace-nowrap">
                {format(day, "MMMM yyyy")}
              </span>
            )}
            <span className={`text-[10px] font-black ${isToday(day) ? 'text-brand-pink' : 'text-slate-600'}`}>
              {format(day, "d")}
            </span>
            <span className="text-[7px] text-slate-400 uppercase font-black opacity-50">{format(day, "EE").charAt(0)}</span>
            {isToday(day) && <div className="absolute bottom-0 w-full h-0.5 bg-brand-pink" />}
          </div>
        );
      }
    } else if (zoom === "week") {
      for (let i = 0; i < totalWeeks; i++) {
        const week = addWeeks(chartStart, i);
        headerItems.push(
          <div key={i} className="flex-shrink-0 h-14 border-r border-slate-100/50 flex flex-col items-center justify-center relative px-2 bg-white" style={{ width: colWidth }}>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">
              Week {format(week, "w")}
            </span>
            <span className="text-[10px] font-bold text-slate-900">
              {format(week, "MMM d")}
            </span>
          </div>
        );
      }
    } else {
      const months = eachMonthOfInterval({ start: chartStart, end: chartEnd });
      months.forEach((month, i) => {
        headerItems.push(
          <div key={i} className="flex-shrink-0 h-14 border-r border-slate-100/50 flex flex-col items-center justify-center bg-white" style={{ width: colWidth }}>
            <span className="text-[12px] font-black text-brand-blue uppercase tracking-widest">{format(month, "MMM")}</span>
            <span className="text-[9px] font-bold text-slate-400">{format(month, "yyyy")}</span>
          </div>
        );
      });
    }
    return headerItems;
  };

  return (
    <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/20 overflow-hidden flex flex-col h-[700px] group/gantt relative">
      {/* Header Axis */}
      <div className="flex border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
        <div className="w-64 flex-shrink-0 border-r border-slate-100 p-6 flex flex-col justify-center z-30 bg-slate-50/80 backdrop-blur-md">
          <p className="text-[8px] font-black text-brand-teal uppercase tracking-[0.2em] mb-1">Project Hub</p>
          <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">Strategy & Timeline</h4>
        </div>
        <div ref={headerRef} className="flex-1 overflow-x-hidden relative scroll-smooth no-scrollbar">
          <div className="flex h-14" style={{ width: timelineScale * colWidth }}>
            {renderHeader()}
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-1 px-3 border-l border-slate-100 bg-slate-50/80">
          {(["day", "week", "month"] as ZoomLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => setZoom(level)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${zoom === level
                ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto no-scrollbar" onScroll={handleScroll}>
        {flattenedItems.map((_, index) => (
          <Row key={index} index={index} />
        ))}
      </div>

      <TaskSidePanel
        task={selectedTask}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
}
