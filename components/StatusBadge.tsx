"use client";

import { useTransition } from "react";
import { updateStatus } from "@/app/actions";
import { toast } from "sonner";
import type { TaskStatus } from "@/lib/types";

const STATUS_CYCLE: TaskStatus[] = [
  "not_started",
  "in_progress",
  "completed",
  "blocked",
  "critical",
  "not_applicable",
];

const CONFIG: Record<TaskStatus, { label: string; bg: string; text: string; dot: string }> = {
  not_started: { label: "Not Started", bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" },
  in_progress: { label: "In Progress", bg: "bg-brand-blue/10", text: "text-brand-blue", dot: "bg-brand-blue" },
  completed: { label: "Completed", bg: "bg-emerald-500/10", text: "text-emerald-700", dot: "bg-emerald-500" },
  blocked: { label: "Blocked", bg: "bg-brand-pink/10", text: "text-brand-pink", dot: "bg-brand-pink" },
  critical: { label: "Critical", bg: "bg-red-500/10", text: "text-red-700", dot: "bg-red-500" },
  not_applicable: { label: "N/A", bg: "bg-slate-50", text: "text-slate-400", dot: "bg-slate-200" },
};

interface Props {
  taskId: string;
  status: TaskStatus;
  planType: string;
  readonly?: boolean;
}

export default function StatusBadge({ taskId, status, planType, readonly }: Props) {
  const [pending, startTransition] = useTransition();
  const cfg = CONFIG[status] ?? CONFIG.not_started;

  function cycle() {
    if (readonly) return;
    const idx = STATUS_CYCLE.indexOf(status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    startTransition(async () => {
      try {
        await updateStatus(taskId, next, planType);
        toast.success(`Status updated to ${CONFIG[next].label}`);
      } catch (err) {
        toast.error("Failed to update status");
      }
    });
  }

  return (
    <button
      onClick={cycle}
      disabled={pending || readonly}
      title={readonly ? cfg.label : `Click to change status (currently: ${cfg.label})`}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider
        ${cfg.bg} ${cfg.text}
        ${readonly ? "cursor-default" : "cursor-pointer hover:scale-105 active:scale-95 shadow-sm"}
        transition-all duration-200 ${pending ? "opacity-50" : ""}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${pending ? "animate-pulse" : ""}`} />
      {cfg.label}
    </button>
  );
}
