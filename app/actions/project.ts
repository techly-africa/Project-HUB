"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ACTIVE_PROJECT_COOKIE } from "@/lib/active-project";
import { updateProject, createPlan } from "@/lib/queries";

export async function switchProject(projectId: string) {
  const jar = await cookies();
  jar.set(ACTIVE_PROJECT_COOKIE, projectId, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  redirect("/");
}

export async function updateProjectAction(
  id: string,
  fields: { name: string; description?: string | null; start_date?: string | null; target_date?: string | null }
) {
  await updateProject(id, fields);
  revalidatePath("/");
}

export async function createPlanAction(projectId: string, name: string, color: string) {
  await createPlan(projectId, name, color);
  revalidatePath("/");
}
