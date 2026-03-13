"use client";

import { useLegalOS, ProductType } from "@/context/LegalOSContext";
import { 
  BookOpen, 
  ShieldCheck, 
  FileText, 
  Briefcase,
  LayoutDashboard,
  Layers,
  LucideIcon
} from "lucide-react";

export function AppSidebar() {
  const { activeProduct, setActiveProduct } = useLegalOS();

  // Helper render function for buttons
  const renderNavButton = (prod: { id: string; label: string; icon: LucideIcon; desc: string; color: string; textHover: string }) => {
    const Icon = prod.icon;
    const isActive = activeProduct === prod.id;

    return (
      <button
        key={prod.id}
        onClick={() => setActiveProduct(prod.id as ProductType)}
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
      </button>
    );
  };

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 min-h-[calc(100vh-120px)] overflow-y-auto transition-colors duration-300">
      <div className="p-4">
        
        {/* SECTION 1: KNOWLEDGE LIBRARY */}
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-4 px-2">
          Knowledge Library
        </h3>

        <div className="space-y-1 mb-8">
          {renderNavButton({ id: "MAPPING", label: "Legal Frameworks", icon: BookOpen, desc: "Universal Provision Definitions", color: "bg-emerald-600", textHover: "group-hover:text-emerald-600" })}
          {renderNavButton({ id: "AGREEMENTS", label: "Template Vault", icon: FileText, desc: "Modular Drafting & Form Generation", color: "bg-purple-600", textHover: "group-hover:text-purple-600" })}
          {renderNavButton({ id: "COMPLIANCE", label: "Entity Compliance", icon: ShieldCheck, desc: "Applicability Matrices", color: "bg-blue-600", textHover: "group-hover:text-blue-600" })}
          {renderNavButton({ id: "DILIGENCE", label: "Master Checklists", icon: Briefcase, desc: "Corporate Hygiene Rules", color: "bg-amber-600", textHover: "group-hover:text-amber-600" })}
        </div>

        {/* SECTION 2: WORKSPACE & EXECUTION */}
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-4 px-2 flex items-center gap-2">
          <Layers className="w-3 h-3" /> Execution Engine
        </h3>

        <div className="space-y-1 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 p-2 border border-indigo-100 dark:border-indigo-900/50">
          {renderNavButton({ id: "WORKFLOW_DASH", label: "Firm Overview", icon: LayoutDashboard, desc: "Kanban of all active deals", color: "bg-indigo-600", textHover: "group-hover:text-indigo-600" })}
          {renderNavButton({ id: "WORKSPACE", label: "Active Deal Room", icon: Layers, desc: "13-Stage VC/PE Execution", color: "bg-indigo-600", textHover: "group-hover:text-indigo-600" })}
        </div>

      </div>
    </aside>
  );
}
