"use client";

import { useState, useMemo, useRef, useTransition } from "react";
import { Document, DocumentFolder, TaskAttachmentWithContext } from "@/lib/types";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  FileText,
  Folder,
  Search,
  UploadCloud,
  Paperclip,
  BarChart2,
  Trash2,
  ChevronRight,
  Layers,
  HardDrive,
  HardDriveDownload,
  FileCode,
  FileBox,
  Layout
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import {
  addDocumentAction,
  deleteDocumentAction,
  createFolderAction,
  deleteFolderAction,
  moveDocumentAction
} from "@/app/actions/documents";
import TaskAttachmentPicker from "./TaskAttachmentPicker";

const BUCKET = "task-attachments";
const REPO_PREFIX = "repository";
const MAX_MB = 20;

function fileIcon(mime: string | null) {
  if (!mime) return <FileText className="w-5 h-5 text-muted" />;
  const m = mime.toLowerCase();
  if (m.startsWith("image/")) return <BarChart2 className="w-5 h-5 text-brand-teal" />;
  if (m === "application/pdf") return <FileText className="w-5 h-5 text-rose-500" />;
  if (m.includes("spreadsheet") || m.includes("excel") || m.includes("csv")) return <BarChart2 className="w-5 h-5 text-emerald-500" />;
  if (m.includes("javascript") || m.includes("typescript") || m.includes("json")) return <FileCode className="w-5 h-5 text-amber-500" />;
  if (m.includes("zip") || m.includes("rar") || m.includes("tar")) return <FileBox className="w-5 h-5 text-purple-500" />;
  return <FileText className="w-5 h-5 text-blue-500" />;
}

function formatBytes(bytes: number | null) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  initialDocuments: Document[];
  initialFolders: DocumentFolder[];
  taskAttachments: TaskAttachmentWithContext[];
}

