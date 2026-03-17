import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { isSuperAdmin } from "@/lib/superadmin-queries";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side re-verification (defence in depth on top of middleware)
  const sb = createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const ok = await isSuperAdmin(user.id);
  if (!ok) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-950 text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top nav */}
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50 bg-slate-950/95 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" />
              </svg>
            </div>
            <span className="text-sm font-black tracking-tight text-white">Project Hub</span>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <span className="text-xs font-black uppercase tracking-widest text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-md border border-violet-500/20">
            Super Admin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 12L6 8L10 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to app
          </a>
          <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-violet-400" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="5" r="3" />
              <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
