"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createTask, deletePhase } from "@/lib/queries";
import { useRouter } from "next/navigation";
import type { Phase, Task } from "@/lib/types";
import PhaseProgress from "./PhaseProgress";
import TaskRow from "./TaskRow";
import ConfirmModal from "./ConfirmModal";

export default function PhaseCard({ phase, planType, allTasks }: { phase: Phase; planType: string; allTasks: Task[] }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(true);
  const hasTasks = phase.tasks.length > 0;

  async function handleDelete() {
    try {
      await deletePhase(phase.id);
      toast.success("Milestone deleted");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete milestone.");
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Confirm deletion */}
      <ConfirmModal
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onConfirm={handleDelete}
        title="Delete Milestone?"
        message={`Are you sure you want to delete "${phase.name}"? This will also remove all ${phase.tasks.length} tasks within it. This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />

      {/* Phase header */}
      <div
        role="button"
        tabIndex={0}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50/50 transition-colors text-left cursor-pointer outline-none focus:bg-slate-50/80"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
      >
        <span
          className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-sm`}
          style={{ backgroundColor: "#1A3A5C" }}
        >
          {phase.wbs}
        </span>
        <span className="flex-1 font-bold text-slate-900 text-sm tracking-tight">{phase.name}</span>

        {hasTasks && (
          <div className="flex-1 max-w-xs hidden md:block">
            <PhaseProgress tasks={phase.tasks} />
          </div>
        )}

        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-2 shrink-0">{phase.tasks.length} tasks</span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsDeleting(true);
          }}
          className="ml-2 p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors focus:ring-1 focus:ring-red-500 outline-none"
          title="Delete Milestone"
        >
          <span className="text-[14px]">🗑️</span>
        </button>

        <span className={`text-slate-300 text-xs shrink-0 transition-transform ml-2 ${open ? "rotate-90" : ""}`}>
          ▶
        </span>
      </div>

      {/* Mobile progress */}
      {open && hasTasks && (
        <div className="px-5 pb-3 md:hidden">
          <PhaseProgress tasks={phase.tasks} />
        </div>
      )}

      {/* Tasks */}
      {open && (
        <div className="border-t border-slate-50">
          {phase.tasks.map((task) => (
            <TaskRow key={task.id} task={task} planType={planType} allTasks={allTasks} />
          ))}

          {/* Add Task UI */}
          <AddTaskInline phaseId={phase.id} phaseWbs={phase.wbs} taskCount={phase.tasks.length} onCancel={() => { }} />
        </div>
      )}
    </div>
  );
}

import AddTaskInline from "./AddTaskInline";
