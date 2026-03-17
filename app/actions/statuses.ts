"use server";

import { revalidatePath } from "next/cache";
import { createTaskStatus, updateTaskStatusConfig, deleteTaskStatus } from "@/lib/queries";

export async function createTaskStatusAction(payload: { value: string; label: string; color: string; display_order: number }) {
  await createTaskStatus(payload);
  revalidatePath("/settings");
  revalidatePath("/", "layout");
}

export async function updateTaskStatusAction(id: string, payload: { label?: string; color?: string; display_order?: number }) {
  await updateTaskStatusConfig(id, payload);
  revalidatePath("/settings");
  revalidatePath("/", "layout");
}

export async function deleteTaskStatusAction(id: string) {
  await deleteTaskStatus(id);
  revalidatePath("/settings");
  revalidatePath("/", "layout");
}
