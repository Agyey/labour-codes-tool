"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUI } from "@/context/UIContext";
import { 
  BookOpen, 
  Layers,
  Network,
  Home,
  Settings,
  ShieldAlert,
  Database,
  Building2,
  Gavel,
  Users,
  Calendar,
  LucideIcon
} from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname() || "";
  const { sidebarOpen, setSidebarOpen } = useUI();

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
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 transition-opacity lg:hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`fixed lg:sticky top-0 lg:top-[73px] left-0 z-50 lg:z-30 w-64 h-full lg:h-[calc(100vh-73px)] border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${sidebarOpen ? 'lg:w-64' : 'lg:w-20'}`}>
        <div className="p-4">
          
          {/* SECTION 1: CORE OS */}
          <h3 className={`text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-4 px-2 truncate transition-opacity ${!sidebarOpen && 'lg:opacity-0'}`}>
            Legal OS
          </h3>

          <div className="space-y-1 mb-6">
            {navItems.map(item => renderNavButton(item))}
          </div>

          {/* SECTION 2: LITIGATION NEXUS */}
          <h3 className={`text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-4 px-2 mt-8 truncate transition-opacity ${!sidebarOpen && 'lg:opacity-0'}`}>
            Litigation Nexus
          </h3>

          <div className="space-y-1 mb-6">
            {litigationItems.map(item => renderNavButton(item))}
          </div>

          {/* SECTION 3: MANAGEMENT */}
          <h3 className={`text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-4 px-2 mt-8 truncate transition-opacity ${!sidebarOpen && 'lg:opacity-0'}`}>
            Management
          </h3>

          <div className="space-y-1">
            {mgmtItems.map(item => renderNavButton(item))}
          </div>

        </div>
      </aside>
    </>
  );
}

// Grouped items for mapping
const navItems = [
  { href: "/dashboard", label: "Home Dashboard", icon: Home, desc: "Firm overview & alerts", color: "bg-blue-600", textHover: "group-hover:text-blue-600" },
  { href: "/library", label: "Knowledge Library", icon: BookOpen, desc: "Structured legal databases", color: "bg-emerald-600", textHover: "group-hover:text-emerald-600" },
  { href: "/scenarios", label: "Scenario Engine", icon: Network, desc: "Auto-generate compliance tasks", color: "bg-amber-600", textHover: "group-hover:text-amber-600" },
  { href: "/diligence", label: "Due Diligence", icon: ShieldAlert, desc: "Target audit & requisition tracking", color: "bg-indigo-500", textHover: "group-hover:text-indigo-500" },
  { href: "/matters", label: "Active Matters", icon: Layers, desc: "Collaborative workspaces & tasks", color: "bg-indigo-600", textHover: "group-hover:text-indigo-600" },
  { href: "/compliance", label: "Compliance Tracker", icon: ShieldAlert, desc: "Regulatory calendar & deadlines", color: "bg-rose-600", textHover: "group-hover:text-rose-600" },
  { href: "/entities", label: "Entity Database", icon: Building2, desc: "Manage client jurisdictions", color: "bg-cyan-600", textHover: "group-hover:text-cyan-600" },
];

const litigationItems = [
  { href: "/litigation", label: "Case Tracker", icon: Gavel, desc: "Court dates & stage tracking", color: "bg-indigo-700", textHover: "group-hover:text-indigo-700" },
  { href: "/litigation/counsel", label: "Counsel Repo", icon: Users, desc: "Empanelled lawyers & fees", color: "bg-slate-700", textHover: "group-hover:text-slate-700" },
  { href: "/litigation/hearings", label: "Hearing Board", icon: Calendar, desc: "Daily cause list & notices", color: "bg-rose-800", textHover: "group-hover:text-rose-800" },
];

const mgmtItems = [
  { href: "/org-settings", label: "Firm Settings", icon: Settings, desc: "Team & Subscriptions", color: "bg-rose-600", textHover: "group-hover:text-rose-600" },
  { href: "/admin", label: "Super Admin", icon: ShieldAlert, desc: "Platform Control Center", color: "bg-slate-800", textHover: "group-hover:text-slate-900" },
];
