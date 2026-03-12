"use client";

import { useState, useEffect } from "react";
import type { Phase, Task } from "@/lib/types";
import { format, differenceInDays, startOfMonth, addDays, isToday } from "date-fns";

interface GanttChartProps {
  phases: (Phase & { type?: string })[];
}

export default function GanttChart({ phases }: GanttChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const allTasks = phases.flatMap(p => p.tasks);

  // Find project bounds from task dates
  const dates = allTasks
    .flatMap(t => [t.start_date, t.end_date])
    .filter(Boolean)
    .map(d => new Date(d!));

  // Determine chart range: at least from current month to end of year, or covering all tasks
  const today = new Date();
  const currentYearStart = startOfMonth(new Date(today.getFullYear(), 0, 1));
  const currentYearEnd = addDays(startOfMonth(new Date(today.getFullYear(), 11, 1)), 31);

  const start = dates.length ? new Date(Math.min(...dates.map(d => d.getTime()), currentYearStart.getTime())) : currentYearStart;
  const end = dates.length ? new Date(Math.max(...dates.map(d => d.getTime()), currentYearEnd.getTime())) : currentYearEnd;

  // Add padding
  const chartStart = startOfMonth(start);
  const totalDays = differenceInDays(end, chartStart) + 30; // 30 days padding at the end
  const days = Array.from({ length: totalDays }, (_, i) => addDays(chartStart, i));

  const dayWidth = 40;

  if (!mounted) return <div className="h-[600px] bg-slate-50/50 rounded-[32px] animate-pulse" />;

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden flex flex-col h-[600px]">
      {/* Header / Timeline Axis */}
      <div className="flex border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
        <div className="w-64 border-r border-slate-100 p-4 font-black text-[10px] text-slate-400 uppercase tracking-widest flex items-center">
          Workstream / Milestone
        </div>
        <div className="flex-1 overflow-x-auto no-scrollbar relative">
          <div className="flex" style={{ width: totalDays * dayWidth }}>
            {days.map((day, i) => {
              const isFirst = day.getDate() === 1;
              const isStartOffset = i === 0;
              const isMon = day.getDay() === 1;
              return (
                <div key={i} className={`flex-shrink-0 h-10 border-r border-slate-100/50 flex flex-col items-center justify-center relative ${isMon ? 'bg-slate-100/30' : ''}`} style={{ width: dayWidth }}>
                  {(isFirst || isStartOffset) && (
                    <span className="absolute -top-1 left-1 text-[8px] font-black text-brand-blue uppercase bg-white px-1 shadow-sm rounded z-10 whitespace-nowrap">
                      {format(day, "MMMM yyyy")}
                    </span>
                  )}
                  <span className={`text-[9px] font-bold ${isToday(day) ? 'text-brand-pink' : 'text-slate-400'}`}>
                    {format(day, "d")}
                  </span>
                  <span className="text-[7px] text-slate-300 uppercase font-black">{format(day, "EE").charAt(0)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto no-scrollbar flex">
        {/* Left Labels */}
        <div className="w-64 border-r border-slate-100 flex-shrink-0 bg-white z-10">
          {phases.map(phase => (
            <div key={phase.id} className="border-b border-slate-50">
              <div className="bg-slate-50/30 p-3 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${phase.type === 'Product & Tech' ? 'bg-brand-blue' :
                  phase.type === 'Legal' ? 'bg-amber-500' :
                    'bg-brand-pink'
                  }`} />
                <span className="text-[10px] font-black text-slate-900 truncate uppercase tracking-tight">{phase.name}</span>
              </div>
              {phase.tasks.map(task => (
                <div key={task.id} className="p-3 pl-8 h-10 flex items-center border-t border-slate-50 hover:bg-slate-50 transition-colors">
                  <span className="text-[11px] font-medium text-slate-600 truncate group">{task.name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Right Grid / Bars */}
        <div className="flex-1 overflow-x-auto relative bg-slate-50/[0.15]">
          <div className="relative h-full" style={{ width: totalDays * dayWidth }}>
            {/* Vertical Grid Lines */}
            <div className="absolute inset-y-0 left-0 right-0 flex pointer-events-none">
              {days.map((day, i) => (
                <div key={i} className={`h-full border-r border-slate-100/30 ${isToday(day) ? 'bg-brand-pink/[0.03] border-brand-pink/20' : ''}`} style={{ width: dayWidth }} />
              ))}
            </div>

            {/* Bars */}
            <div className="relative">
              {phases.map(phase => (
                <div key={phase.id}>
                  <div className="h-10 border-b border-slate-50" /> {/* Spacer for phase header */}
                  {phase.tasks.map(task => {
                    if (!task.start_date || !task.end_date) return <div key={task.id} className="h-10 border-b border-slate-50" />;

                    const barStart = differenceInDays(new Date(task.start_date), chartStart);
                    const barDuration = differenceInDays(new Date(task.end_date), new Date(task.start_date)) + 1;
                    const isComplete = task.status === 'completed';
                    const isCritical = task.status === 'critical';
                    const isBlocked = task.status === 'blocked' || (task.blocked_by && task.blocked_by.length > 0);

                    return (
                      <div key={task.id} className="h-10 flex items-center border-b border-slate-50 relative group">
                        <div
                          className={`absolute h-5 rounded-lg border shadow-sm transition-all hover:h-6 group-hover:z-20 cursor-pointer flex items-center px-2
                              ${isBlocked ? 'bg-red-500/20 border-red-500 text-red-700' :
                              isComplete ? 'bg-emerald-400/20 border-emerald-400 text-emerald-700' :
                                isCritical ? 'bg-red-500/20 border-red-500 text-red-700' :
                                  'bg-brand-blue/10 border-brand-blue text-brand-blue'}`}
                          style={{
                            left: barStart * dayWidth + 4,
                            width: barDuration * dayWidth - 8
                          }}
                        >
                          <span className="text-[8px] font-black uppercase tracking-tighter truncate">
                            {isBlocked ? 'BLOCKED' : task.status.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Tooltip on hover */}
                        <div className="absolute opacity-0 group-hover:opacity-100 bg-slate-900 text-white p-3 rounded-xl text-[10px] z-30 pointer-events-none transition-opacity shadow-xl max-w-[240px]"
                          style={{ left: (barStart + barDuration / 2) * dayWidth, top: -20 }}
                        >
                          <p className="font-bold text-white leading-snug mb-1">{task.name}</p>
                          <p className="text-slate-400 mb-1">{format(new Date(task.start_date), "MMM d")} – {format(new Date(task.end_date), "MMM d")}</p>
                          {task.description && (
                            <p className="text-slate-300 leading-relaxed border-t border-slate-700 pt-1 mt-1 whitespace-normal">{task.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
