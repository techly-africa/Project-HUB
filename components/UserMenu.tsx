"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import Link from "next/link";

interface Props {
  name: string | null;
  email: string;
}

export default function UserMenu({ name, email }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function signOut() {
    const sb = getSupabaseBrowserClient();
    await sb.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = name
    ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : email[0].toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-8 h-8 rounded-full bg-brand-navy text-white text-xs font-black flex items-center justify-center hover:opacity-80 transition-opacity"
        title={name ?? email}
      >
        {initials}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              {name && <p className="text-sm font-bold text-slate-800 truncate">{name}</p>}
              <p className="text-xs text-slate-400 truncate">{email}</p>
            </div>
            <div className="p-1.5">
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <span>⚙️</span> Settings
              </Link>
              <button
                onClick={signOut}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <span>→</span> Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
