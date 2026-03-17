import { getProjects, getPlansByProject, getTaskStatuses } from "@/lib/queries";
import type { TaskStatusConfig } from "@/lib/types";
import { getActiveProjectId } from "@/lib/active-project";
import { getNotifications, getUnreadCount } from "@/lib/notifications";
import BrandLogo from "./BrandLogo";
import SignOutButton from "./SignOutButton";
import ProjectSwitcher from "./ProjectSwitcher";
import { SidebarLink } from "./SidebarLink";
import NewWorkstreamButton from "./NewWorkstreamButton";
import NotificationBell from "./NotificationBell";

export default async function Sidebar() {
  let projects: Awaited<ReturnType<typeof getProjects>> = [];
  let rawActiveId: string | null = null;
  let notifications: Awaited<ReturnType<typeof getNotifications>> = [];
  let unreadCount = 0;
  let statuses: TaskStatusConfig[] = [];

  try {
    [projects, rawActiveId, notifications, unreadCount] = await Promise.all([
      getProjects(),
      getActiveProjectId(),
      getNotifications(),
      getUnreadCount(),
    ]);
  } catch (err) {
    console.error("[Sidebar] Failed to load data:", err);
  }

  try {
    statuses = await getTaskStatuses();
  } catch {
    // table may not exist yet — show nothing until migration is run
  }

  const activeProjectId = rawActiveId ?? projects[0]?.id ?? "";
  let plans: Awaited<ReturnType<typeof getPlansByProject>> = [];
  try {
    plans = activeProjectId ? await getPlansByProject(activeProjectId) : [];
  } catch (err) {
    console.error("[Sidebar] Failed to load plans:", err);
  }

  return (
    <aside className="w-60 flex-shrink-0 bg-brand-navy flex flex-col h-screen shadow-2xl">
      <div className="px-6 pt-8 pb-6 border-b border-white/5 flex flex-col items-center">
        <BrandLogo className="w-28" showText={false} />
        <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold mt-4">Project Tracker</p>
      </div>

      <ProjectSwitcher projects={projects} activeProjectId={activeProjectId} />

      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <SidebarLink href="/" label="Dashboard" icon="⬛" exact />

        <div className="pt-2 pb-1 px-1">
          <p className="text-white/20 text-[9px] uppercase tracking-[0.2em] font-black">Workstreams</p>
        </div>

        {plans.map(plan => (
          <SidebarLink
            key={plan.id}
            href={`/plan/${plan.id}`}
            label={plan.name}
            icon="📋"
          />
        ))}

        {activeProjectId && (
          <NewWorkstreamButton projectId={activeProjectId} />
        )}

        <div className="pt-2 pb-1 px-1">
          <p className="text-white/20 text-[9px] uppercase tracking-[0.2em] font-black">Views</p>
        </div>

        <SidebarLink href="/roadmap" label="Roadmap" icon="🗺️" />
        <SidebarLink href="/settings" label="Settings" icon="⚙️" />
      </nav>

      <div className="px-6 pb-6 space-y-2">
        <p className="text-white/20 text-[10px] uppercase tracking-widest font-black mb-3">Priority Status</p>
        {statuses.map(s => (
          <div key={s.id} className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-white/40 text-[11px] font-medium">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="px-6 pb-8 border-t border-white/5 pt-6 flex items-center gap-3">
        <div className="flex-1">
          <SignOutButton />
        </div>
        <NotificationBell notifications={notifications} unreadCount={unreadCount} />
      </div>
    </aside>
  );
}
