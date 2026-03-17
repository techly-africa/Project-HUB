"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
  className?: string;
  isCollapsed?: boolean;
}

export function SidebarLink({ href, label, icon, exact, className, isCollapsed }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 ${
        isActive
          ? "text-accent-primary"
          : "text-secondary hover:text-white"
      } ${className || ""}`}
    >
      {/* Active Background Pill */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active-bg"
          className="absolute inset-0 bg-accent-primary/10 border border-accent-primary/20 rounded-xl shadow-[inset_0_0_12px_rgba(20,184,166,0.05)]"
          initial={false}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}

      {/* Active Accent Bar */}
      {isActive && (
        <motion.div 
          layoutId="sidebar-active-bar"
          className="absolute left-[-4px] w-1.5 h-5 bg-accent-primary rounded-full shadow-[0_0_15px_rgba(20,184,166,0.6)]"
          initial={false}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}

      <motion.div 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`relative z-10 flex items-center justify-center transition-colors duration-300 ${isActive ? "text-accent-primary" : "text-muted group-hover:text-white"}`}
      >
        {icon}
      </motion.div>

      {!isCollapsed && (
        <span className={`relative z-10 truncate font-semibold tracking-tight transition-colors duration-300 ${isActive ? "text-white" : ""}`}>
          {label}
        </span>
      )}

      {isActive && !isCollapsed && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative z-10 ml-auto w-1 h-1 rounded-full bg-accent-primary shadow-[0_0_8px_rgba(20,184,166,0.8)]" 
        />
      )}
    </Link>
  );
}
