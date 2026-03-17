"use client";

import type { Plan } from "@/lib/types";
import { format, differenceInDays, startOfMonth, addDays } from "date-fns";

import { useRef, useEffect } from "react";

export default function TimelineView({ plan }: { plan: Plan }) {
    const scrollRef = useRef<HTMLDivElement>(null);
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

    useEffect(() => {
        if (scrollRef.current) {
            const today = new Date();
            const todayOffset = (differenceInDays(today, chartStart) / totalDays) * scrollRef.current.scrollWidth;
            const containerWidth = scrollRef.current.clientWidth;
            scrollRef.current.scrollLeft = todayOffset - containerWidth / 3;
        }
    }, [chartStart, totalDays]);

    return (
        <div 
            ref={scrollRef}
            className="bg-surface rounded-[40px] border border-border-subtle p-10 shadow-premium overflow-x-auto relative scroll-smooth"
        >
            {/* Subtle mesh background */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
            
            <div className="min-w-[1000px] relative">
                {/* Timeline Header */}
                <div className="flex mb-12 border-b border-border-subtle pb-6 sticky top-0 bg-surface/80 backdrop-blur-xl z-20">
                    <div className="w-64 flex-shrink-0">
                        <span className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">Operational Flow</span>
                    </div>
                    <div className="flex-1 relative flex">
                        {days.filter((_, i) => i % 7 === 0).map(d => (
                            <div
                                key={d.toISOString()}
                                className="absolute text-[10px] font-black text-muted uppercase tracking-[0.2em]"
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
                                className="w-[1px] bg-border-subtle h-full"
                                style={{ position: 'absolute', left: `${(differenceInDays(d, chartStart) / totalDays) * 100}%` }}
                            />
                        ))}
                    </div>

                    <div className="space-y-10 relative">
                        {tasks.map(task => {
                            const barStart = differenceInDays(new Date(task.start_date!), chartStart);
                            const barDuration = differenceInDays(new Date(task.end_date!), new Date(task.start_date!)) + 1;
                            
                            const colorClass = 
                                task.status === 'completed' ? 'bg-accent-success shadow-[0_0_12px_rgba(34,197,94,0.3)]' :
                                task.status === 'in_progress' ? 'bg-accent-primary shadow-[0_0_12px_rgba(20,184,166,0.3)]' :
                                task.status === 'critical' ? 'bg-accent-secondary shadow-[0_0_12px_rgba(219,39,119,0.3)]' :
                                'bg-slate-700 shadow-none';

                            return (
                                <div key={task.id} className="flex items-center group/item transition-all duration-300">
                                    <div className="w-64 flex-shrink-0 pr-10">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-accent-primary/50 font-mono mb-1 tracking-widest">{task.wbs}</span>
                                            <span className="text-sm font-bold text-secondary group-hover/item:text-contrast transition-colors truncate tracking-tight">
                                                {task.name}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 relative h-2.5">
                                        <div
                                            className={`absolute h-full rounded-full transition-all duration-500 cursor-help group-hover/item:h-4 group-hover/item:-top-0.5 group-hover/item:brightness-110 ${colorClass}`}
                                            style={{
                                                left: `${(barStart / totalDays) * 100}%`,
                                                width: `${(barDuration / totalDays) * 100}%`
                                            }}
                                        >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-background-secondary border border-border-medium text-contrast text-[10px] font-medium px-3 py-1.5 rounded-xl opacity-0 group-hover/item:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-30 shadow-premium scale-90 group-hover/item:scale-100 backdrop-blur-md">
                                                {format(new Date(task.start_date!), "MMM d")} — {format(new Date(task.end_date!), "MMM d")}
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
                <div className="py-32 text-center bg-surface border border-dashed border-border-subtle rounded-3xl mx-4">
                    <p className="text-xs font-medium text-muted mb-3">No tasks scheduled</p>
                    <p className="text-sm text-muted">Set start and end dates on tasks to see them here.</p>
                </div>
            )}
        </div>
    );
}
