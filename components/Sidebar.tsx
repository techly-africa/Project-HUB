"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import BrandLogo from "./BrandLogo";

const nav = [
  { href: "/", label: "Dashboard", icon: "⬛" },
  { href: "/plan/product-tech", label: "Product & Tech", icon: "⚙️" },
  { href: "/plan/legal", label: "Legal", icon: "⚖️" },
  { href: "/plan/biz-dev", label: "Business Dev", icon: "🤝" },
  { href: "/roadmap", label: "Roadmap", icon: "🗺️" },
];

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();

  async function signOut() {
    const sb = getSupabaseBrowserClient();
    await sb.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-60 flex-shrink-0 bg-brand-navy flex flex-col h-screen shadow-2xl">
      <div className="px-6 pt-8 pb-6 border-b border-white/5 flex flex-col items-center">
        <BrandLogo className="w-28" showText={false} />
        <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold mt-4">Project Tracker</p>
      </div>

      <div className="mx-4 mt-6 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
        <p className="text-brand-teal text-[10px] uppercase tracking-widest font-bold">Product</p>
        <p className="text-white text-sm font-bold mt-0.5">Merchant Lending</p>
        <p className="text-white/30 text-[10px] mt-1 italic">Tenor: 60 days</p>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1.5">
        {nav.map(({ href, label, icon }) => {
          const active = path === href;
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${active
                ? "bg-brand-pink text-white font-bold shadow-lg shadow-brand-pink/20 translate-x-1"
                : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}>
              <span className={`text-base leading-none ${active ? "opacity-100" : "opacity-50"}`}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 pb-6 space-y-2">
        <p className="text-white/20 text-[10px] uppercase tracking-widest font-black mb-3">Priority Status</p>
        {[
          { label: "Completed", color: "bg-emerald-400" },
          { label: "In Progress", color: "bg-blue-400" },
          { label: "Critical", color: "bg-red-500" },
          { label: "Blocked", color: "bg-brand-pink" },
          { label: "Not Started", color: "bg-slate-500" },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-3">
            <span className={`w-1.5 h-1.5 rounded-full ${color} shadow-[0_0_8px_rgba(255,255,255,0.1)]`} />
            <span className="text-white/40 text-[11px] font-medium">{label}</span>
          </div>
        ))}
      </div>

      <div className="px-6 pb-8 border-t border-white/5 pt-6">
        <button onClick={signOut}
          className="w-full text-left text-[11px] font-bold uppercase tracking-wider text-white/30 hover:text-brand-teal transition-colors flex items-center gap-2">
          <span>←</span> Sign out
        </button>
      </div>
    </aside>
  );
}
