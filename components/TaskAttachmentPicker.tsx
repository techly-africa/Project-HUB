"use client";

import { useState, useMemo } from "react";
import type { TaskAttachmentWithContext } from "@/lib/types";

function fileIcon(mime: string | null) {
  if (!mime) return "📄";
  if (mime.startsWith("image/")) return "🖼️";
  if (mime === "application/pdf") return "📕";
  if (mime.includes("spreadsheet") || mime.includes("excel") || mime.includes("csv")) return "📊";
  if (mime.includes("word") || mime.includes("document")) return "📝";
  if (mime.includes("zip") || mime.includes("rar") || mime.includes("tar")) return "🗜️";
  return "📄";
}

function formatBytes(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  attachments: TaskAttachmentWithContext[];
  alreadyAddedIds: Set<string>;
  onPick: (att: TaskAttachmentWithContext) => void;
  onClose: () => void;
}

export default function TaskAttachmentPicker({ attachments, alreadyAddedIds, onPick, onClose }: Props) {
  const [search, setSearch] = useState("");

  const grouped = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = attachments.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.task_name.toLowerCase().includes(q) ||
      a.plan_name.toLowerCase().includes(q)
    );
    const map = new Map<string, { planName: string; items: TaskAttachmentWithContext[] }>();
    for (const att of filtered) {
      const key = att.plan_name;
      if (!map.has(key)) map.set(key, { planName: att.plan_name, items: [] });
      map.get(key)!.items.push(att);
    }
    return Array.from(map.values());
  }, [attachments, search]);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-black text-slate-800">Pick from tasks</h2>
              <p className="text-xs text-slate-400 mt-0.5">{attachments.length} attachment{attachments.length !== 1 ? "s" : ""} available</p>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors text-sm">✕</button>
          </div>

          {/* Search */}
          <div className="px-5 py-3 border-b border-slate-100">
            <input
              type="text"
              placeholder="Search by file or task name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              autoFocus
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
            {grouped.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No attachments found</p>
            ) : (
              grouped.map(group => (
                <div key={group.planName}>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{group.planName}</p>
                  <div className="space-y-1">
                    {group.items.map(att => {
                      const already = alreadyAddedIds.has(att.id);
                      return (
                        <button
                          key={att.id}
                          onClick={() => !already && onPick(att)}
                          disabled={already}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                            already
                              ? "opacity-40 cursor-default bg-slate-50"
                              : "hover:bg-slate-50 cursor-pointer"
                          }`}
                        >
                          <span className="text-lg flex-shrink-0">{fileIcon(att.mime_type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{att.name}</p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{att.task_name} · {formatBytes(att.size)}</p>
                          </div>
                          {already ? (
                            <span className="text-[10px] font-bold text-slate-400 flex-shrink-0">Added</span>
                          ) : (
                            <span className="text-[10px] font-bold text-brand-blue flex-shrink-0">+ Add</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
