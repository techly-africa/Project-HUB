"use client";

import type { Notification } from "@/lib/notifications";
import { formatDistanceToNow } from "date-fns";
import { markNotificationReadAction } from "@/lib/notifications";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

const TYPE_ICON: Record<string, string> = {
  task_assigned: "👤",
  task_comment:  "💬",
  task_status:   "🔄",
  task_deadline: "⏰",
  invite:        "✉️",
  payment:       "💳",
};

interface Props {
  notification: Notification | null;
  onClose: () => void;
}

export default function NotificationModal({ notification, onClose }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!notification) return null;

  function handleMarkRead() {
    startTransition(async () => {
      await markNotificationReadAction(notification!.id);
      onClose();
      router.refresh();
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background-primary/80 backdrop-blur-sm transition-opacity"
        onClick={onClose} 
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface border border-border-subtle rounded-[32px] shadow-premium overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center text-2xl border border-border-subtle">
                {TYPE_ICON[notification.type] ?? "🔔"}
              </div>
              <div>
                <p className="text-xs font-medium text-muted mb-1">
                  Notification Details
                </p>
                <div className="text-[10px] font-semibold text-brand-teal px-2 py-0.5 bg-brand-teal/10 rounded-full border border-brand-teal/20 inline-block">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl hover:bg-surface-elevated flex items-center justify-center text-muted hover:text-contrast transition-all border border-transparent hover:border-border-subtle"
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
                <path d="M12 4L4 12M4 4L12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <h2 className="text-xl font-bold text-contrast leading-tight mb-4 tracking-tight">
            {notification.title}
          </h2>

          <div className="bg-surface-elevated border border-border-subtle rounded-2xl p-6 mb-8">
            <p className="text-secondary text-sm leading-relaxed whitespace-pre-wrap">
              {notification.body || "No additional details provided."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {!notification.read && (
              <button
                onClick={handleMarkRead}
                disabled={isPending}
                className="flex-1 py-3 bg-accent-primary text-white rounded-2xl text-xs font-semibold hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              >
                {isPending ? "Processing..." : "Mark as Read"}
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-surface-elevated hover:bg-surface-hover text-secondary hover:text-contrast border border-border-subtle hover:border-border-medium rounded-2xl text-xs font-semibold transition-all active:scale-95"
            >
              Close
            </button>
          </div>
        </div>

        {/* Brand Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-brand-teal via-brand-navy to-brand-pink opacity-50" />
      </div>
    </div>
  );
}
