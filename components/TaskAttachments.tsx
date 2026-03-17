"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { TaskAttachment } from "@/lib/types";
import { toast } from "sonner";
import { format } from "date-fns";

const BUCKET = "task-attachments";
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

export default function TaskAttachments({ taskId }: { taskId: string }) {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sb = getSupabaseBrowserClient();

  useEffect(() => {
    load();
  }, [taskId]);

  async function load() {
    const { data } = await sb
      .from("task_attachments")
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: false });
    setAttachments((data ?? []) as TaskAttachment[]);
  }

  async function uploadFile(file: File) {
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`File too large — max ${MAX_MB} MB`);
      return;
    }

    setUploading(true);
    try {
      // Resolve org_id so the storage path is scoped to the organisation.
      // The storage bucket policy enforces that (foldername(name))[1] = user_org_id().
      const { data: { user } } = await sb.auth.getUser();
      if (!user) throw new Error("Auth required");
      const { data: profile } = await sb
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();
      const orgId = profile?.organization_id;
      if (!orgId) throw new Error("No organization found");

      const path = `${orgId}/${taskId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

      const { error: uploadError } = await sb.storage.from(BUCKET).upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const { error: dbError } = await sb.from("task_attachments").insert({
        task_id: taskId,
        name: file.name,
        storage_path: path,
        size: file.size,
        mime_type: file.type || null,
      });
      if (dbError) throw dbError;

      toast.success(`${file.name} uploaded`);
      await load();
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

  async function handleDownload(att: TaskAttachment) {
    const { data, error } = await sb.storage
      .from(BUCKET)
      .createSignedUrl(att.storage_path, 60);
    if (error || !data?.signedUrl) {
      toast.error("Could not generate download link");
      return;
    }
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = att.name;
    a.click();
  }

  async function handleDelete(att: TaskAttachment) {
    try {
      await sb.storage.from(BUCKET).remove([att.storage_path]);
      await sb.from("task_attachments").delete().eq("id", att.id);
      toast.success("Attachment removed");
      setAttachments(prev => prev.filter(a => a.id !== att.id));
    } catch {
      toast.error("Failed to delete attachment");
    }
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl px-4 py-5 flex flex-col items-center justify-center cursor-pointer transition-all ${
          dragging
            ? "border-brand-teal bg-brand-teal/5"
            : "border-slate-200 hover:border-brand-teal/50 hover:bg-slate-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        {uploading ? (
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-teal animate-pulse">Uploading…</p>
        ) : (
          <>
            <span className="text-2xl mb-1">📎</span>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Drop files or click to attach
            </p>
            <p className="text-[9px] text-slate-300 mt-0.5">Max {MAX_MB} MB per file</p>
          </>
        )}
      </div>

      {/* Attachment list */}
      {attachments.length > 0 && (
        <ul className="space-y-2">
          {attachments.map(att => (
            <li
              key={att.id}
              className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 group"
            >
              <span className="text-lg flex-shrink-0">{fileIcon(att.mime_type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{att.name}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">
                  {formatBytes(att.size)}
                  {att.created_at && ` · ${format(new Date(att.created_at), "MMM d, yyyy")}`}
                </p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={() => handleDownload(att)}
                  title="Download"
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand-teal hover:border-brand-teal/30 transition-all text-xs"
                >
                  ↓
                </button>
                <button
                  onClick={() => handleDelete(att)}
                  title="Delete"
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-all text-xs"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
