"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createTaskStatusAction, updateTaskStatusAction, deleteTaskStatusAction } from "@/app/actions/statuses";
import type { TaskStatusConfig } from "@/lib/types";

interface Props {
  statuses: TaskStatusConfig[];
}

export default function StatusManager({ statuses }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editLabel, setEditLabel]   = useState("");
  const [editColor, setEditColor]   = useState("");

  const [showAdd, setShowAdd]       = useState(false);
  const [newValue, setNewValue]     = useState("");
  const [newLabel, setNewLabel]     = useState("");
  const [newColor, setNewColor]     = useState("#64748b");

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function startEdit(s: TaskStatusConfig) {
    setEditingId(s.id);
    setEditLabel(s.label);
    setEditColor(s.color);
  }

  function handleSave(id: string) {
    if (!editLabel.trim()) return;
    startTransition(async () => {
      try {
        await updateTaskStatusAction(id, { label: editLabel.trim(), color: editColor });
        toast.success("Status updated");
        setEditingId(null);
        router.refresh();
      } catch (err: any) {
        toast.error(err.message ?? "Failed to update status");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteTaskStatusAction(id);
        toast.success("Status deleted");
        setConfirmDelete(null);
        router.refresh();
      } catch (err: any) {
        toast.error(err.message ?? "Failed to delete status");
      }
    });
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newValue.trim() || !newLabel.trim()) return;
    startTransition(async () => {
      try {
        await createTaskStatusAction({
          value: newValue.trim().toLowerCase().replace(/\s+/g, "_"),
          label: newLabel.trim(),
          color: newColor,
          display_order: statuses.length,
        });
        toast.success("Status added");
        setNewValue("");
        setNewLabel("");
        setNewColor("#64748b");
        setShowAdd(false);
        router.refresh();
      } catch (err: any) {
        toast.error(err.message ?? "Failed to add status");
      }
    });
  }

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority Status</h2>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="text-xs font-bold text-brand-blue hover:text-brand-navy transition-colors"
        >
          {showAdd ? "Cancel" : "+ Add status"}
        </button>
      </div>

      <div className="space-y-2">
        {statuses.map(s => (
          <div key={s.id} className="flex items-center gap-3 group">
            {editingId === s.id ? (
              <>
                <input
                  type="color"
                  value={editColor}
                  onChange={e => setEditColor(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer border border-slate-200"
                />
                <input
                  type="text"
                  value={editLabel}
                  onChange={e => setEditLabel(e.target.value)}
                  className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                  autoFocus
                />
                <button
                  onClick={() => handleSave(s.id)}
                  disabled={isPending}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <span className="flex-1 text-sm text-slate-700 font-medium">{s.label}</span>
                <span className="text-[10px] text-slate-300 font-mono">{s.value}</span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(s)}
                    className="text-xs text-slate-400 hover:text-brand-blue"
                  >
                    Edit
                  </button>
                  {confirmDelete === s.id ? (
                    <>
                      <button
                        onClick={() => handleDelete(s.id)}
                        disabled={isPending}
                        className="text-xs font-bold text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(s.id)}
                      className="text-xs text-slate-400 hover:text-red-500"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="mt-4 pt-4 border-t border-slate-100 flex items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Color</label>
            <input
              type="color"
              value={newColor}
              onChange={e => setNewColor(e.target.value)}
              className="w-9 h-9 rounded cursor-pointer border border-slate-200"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Label</label>
            <input
              type="text"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              placeholder="e.g. In Review"
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              required
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Value (key)</label>
            <input
              type="text"
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              placeholder="e.g. in_review"
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-mono"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-brand-navy text-white text-sm font-bold rounded-lg hover:bg-brand-navy/80 disabled:opacity-50 transition-colors"
          >
            Add
          </button>
        </form>
      )}
    </section>
  );
}
