import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getPlansWithTasks() {
  const { data: plans, error: plansError } = await supabase
    .from("plans")
    .select("*")
    .order("type");
  if (plansError) throw plansError;

  const result = [];
  for (const plan of plans) {
    const { data: phases, error: phasesError } = await supabase
      .from("phases")
      .select("*")
      .eq("plan_id", plan.id)
      .order("display_order");
    if (phasesError) throw phasesError;

    const phasesWithTasks = [];
    for (const phase of phases) {
      const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("phase_id", phase.id)
        .order("wbs");
      if (tasksError) throw tasksError;
      phasesWithTasks.push({ ...phase, tasks: tasks || [] });
    }
    result.push({ ...plan, phases: phasesWithTasks });
  }
  return result;
}

export async function getPlanByType(type: "tech" | "operational") {
  const { data: plan, error } = await supabase
    .from("plans")
    .select("*")
    .eq("type", type)
    .single();
  if (error) throw error;

  const { data: phases, error: phasesError } = await supabase
    .from("phases")
    .select("*")
    .eq("plan_id", plan.id)
    .order("display_order");
  if (phasesError) throw phasesError;

  const phasesWithTasks = await Promise.all(
    phases.map(async (phase) => {
      const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("phase_id", phase.id)
        .order("wbs");
      if (tasksError) throw tasksError;
      return { ...phase, tasks: tasks || [] };
    })
  );

  return { ...plan, phases: phasesWithTasks };
}

export async function updateTaskStatus(
  taskId: string,
  status: string
): Promise<void> {
  const { error } = await supabase
    .from("tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", taskId);
  if (error) throw error;
}
