import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getNotifications, getUnreadCount } from "@/lib/notifications";
import { getTaskStatuses } from "@/lib/queries";
import NotificationBell from "./NotificationBell";
import StatusLegend from "./StatusLegend";
import UserMenu from "./UserMenu";

export default async function TopBar() {
  const sb = createSupabaseServerClient();

  const [
    { data: { user } },
    notifications,
    unreadCount,
  ] = await Promise.all([
    sb.auth.getUser(),
    getNotifications(),
    getUnreadCount(),
  ]);

  let statuses: Awaited<ReturnType<typeof getTaskStatuses>> = [];
  try {
    statuses = await getTaskStatuses();
  } catch {
    // migration not yet applied
  }

  const { data: profile } = user
    ? await sb.from("profiles").select("full_name, email").eq("id", user.id).single()
    : { data: null };

  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-end gap-2 px-6 border-b border-slate-100 bg-white">
      <StatusLegend statuses={statuses} />
      <NotificationBell notifications={notifications} unreadCount={unreadCount} />
      <UserMenu
        name={profile?.full_name ?? null}
        email={profile?.email ?? user?.email ?? ""}
      />
    </header>
  );
}
