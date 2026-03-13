"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
}

export function SidebarLink({ href, label, icon, exact }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
        isActive
          ? "bg-white/10 text-white"
          : "text-white/40 hover:text-white/70 hover:bg-white/5"
      }`}
    >
      <span className="text-base leading-none">{icon}</span>
      <span className="truncate">{label}</span>
      {isActive && <span className="ml-auto w-1 h-1 rounded-full bg-brand-teal flex-shrink-0" />}
    </Link>
  );
}
