"use client";

import type { Plan } from "@/lib/types";
import GanttChart from "./GanttChart";

export default function TimelineView({ plan }: { plan: Plan }) {
    // Map phases to include the plan's color and type for the Gantt engine
    const phasesWithMeta = plan.phases.map(p => ({
        ...p,
        type: plan.name,
        color: plan.color
    }));

    return (
        <div className="min-h-[600px] w-full">
            <GanttChart phases={phasesWithMeta} showFilter={false} />
        </div>
    );
}
