"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const sb = getSupabaseBrowserClient();
    await sb.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={signOut}
      className="w-full text-left text-[11px] font-bold uppercase tracking-wider text-white/30 hover:text-brand-teal transition-colors flex items-center gap-2"
    >
      <span>←</span> Sign out
    </button>
  );
}
