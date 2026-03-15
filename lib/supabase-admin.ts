import { createClient } from "@supabase/supabase-js";

// Uses the service role key — bypasses RLS. Server-only. Never expose to client.
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase service role env vars");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
