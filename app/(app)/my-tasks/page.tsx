import { getMyTasks } from "@/lib/queries";
import MyTasksKanbanView from "@/components/MyTasksKanbanView";

export default async function MyTasksPage() {
  const tasks = await getMyTasks();

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-contrast tracking-tight">My Tasks</h1>
        <p className="text-sm text-muted mt-1 uppercase tracking-widest font-bold">Personal Workload Terminal</p>
      </div>

      <MyTasksKanbanView tasks={tasks} />
    </div>
  );
}
