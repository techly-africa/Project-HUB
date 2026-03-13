import { cookies } from "next/headers";

export const ACTIVE_PROJECT_COOKIE = "active_project_id";

export async function getActiveProjectId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(ACTIVE_PROJECT_COOKIE)?.value ?? null;
}