export default function DocumentRepository({ initialDocuments, initialFolders, taskAttachments }: Props) {
  const [docs, setDocs] = useState<Document[]>(initialDocuments);
  const [folders, setFolders] = useState<DocumentFolder[]>(initialFolders);

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<DocumentFolder[]>([]);

  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [search, setSearch] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmDeleteFolder, setConfirmDeleteFolder] = useState<string | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const sb = getSupabaseBrowserClient();

  const alreadyAddedIds = useMemo(
    () => new Set(docs.filter(d => d.task_attachment_id).map(d => d.task_attachment_id!)),
    [docs]
  );

  const isSearching = search.trim().length > 0;

  const visibleFolders = useMemo(() => {
    if (isSearching) return [];
    return folders.filter(f => f.parent_id === currentFolderId);
  }, [folders, currentFolderId, isSearching]);

  const visibleDocs = useMemo(() => {
    const q = search.toLowerCase();
    if (isSearching) return docs.filter(d => d.name.toLowerCase().includes(q));
    return docs.filter(d => d.folder_id === currentFolderId);
  }, [docs, search, currentFolderId, isSearching]);

  const folderMap = useMemo(() => {
    const m = new Map<string, DocumentFolder>();
    folders.forEach(f => m.set(f.id, f));
    return m;
  }, [folders]);

  const totalSizeBytes = useMemo(() => docs.reduce((acc, d) => acc + (d.size || 0), 0), [docs]);
  const storageLimit = 2 * 1024 * 1024 * 1024;
  const storagePercent = Math.min((totalSizeBytes / storageLimit) * 100, 100);

  function navigateIntoFolder(folder: DocumentFolder) {
    setCurrentFolderId(folder.id);
    setFolderPath(prev => [...prev, folder]);
    setSearch("");
  }

  function navigateToBreadcrumb(index: number) {
    if (index === -1) {
      setCurrentFolderId(null);
      setFolderPath([]);
    } else {
      const newPath = folderPath.slice(0, index + 1);
      setCurrentFolderId(newPath[newPath.length - 1].id);
      setFolderPath(newPath);
    }
  }

  async function handleCreateFolder() {
    const name = newFolderName.trim();
    if (!name) return;
    startTransition(async () => {
      try {
        const folder = await createFolderAction({ name, parent_id: currentFolderId });
        setFolders(prev => [...prev, folder]);
        setNewFolderName("");
        setShowNewFolder(false);
        toast.success(`Folder "${name}" created`);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to create folder");
      }
    });
  }

  async function handleDeleteFolder(folder: DocumentFolder) {
    startTransition(async () => {
      try {
        await deleteFolderAction(folder.id);
        setFolders(prev => prev.filter(f => f.id !== folder.id));
        setDocs(prev => prev.map(d => d.folder_id === folder.id ? { ...d, folder_id: null } : d));
        setConfirmDeleteFolder(null);
        toast.success(`Folder "${folder.name}" deleted`);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Delete failed");
      }
    });
  }

  async function uploadFile(file: File) {
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`File too large — limit ${MAX_MB} MB`);
      return;
    }
    setUploading(true);
    try {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data: profile } = await sb.from("profiles").select("organization_id").eq("id", user.id).single();
      const orgId = profile?.organization_id;
      if (!orgId) throw new Error("Organization not found");

      const path = `${orgId}/${REPO_PREFIX}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
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
        folder_id: currentFolderId,
      });
      setDocs(prev => [doc, ...prev]);
      toast.success(`${file.name} uploaded`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    for (const file of Array.from(files)) await uploadFile(file);
  }

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
          folder_id: currentFolderId,
        });
        setDocs(prev => [doc, ...prev]);
        toast.success(`"${att.name}" linked from task`);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Link failed");
      }
    });
  }

  async function handleDownload(doc: Document) {
    const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(doc.storage_path, 60);
    if (error || !data?.signedUrl) { toast.error("Download link failed"); return; }
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = doc.name;
    a.click();
  }

  async function handleDeleteDoc(doc: Document) {
    startTransition(async () => {
      try {
        await deleteDocumentAction(doc.id);
        await sb.storage.from(BUCKET).remove([doc.storage_path]);
        setDocs(prev => prev.filter(d => d.id !== doc.id));
        setConfirmDelete(null);
        toast.success("File deleted");
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Delete failed");
      }
    });
  }

  async function handleMove(doc: Document, folderId: string | null) {
    startTransition(async () => {
      try {
        await moveDocumentAction(doc.id, folderId);
        setDocs(prev => prev.map(d => (d.id === doc.id ? { ...d, folder_id: folderId } : d)));
        toast.success("File moved");
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Move failed");
      }
    });
  }

  return (
    <div className="min-h-screen bg-background-primary text-primary selection:bg-brand-teal/30">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border-subtle bg-surface backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-teal/5 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-8 py-12 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-teal/10 flex items-center justify-center border border-brand-teal/20 shadow-[0_0_30px_rgba(20,184,166,0.15)]">
                  <Layout className="w-8 h-8 text-brand-teal" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-contrast tracking-tight leading-none">Repository</h1>
                  <p className="text-xs text-muted font-medium mt-1.5">Centralized Asset Management</p>
                </div>
              </motion.div>

              <div className="flex items-center gap-4 pt-2">
                <div className="bg-surface-elevated border border-border-subtle rounded-2xl px-5 py-3">
                  <p className="text-xs text-muted mb-1">Total Assets</p>
                  <p className="text-xl font-bold text-contrast">{docs.length}</p>
                </div>
                <div className="bg-surface-elevated border border-border-subtle rounded-2xl px-5 py-3">
                  <p className="text-xs text-muted mb-1">Storage Usage</p>
                  <p className="text-xl font-bold text-contrast">{formatBytes(totalSizeBytes)}</p>
                </div>
              </div>
            </div>

            <div className="w-full md:w-80 space-y-4">
              <div className="flex items-center justify-between text-xs font-medium text-muted">
                <span>Storage consumption</span>
                <span className="text-brand-teal font-semibold">{storagePercent.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-surface-elevated rounded-full overflow-hidden border border-border-subtle">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${storagePercent}%` }}
                  className="h-full storage-gradient transition-all duration-1000"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowNewFolder(true)}
                  className="flex-1 px-4 py-3 bg-surface-elevated hover:bg-surface-hover border border-border-subtle hover:border-border-medium rounded-2xl transition-all active:scale-95"
                >
                  <span className="flex items-center justify-center gap-2 text-[11px] font-semibold text-secondary hover:text-contrast">
                    <Folder className="w-4 h-4" /> New Folder
                  </span>
                </button>
                <button
                  onClick={() => setShowPicker(true)}
                  className="flex-1 px-4 py-3 bg-accent-primary/10 hover:bg-accent-primary/15 border border-accent-primary/20 rounded-2xl transition-all active:scale-95"
                >
                  <span className="flex items-center justify-center gap-2 text-[11px] font-semibold text-accent-primary">
                    <Paperclip className="w-4 h-4" /> Sync Task
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-10">
        {/* Navigation Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 px-2">
          <nav className="flex items-center gap-2 text-xs font-semibold flex-wrap">
            <button
              onClick={() => navigateToBreadcrumb(-1)}
              className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                folderPath.length === 0
                  ? "bg-accent-primary/10 text-accent-primary border border-accent-primary/20"
                  : "bg-surface-elevated text-secondary hover:text-contrast border border-border-subtle hover:bg-surface-hover"
              }`}
            >
              Root
            </button>
            {folderPath.map((folder, i) => (
              <div key={folder.id} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-muted" />
                <button
                  onClick={() => navigateToBreadcrumb(i)}
                  className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                    i === folderPath.length - 1
                      ? "bg-accent-primary/10 text-accent-primary border border-accent-primary/20"
                      : "bg-surface-elevated text-secondary hover:text-contrast border border-border-subtle hover:bg-surface-hover"
                  }`}
                >
                  {folder.name}
                </button>
              </div>
            ))}
          </nav>

          <div className="relative group w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-4 h-4 group-focus-within:text-accent-primary transition-colors" />
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-surface border border-border-subtle rounded-2xl pl-12 pr-4 py-3 text-sm text-primary focus:outline-none focus:border-border-medium focus:ring-2 ring-accent-primary/10 transition-all placeholder:text-muted"
            />
          </div>
        </div>

        {/* Drop zone */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-[2.5rem] px-8 py-16 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 mb-12 group ${
            dragging
              ? "border-brand-teal bg-brand-teal/5 shadow-[0_0_40px_rgba(20,184,166,0.1)]"
              : "border-border-subtle hover:border-accent-primary/40 hover:bg-surface-elevated"
          }`}
        >
          <input ref={inputRef} type="file" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
          {uploading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin" />
              <p className="text-xs font-semibold text-accent-primary animate-pulse">Uploading…</p>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-surface-elevated rounded-3xl flex items-center justify-center border border-border-subtle mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <UploadCloud className="w-8 h-8 text-accent-primary" />
              </div>
              <p className="text-base font-semibold text-contrast tracking-tight">
                Drop files here
              </p>
              <p className="text-sm text-muted mt-1">
                Click to browse or drag & drop
                {!isSearching && currentFolderId && (
                  <span className="text-accent-primary"> into {folderMap.get(currentFolderId)?.name}</span>
                )}
              </p>
              <div className="flex items-center gap-3 mt-5">
                <span className="px-3 py-1 bg-surface-elevated border border-border-subtle rounded-lg text-xs text-muted">Max {MAX_MB} MB</span>
                <span className="px-3 py-1 bg-surface-elevated border border-border-subtle rounded-lg text-xs text-muted">Multi-upload</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* New folder form */}
        <AnimatePresence>
          {showNewFolder && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mb-8 flex items-center gap-4 bg-surface border border-border-subtle p-4 rounded-3xl">
                <div className="flex items-center gap-4 bg-surface-elevated border border-border-subtle rounded-2xl px-5 py-3 flex-1 focus-within:ring-2 ring-accent-primary/20 transition-all">
                  <Folder className="w-5 h-5 text-accent-primary" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Folder name..."
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") handleCreateFolder();
                      if (e.key === "Escape") setShowNewFolder(false);
                    }}
                    className="flex-1 text-sm font-medium text-primary bg-transparent focus:outline-none placeholder:text-muted"
                  />
                </div>
                <button
                  onClick={handleCreateFolder}
                  disabled={isPending || !newFolderName.trim()}
                  className="px-8 py-3 bg-accent-primary text-white text-xs font-semibold rounded-2xl hover:brightness-110 transition-all disabled:opacity-50"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowNewFolder(false)}
                  className="px-6 py-3 text-xs font-medium text-muted hover:text-contrast transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div className="space-y-12">
          {isSearching ? (
            visibleDocs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-surface border border-border-subtle rounded-[3rem]"
              >
                <Search className="w-12 h-12 text-muted mx-auto mb-4" />
                <p className="text-sm text-muted">No files found matching your search</p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <p className="text-xs font-medium text-muted px-2">{visibleDocs.length} results</p>
                <div className="bg-surface border border-border-subtle rounded-[2.5rem] overflow-hidden">
                  <ul className="divide-y divide-border-subtle">
                    {visibleDocs.map(doc => (
                      <DocRow
                        key={doc.id}
                        doc={doc}
                        folders={folders}
                        folderLabel={doc.folder_id ? folderMap.get(doc.folder_id)?.name : undefined}
                        confirmDelete={confirmDelete}
                        isPending={isPending}
                        onDownload={() => handleDownload(doc)}
                        onConfirmDelete={() => setConfirmDelete(doc.id)}
                        onCancelDelete={() => setConfirmDelete(null)}
                        onDelete={() => handleDeleteDoc(doc)}
                        onMove={fId => handleMove(doc, fId)}
                      />
                    ))}
                  </ul>
                </div>
              </div>
            )
          ) : (
            <>
              {visibleFolders.length > 0 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between px-2">
                    <p className="text-xs font-medium text-muted">Folders</p>
                    <span className="text-xs text-muted">{visibleFolders.length}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visibleFolders.map(folder => {
                      const docCount = docs.filter(d => d.folder_id === folder.id).length;
                      const subCount = folders.filter(f => f.parent_id === folder.id).length;
                      return (
                        <motion.div
                          whileHover={{ scale: 1.02, y: -3 }}
                          whileTap={{ scale: 0.98 }}
                          key={folder.id}
                          className="group bg-surface border border-border-subtle rounded-2xl p-6 cursor-pointer hover:bg-surface-elevated hover:border-border-medium hover:shadow-premium transition-all flex flex-col gap-4"
                          onClick={() => navigateIntoFolder(folder)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="w-12 h-12 bg-accent-primary/10 rounded-xl flex items-center justify-center border border-accent-primary/15 group-hover:bg-accent-primary/15 transition-colors">
                              <Folder className="w-6 h-6 text-accent-primary" />
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                              {confirmDeleteFolder === folder.id ? (
                                <div className="flex gap-2">
                                  <button onClick={() => handleDeleteFolder(folder)} disabled={isPending} className="px-3 py-1.5 rounded-xl bg-accent-danger text-[10px] font-semibold text-white">Delete</button>
                                  <button onClick={() => setConfirmDeleteFolder(null)} className="px-3 py-1.5 rounded-xl bg-surface-elevated text-[10px] font-semibold text-secondary border border-border-subtle">Cancel</button>
                                </div>
                              ) : (
                                <button onClick={() => setConfirmDeleteFolder(folder.id)} className="w-9 h-9 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-muted hover:text-accent-danger transition-all">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-contrast tracking-tight truncate group-hover:text-accent-primary transition-colors">{folder.name}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="px-2 py-0.5 bg-surface-elevated border border-border-subtle rounded text-[10px] text-muted">{docCount} files</span>
                              {subCount > 0 && <span className="px-2 py-0.5 bg-surface-elevated border border-border-subtle rounded text-[10px] text-muted">{subCount} folders</span>}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {visibleDocs.length > 0 || visibleFolders.length === 0 ? (
                <div className="space-y-5">
                  {visibleDocs.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between px-2">
                        <p className="text-xs font-medium text-muted">Files</p>
                        <span className="text-xs text-muted">{visibleDocs.length}</span>
                      </div>
                      <div className="bg-surface border border-border-subtle rounded-[2.5rem] overflow-hidden">
                        <ul className="divide-y divide-border-subtle">
                          {visibleDocs.map(doc => (
                            <DocRow
                              key={doc.id}
                              doc={doc}
                              folders={folders}
                              confirmDelete={confirmDelete}
                              isPending={isPending}
                              onDownload={() => handleDownload(doc)}
                              onConfirmDelete={() => setConfirmDelete(doc.id)}
                              onCancelDelete={() => setConfirmDelete(null)}
                              onDelete={() => handleDeleteDoc(doc)}
                              onMove={fId => handleMove(doc, fId)}
                            />
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    visibleFolders.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-24 bg-surface border border-dashed border-border-subtle rounded-[3rem]"
                      >
                        <div className="w-16 h-16 bg-surface-elevated rounded-3xl flex items-center justify-center mx-auto mb-6 border border-border-subtle">
                          <Layers className="w-8 h-8 text-muted" />
                        </div>
                        <p className="text-base font-semibold text-contrast tracking-tight">No files yet</p>
                        <p className="text-sm text-muted mt-2">Upload files or link task attachments</p>
                      </motion.div>
                    )
                  )}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showPicker && (
          <TaskAttachmentPicker
            attachments={taskAttachments}
            alreadyAddedIds={alreadyAddedIds}
            onPick={att => handlePick(att)}
            onClose={() => setShowPicker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface DocRowProps {
  readonly doc: Document;
  readonly folders: DocumentFolder[];
  readonly folderLabel?: string;
  readonly confirmDelete: string | null;
  readonly isPending: boolean;
  readonly onDownload: () => void;
  readonly onConfirmDelete: () => void;
  readonly onCancelDelete: () => void;
  readonly onDelete: () => void;
  readonly onMove: (folderId: string | null) => void;
}

function DocRow({ doc, folders, folderLabel, confirmDelete, isPending, onDownload, onConfirmDelete, onCancelDelete, onDelete, onMove }: DocRowProps) {
  const [showMovePicker, setShowMovePicker] = useState(false);

  function handleMoveSelect(folderId: string | null) {
    setShowMovePicker(false);
    onMove(folderId);
  }

  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative flex items-center gap-5 px-6 py-4 group hover:bg-surface-elevated transition-all"
    >
      <div className="w-10 h-10 bg-surface-elevated rounded-xl flex items-center justify-center border border-border-subtle group-hover:border-accent-primary/20 transition-colors shrink-0">
        {fileIcon(doc.mime_type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-contrast truncate group-hover:text-accent-primary transition-colors font-mono">
          {doc.name}
        </p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-xs text-muted">{formatBytes(doc.size)}</span>
          <span className="text-muted text-xs">·</span>
          <span className="text-xs text-muted">{format(new Date(doc.created_at), "MMM d, y")}</span>
          {doc.source === "task" && (
            <span className="px-2 py-0.5 bg-accent-primary/10 border border-accent-primary/15 rounded text-[10px] font-medium text-accent-primary">From task</span>
          )}
          {folderLabel && (
            <span className="px-2 py-0.5 bg-surface-elevated border border-border-subtle rounded text-[10px] text-muted flex items-center gap-1.5">
              <Folder className="w-2.5 h-2.5" /> {folderLabel}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all shrink-0">
        <button
          onClick={onDownload}
          title="Download"
          className="w-9 h-9 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-muted hover:text-accent-primary hover:border-accent-primary/20 transition-all"
        >
          <HardDriveDownload className="w-4 h-4" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMovePicker(v => !v)}
            title="Move"
            className="w-9 h-9 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-muted hover:text-primary hover:border-border-medium transition-all"
          >
            <Layers className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {showMovePicker && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMovePicker(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 top-11 z-20 bg-surface border border-border-subtle rounded-2xl shadow-premium min-w-[200px] py-1.5 overflow-hidden"
                >
                  <p className="text-xs font-medium text-muted px-4 py-2 border-b border-border-subtle">Move to…</p>
                  <div className="max-h-[220px] overflow-y-auto scrollbar-hide py-1">
                    <button
                      onClick={() => handleMoveSelect(null)}
                      disabled={doc.folder_id === null}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-secondary hover:text-contrast hover:bg-surface-elevated transition-colors flex items-center gap-3 disabled:opacity-30"
                    >
                      <HardDrive className="w-3.5 h-3.5" /> Root
                    </button>
                    {folders.map(f => (
                      <button
                        key={f.id}
                        onClick={() => handleMoveSelect(f.id)}
                        disabled={doc.folder_id === f.id}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium text-secondary hover:text-contrast hover:bg-surface-elevated transition-colors flex items-center gap-3 disabled:opacity-30"
                      >
                        <Folder className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{f.name}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {confirmDelete === doc.id ? (
          <div className="flex gap-2">
            <button onClick={onDelete} disabled={isPending} className="px-3 py-1.5 rounded-xl bg-accent-danger text-[10px] font-semibold text-white">Delete</button>
            <button onClick={onCancelDelete} className="px-3 py-1.5 rounded-xl bg-surface-elevated text-[10px] font-semibold text-secondary border border-border-subtle">Cancel</button>
          </div>
        ) : (
          <button
            onClick={onConfirmDelete}
            title="Delete"
            className="w-9 h-9 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-muted hover:text-accent-danger transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.li>
  );
}
