"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BookOpen, 
  Layers,
  Network,
  Home,
  LucideIcon
} from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname() || "";

  // Helper render function for buttons
  const renderNavButton = (prod: { href: string; label: string; icon: LucideIcon; desc: string; color: string; textHover: string }) => {
    const Icon = prod.icon;
    const isActive = pathname.startsWith(prod.href);

    return (
      <Link
        key={prod.href}
        href={prod.href}
        className={`w-full text-left px-3 py-3 rounded-xl transition-all cursor-pointer group flex items-start gap-3 ${
          isActive
            ? `${prod.color} text-white shadow-md shadow-slate-900/10 dark:shadow-none`
            : "hover:bg-slate-100 dark:hover:bg-zinc-800"
        }`}
      >
        <div className={`mt-0.5 ${isActive ? "text-white" : `text-slate-500 dark:text-zinc-400 ${prod.textHover} dark:group-hover:text-zinc-200`}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className={`text-sm font-bold ${isActive ? "text-white" : "text-slate-700 dark:text-zinc-200"}`}>
            {prod.label}
          </div>
          <div className={`text-[10px] ${isActive ? "text-white/80" : "text-slate-400 dark:text-zinc-500"}`}>
            {prod.desc}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 min-h-[calc(100vh-120px)] overflow-y-auto transition-colors duration-300">
      <div className="p-4">
        
        {/* SECTION 1: CORE OS */}
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-4 px-2">
          Legal OS
        </h3>

        <div className="space-y-1 mb-8">
          {renderNavButton({ href: "/dashboard", label: "Home Dashboard", icon: Home, desc: "Firm overview & alerts", color: "bg-blue-600", textHover: "group-hover:text-blue-600" })}
          {renderNavButton({ href: "/library", label: "Knowledge Library", icon: BookOpen, desc: "Structured legal databases", color: "bg-emerald-600", textHover: "group-hover:text-emerald-600" })}
          {renderNavButton({ href: "/scenarios", label: "Scenario Engine", icon: Network, desc: "Auto-generate compliance tasks", color: "bg-amber-600", textHover: "group-hover:text-amber-600" })}
          {renderNavButton({ href: "/matters", label: "Active Matters", icon: Layers, desc: "Collaborative workspaces & tasks", color: "bg-indigo-600", textHover: "group-hover:text-indigo-600" })}
        </div>

      </div>
    </aside>
  );
}
