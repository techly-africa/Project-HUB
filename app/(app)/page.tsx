import { getProjects, getPlanWithStatsByProject, getProfile } from "@/lib/queries";
import { getActiveProjectId } from "@/lib/active-project";
import Dashboard from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [projects, rawActiveId, profile] = await Promise.all([getProjects(), getActiveProjectId(), getProfile()]);
  const project = projects.find(p => p.id === rawActiveId) ?? projects[0];
  const plans = project ? await getPlanWithStatsByProject(project.id) : [];
  if (!project) return <div className="p-8 text-slate-400">No projects found.</div>;
  return <Dashboard project={project} plans={plans} profile={profile} />;
}
