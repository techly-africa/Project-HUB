"use client";

import { useState, useTransition } from "react";
import type { Notification } from "@/lib/notifications";
import { markAllReadAction, markNotificationReadAction } from "@/lib/notifications";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import NotificationModal from "./NotificationModal";

const TYPE_ICON: Record<string, string> = {
  task_assigned: "👤",
  task_comment:  "💬",
  task_status:   "🔄",
  task_deadline: "⏰",
  invite:        "✉️",
  payment:       "💳",
};

interface Props {
  notifications: Notification[];
  unreadCount: number;
}

export default function NotificationBell({ notifications, unreadCount }: Props) {
  const [open, setOpen]           = useState(false);
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllReadAction();
      router.refresh();
    });
  }

  function handleClick(n: Notification) {
    setActiveNotification(n);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative flex items-center justify-center w-8 h-8 rounded-xl hover:bg-slate-100 transition-colors"
        title="Notifications"
      >
        <span className="text-base leading-none">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-brand-pink rounded-full flex items-center justify-center text-white text-[9px] font-black">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <p className="text-white text-[11px] font-black uppercase tracking-widest">Notifications</p>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={isPending}
                  className="text-[10px] font-bold text-brand-teal hover:opacity-80 transition-opacity"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-white/30 text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map(n => (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${!n.read ? "bg-white/5" : ""}`}
                  >
                    <span className="text-base leading-none mt-0.5 flex-shrink-0">
                      {TYPE_ICON[n.type] ?? "🔔"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${n.read ? "text-white/50" : "text-white font-bold"}`}>
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-xs text-white/30 truncate mt-0.5">{n.body}</p>
                      )}
                      <p className="text-[10px] text-white/20 mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-brand-teal flex-shrink-0 mt-1.5" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}

      <NotificationModal 
        notification={activeNotification} 
        onClose={() => setActiveNotification(null)} 
      />
    </div>
  );
}
