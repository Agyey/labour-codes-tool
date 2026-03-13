"use client";

import { useLegalOS, ProductType } from "@/context/LegalOSContext";
import { 
  BookOpen, 
  ShieldCheck, 
  FileText, 
  Briefcase 
} from "lucide-react";

const PRODUCTS = [
  { id: "MAPPING", label: "Legal Frameworks", icon: BookOpen, desc: "Universal Provision Definitions", color: "bg-emerald-600", textHover: "group-hover:text-emerald-600" },
  { id: "COMPLIANCE", label: "Entity Compliance", icon: ShieldCheck, desc: "Tracker & Applicability", color: "bg-blue-600", textHover: "group-hover:text-blue-600" },
  { id: "AGREEMENTS", label: "Contract Drafting", icon: FileText, desc: "Modular Templates & Forms", color: "bg-purple-600", textHover: "group-hover:text-purple-600" },
  { id: "DILIGENCE", label: "Due Diligence", icon: Briefcase, desc: "Cap Tables & Hygiene", color: "bg-amber-600", textHover: "group-hover:text-amber-600" },
] as const;

export function AppSidebar() {
  const { activeProduct, setActiveProduct } = useLegalOS();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 min-h-[calc(100vh-120px)] overflow-y-auto transition-colors duration-300">
      <div className="p-4">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-4 px-2">
          Legal OS Suite
        </h3>

        <div className="space-y-1">
          {PRODUCTS.map((prod) => {
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
          })}
        </div>
      </div>
    </aside>
  );
}
