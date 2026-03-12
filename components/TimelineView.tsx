"use client";

import type { Plan } from "@/lib/types";
import { format, differenceInDays, startOfMonth, addDays } from "date-fns";

export default function TimelineView({ plan }: { plan: Plan }) {
    const tasks = plan.phases.flatMap(ph => ph.tasks).filter(t => t.start_date !== null && t.end_date !== null);

    // Find project bounds
    const dates = tasks
        .flatMap(t => [t.start_date, t.end_date])
        .filter(Boolean)
        .map(d => new Date(d!));

    const start = dates.length ? new Date(Math.min(...dates.map(d => d.getTime()))) : new Date();
    const end = dates.length ? addDays(new Date(Math.max(...dates.map(d => d.getTime()))), 7) : addDays(new Date(), 30);

    const chartStart = startOfMonth(start);
    const totalDays = Math.max(differenceInDays(end, chartStart) + 1, 30);
    const days = Array.from({ length: totalDays }, (_, i) => addDays(chartStart, i));

    return (
        <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-x-auto">
            <div className="min-w-[1000px]">
                {/* Timeline Header */}
                <div className="flex mb-8 border-b border-slate-50 pb-4 sticky top-0 bg-white z-10">
                    <div className="w-64 flex-shrink-0">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Activity</span>
                    </div>
                    <div className="flex-1 relative flex">
                        {days.filter((_, i) => i % 7 === 0).map(d => (
                            <div
                                key={d.toISOString()}
                                className="absolute text-[9px] font-black text-slate-300 uppercase tracking-widest"
                                style={{ left: `${(differenceInDays(d, chartStart) / totalDays) * 100}%` }}
                            >
                                {format(d, "MMM d")}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline Body */}
                <div className="relative">
                    {/* Vertical Grid Lines */}
                    <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none flex justify-between px-0 ml-64">
                        {days.filter((_, i) => i % 7 === 0).map(d => (
                            <div
                                key={d.toISOString()}
                                className="w-px bg-slate-50 h-full"
                                style={{ position: 'absolute', left: `${(differenceInDays(d, chartStart) / totalDays) * 100}%` }}
                            />
                        ))}
                    </div>

                    <div className="space-y-6 relative">
                        {tasks.map(task => {
                            const barStart = differenceInDays(new Date(task.start_date!), chartStart);
                            const barDuration = differenceInDays(new Date(task.end_date!), new Date(task.start_date!)) + 1;

                            return (
                                <div key={task.id} className="flex items-center group">
                                    <div className="w-64 flex-shrink-0 pr-6">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-brand-blue/50 font-mono mb-0.5">{task.wbs}</span>
                                            <span className="text-[11px] font-bold text-slate-800 leading-tight group-hover:text-brand-blue transition-colors truncate">
                                                {task.name}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 relative h-4">
                                        <div
                                            className={`absolute h-full rounded-full border-2 border-white shadow-xl transition-all duration-500 cursor-help group-hover:scale-y-125
                          ${task.status === 'completed' ? 'bg-emerald-400 shadow-emerald-400/20' :
                                                    task.status === 'in_progress' ? 'bg-brand-blue shadow-brand-blue/20' :
                                                        task.status === 'critical' ? 'bg-red-500 shadow-red-500/20' :
                                                            'bg-slate-200 shadow-slate-200/20'}`}
                                            style={{
                                                left: `${(barStart / totalDays) * 100}%`,
                                                width: `${(barDuration / totalDays) * 100}%`
                                            }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                                {format(new Date(task.start_date!), "MMM d")} - {format(new Date(task.end_date!), "MMM d")}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {tasks.length === 0 && (
                <div className="py-20 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking widest">No scheduled activities found.</p>
                    <p className="text-xs text-slate-400 mt-2 italic font-medium">Ensure tasks have start and end dates assigned.</p>
                </div>
            )}
        </div>
    );
}
