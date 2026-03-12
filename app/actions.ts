"use server";

import { revalidatePath } from "next/cache";
import { updateTaskStatus } from "@/lib/queries";
import type { TaskStatus } from "@/lib/types";

export async function updateStatus(taskId: string, status: TaskStatus, planType: string) {
  await updateTaskStatus(taskId, status);
  revalidatePath("/");
  revalidatePath(`/plan/${planType}`);
}
