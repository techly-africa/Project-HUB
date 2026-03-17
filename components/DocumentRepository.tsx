"use client";

import { useState, useRef, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { addDocumentAction, deleteDocumentAction } from "@/app/actions/documents";
import TaskAttachmentPicker from "./TaskAttachmentPicker";
import type { Document, TaskAttachmentWithContext } from "@/lib/types";
import { format } from "date-fns";

const BUCKET = "task-attachments";
const REPO_PREFIX = "repository";
const MAX_MB = 20;

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
  initialDocuments: Document[];
  taskAttachments: TaskAttachmentWithContext[];
}

export default function DocumentRepository({ initialDocuments, taskAttachments }: Props) {
  const router = useRouter();
  const [docs, setDocs] = useState<Document[]>(initialDocuments);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [search, setSearch] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sb = getSupabaseBrowserClient();

  const alreadyAddedIds = useMemo(
    () => new Set(docs.filter(d => d.task_attachment_id).map(d => d.task_attachment_id!)),
    [docs]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return docs.filter(d => d.name.toLowerCase().includes(q));
  }, [docs, search]);

  // ── Direct upload ──────────────────────────────────────────────────────────

  async function uploadFile(file: File) {
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`File too large — max ${MAX_MB} MB`);
      return;
    }
    setUploading(true);
    try {
      const path = `${REPO_PREFIX}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: uploadError } = await sb.storage.from(BUCKET).upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const doc = await addDocumentAction({
        name: file.name,
        storage_path: path,
        size: file.size,
        mime_type: file.type || null,
        source: "direct",
      });
      setDocs(prev => [doc, ...prev]);
      toast.success(`${file.name} uploaded`);
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    for (const file of Array.from(files)) {
      await uploadFile(file);
    }
  }

  // ── Pick from task attachment ──────────────────────────────────────────────

  async function handlePick(att: TaskAttachmentWithContext) {
    startTransition(async () => {
      try {
        const doc = await addDocumentAction({
          name: att.name,
          storage_path: att.storage_path,
          size: att.size,
          mime_type: att.mime_type,
          source: "task",
          task_attachment_id: att.id,
        });
        setDocs(prev => [doc, ...prev]);
        toast.success(`"${att.name}" added from task`);
      } catch (err: any) {
        toast.error(err?.message ?? "Failed to add document");
      }
    });
  }

  // ── Download ───────────────────────────────────────────────────────────────

  async function handleDownload(doc: Document) {
    const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(doc.storage_path, 60);
    if (error || !data?.signedUrl) {
      toast.error("Could not generate download link");
      return;
    }
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = doc.name;
    a.click();
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  async function handleDelete(doc: Document) {
    startTransition(async () => {
      try {
        // Remove storage object only for direct uploads
        if (doc.source === "direct") {
          await sb.storage.from(BUCKET).remove([doc.storage_path]);
        }
        await deleteDocumentAction(doc.id);
        setDocs(prev => prev.filter(d => d.id !== doc.id));
        toast.success("Document removed");
        setConfirmDelete(null);
      } catch (err: any) {
        toast.error(err?.message ?? "Failed to delete document");
      }
    });
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Document Repository</h1>
          <p className="text-sm text-slate-400 mt-1">{docs.length} document{docs.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowPicker(true)}
          className="px-4 py-2 bg-white border border-slate-200 text-sm font-bold text-slate-600 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          <span>📎</span> Pick from tasks
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl px-6 py-10 flex flex-col items-center justify-center cursor-pointer transition-all mb-6 ${
          dragging
            ? "border-brand-teal bg-brand-teal/5"
            : "border-slate-200 hover:border-brand-teal/50 hover:bg-slate-50"
        }`}
      >
        <input ref={inputRef} type="file" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
        {uploading ? (
          <p className="text-[11px] font-black uppercase tracking-widest text-brand-teal animate-pulse">Uploading…</p>
        ) : (
          <>
            <span className="text-3xl mb-2">☁️</span>
            <p className="text-sm font-black text-slate-500">Drop files or click to upload</p>
            <p className="text-xs text-slate-300 mt-1">Max {MAX_MB} MB per file</p>
          </>
        )}
      </div>

      {/* Search */}
      {docs.length > 0 && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search documents…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          />
        </div>
      )}

      {/* Document list */}
      {filtered.length === 0 && docs.length > 0 ? (
        <p className="text-sm text-slate-400 text-center py-12">No documents match your search</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-3xl mb-3">🗂️</p>
          <p className="text-sm font-bold text-slate-400">No documents yet</p>
          <p className="text-xs text-slate-300 mt-1">Upload files above or pick attachments from tasks</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <ul className="divide-y divide-slate-50">
            {filtered.map(doc => (
              <li key={doc.id} className="flex items-center gap-4 px-5 py-4 group hover:bg-slate-50/50 transition-colors">
                <span className="text-2xl flex-shrink-0">{fileIcon(doc.mime_type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{doc.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {formatBytes(doc.size) && (
                      <span className="text-[10px] text-slate-400">{formatBytes(doc.size)}</span>
                    )}
                    <span className="text-[10px] text-slate-300">·</span>
                    <span className="text-[10px] text-slate-400">{format(new Date(doc.created_at), "MMM d, yyyy")}</span>
                    {doc.source === "task" && (
                      <>
                        <span className="text-[10px] text-slate-300">·</span>
                        <span className="text-[10px] font-bold text-brand-teal/70">from task</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => handleDownload(doc)}
                    title="Download"
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-teal hover:border-brand-teal/30 transition-all text-xs"
                  >
                    ↓
                  </button>
                  {confirmDelete === doc.id ? (
                    <>
                      <button
                        onClick={() => handleDelete(doc)}
                        disabled={isPending}
                        className="px-2 h-7 rounded-lg bg-red-50 border border-red-200 text-[10px] font-bold text-red-500 hover:bg-red-100 transition-all disabled:opacity-50"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-2 h-7 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-400 hover:bg-slate-50 transition-all"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(doc.id)}
                      title="Remove"
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-all text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Task attachment picker modal */}
      {showPicker && (
        <TaskAttachmentPicker
          attachments={taskAttachments}
          alreadyAddedIds={alreadyAddedIds}
          onPick={att => handlePick(att)}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
