import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getNotifications, getUnreadCount } from "@/lib/notifications";
import { getTaskStatuses, getOrganization } from "@/lib/queries";
import NotificationBell from "./NotificationBell";
import StatusLegend from "./StatusLegend";
import UserMenu from "./UserMenu";
import LicenseBanner from "./LicenseBanner";
import { ThemeToggle } from "./ThemeToggle";

export default async function TopBar() {
  const sb = createSupabaseServerClient();

  const [
    { data: { user } },
    notifications,
    unreadCount,
    organization,
  ] = await Promise.all([
    sb.auth.getUser(),
    getNotifications(),
    getUnreadCount(),
    getOrganization(),
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

  // After 15th payment reminder logic
  const today = new Date();
  const isAfter15th = today.getDate() > 15;
  const showPaymentReminder = isAfter15th && organization?.license_type === 'standard';

  const finalNotifications = [...notifications];
  let finalUnreadCount = unreadCount;

  if (showPaymentReminder) {
    const reminderId = `payment-reminder-${today.getFullYear()}-${today.getMonth()}`;
    // Check if user already has a notification for this? 
    // For simplicity and per requirement, we ensure it's "available".
    // We'll inject it at the top.
    finalNotifications.unshift({
      id: reminderId,
      user_id: user?.id ?? "",
      type: "payment",
      title: "Monthly License Renewal 💳",
      body: "Please make a payment of Rwf 350k on MOMO code 115566 (AVEL AFRICA LTD) for renewal.",
      task_id: null,
      read: false, // Always show as unread if it's new for the 15th?
      created_at: new Date(today.getFullYear(), today.getMonth(), 16).toISOString(),
    });
    finalUnreadCount++;
  }

  return (
    <>
      <LicenseBanner organization={organization} />
      <header className="h-16 flex-shrink-0 flex items-center justify-end gap-4 px-8 border-b border-border-subtle glass-morphism sticky top-0 z-40">
        <div className="flex-1 flex items-center">
          <p className="text-xs font-semibold text-accent-primary flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-accent-primary animate-pulse" />
            Control Plane
          </p>
        </div>
        <div className="flex items-center gap-4">
          <StatusLegend statuses={statuses} />
          <div className="h-6 w-px bg-border-subtle" />
          <ThemeToggle />
          <div className="h-6 w-px bg-border-subtle" />
          <NotificationBell notifications={finalNotifications} unreadCount={finalUnreadCount} />
          <UserMenu
            name={profile?.full_name ?? null}
            email={profile?.email ?? user?.email ?? ""}
          />
        </div>
      </header>
    </>
  );
}
