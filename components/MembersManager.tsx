"use client";

import { useState, useTransition, useRef } from "react";
import { inviteUserAction, resetUserPasswordAction, deleteUserAction, updateMemberNameAction } from "@/app/actions/users";
import type { Profile } from "@/lib/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  members: Profile[];
  currentUserId: string;
}

export default function MembersManager({ members, currentUserId }: Props) {
  const [showInvite, setShowInvite]       = useState(false);
  const [inviteEmail, setInviteEmail]     = useState("");
  const [inviteName, setInviteName]       = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingId, setEditingId]         = useState<string | null>(null);
  const [editingName, setEditingName]     = useState("");
  const [isPending, startTransition]      = useTransition();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    startTransition(async () => {
      try {
        await inviteUserAction(inviteEmail.trim(), inviteName.trim() || undefined);
        toast.success(`Invitation sent to ${inviteEmail.trim()}`);
        setInviteEmail("");
        setInviteName("");
        setShowInvite(false);
        router.refresh();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to send invitation");
      }
    });
  }

  function handleReset(member: Profile) {
    startTransition(async () => {
      try {
        await resetUserPasswordAction(member.id, member.email, member.full_name ?? "");
        toast.success(`Password reset email sent to ${member.email}`);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to send reset email");
      }
    });
  }

  function handleDelete(memberId: string) {
    startTransition(async () => {
      try {
        await deleteUserAction(memberId);
        toast.success("User removed");
        setConfirmDelete(null);
        router.refresh();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to remove user");
      }
    });
  }

  function startEditing(member: Profile) {
    setEditingId(member.id);
    setEditingName(member.full_name ?? "");
    setTimeout(() => nameInputRef.current?.focus(), 50);
  }

  function commitName(memberId: string) {
    setEditingId(null);
    startTransition(async () => {
      try {
        await updateMemberNameAction(memberId, editingName);
        router.refresh();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to update name");
      }
    });
  }

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Members</h2>
          <p className="text-slate-300 text-xs mt-0.5">{members.length} {members.length === 1 ? "member" : "members"}</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="bg-brand-teal text-white px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-sm shadow-brand-teal/20"
        >
          + Invite
        </button>
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-slate-400">No members found.</p>
      ) : (
        <ul className="divide-y divide-slate-50">
          {members.map(member => (
            <li key={member.id} className="flex items-center gap-4 py-3">
              {/* Avatar */}
              {member.avatar_url ? (
                <img
                  src={member.avatar_url}
                  alt={member.full_name ?? member.email}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-brand-teal/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-teal font-black text-sm">
                    {(member.full_name ?? member.email)[0].toUpperCase()}
                  </span>
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                {editingId === member.id ? (
                  <input
                    ref={nameInputRef}
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onBlur={() => commitName(member.id)}
                    onKeyDown={e => {
                      if (e.key === "Enter") { e.preventDefault(); commitName(member.id); }
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    placeholder="Full name"
                    className="w-full text-sm font-bold text-slate-800 bg-slate-50 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-brand-teal"
                  />
                ) : (
                  <button
                    onClick={() => startEditing(member)}
                    className="group flex items-center gap-1.5 text-left w-full"
                    title="Click to edit name"
                  >
                    {member.full_name ? (
                      <span className="text-sm font-bold text-slate-800 truncate">{member.full_name}</span>
                    ) : (
                      <span className="text-sm text-slate-300 italic">Add name…</span>
                    )}
                    <span className="text-slate-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
                  </button>
                )}
                <p className="text-xs text-slate-400 truncate mt-0.5">{member.email}</p>
              </div>

              {/* You badge */}
              {member.id === currentUserId && (
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-teal bg-brand-teal/10 px-2 py-1 rounded-full flex-shrink-0">You</span>
              )}

              {/* Actions (not for self) */}
              {member.id !== currentUserId && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleReset(member)}
                    disabled={isPending}
                    className="text-[11px] font-bold text-slate-400 hover:text-brand-teal transition-colors px-2 py-1 rounded-lg hover:bg-brand-teal/5"
                    title="Send password reset"
                  >
                    Reset pwd
                  </button>
                  <button
                    onClick={() => setConfirmDelete(member.id)}
                    disabled={isPending}
                    className="text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                    title="Remove user"
                  >
                    Remove
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={() => setShowInvite(false)}>
          <form
            onSubmit={handleInvite}
            className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Invite member</h2>
            <p className="text-sm text-slate-400 mb-6">They&apos;ll receive an email to set their password.</p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Full name</label>
                <input
                  autoFocus
                  type="text"
                  placeholder="Jean Dupont"
                  className="w-full bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-brand-teal"
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Email address</label>
                <input
                  required
                  type="email"
                  placeholder="name@company.com"
                  className="w-full bg-slate-50 rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-brand-teal"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button type="button" onClick={() => setShowInvite(false)} className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                Cancel
              </button>
              <button disabled={isPending} className="flex-1 bg-brand-teal text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-brand-teal/20">
                {isPending ? "Sending…" : "Send Invite"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-black text-slate-900 mb-2">Remove user?</h2>
            <p className="text-sm text-slate-400 mb-8">This will permanently delete their account and remove them from the organization.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                Cancel
              </button>
              <button
                disabled={isPending}
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 bg-red-500 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all"
              >
                {isPending ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
