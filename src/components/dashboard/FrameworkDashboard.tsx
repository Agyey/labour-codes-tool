"use client";

import { useData } from "@/context/DataContext";
import { useUI } from "@/context/UIContext";
import { FolderKanban, Scale, ChevronRight, Activity, Pencil, Trash2, PieChart, Plus, BarChart3, Edit2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";
import { FrameworkModal } from "./FrameworkModal";
import { Framework } from "@/types/provision";
import { PdfUploadWizard } from "@/components/parsers/PdfUploadWizard";

import { ModuleHeader } from "@/components/shared/ModuleHeader";

export function FrameworkDashboard() {
  const { frameworks, loading, deleteFramework, canEdit } = useData();
  const { setActiveView, setActiveCode } = useUI();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFw, setEditingFw] = useState<Framework | null>(null);
  const [showPdfWizard, setShowPdfWizard] = useState(false);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-64 bg-slate-100 dark:bg-zinc-800 rounded-[32px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {showPdfWizard && <PdfUploadWizard onClose={() => setShowPdfWizard(false)} />}
      <ModuleHeader 
        title="Legal Operations Nexus"
        description="Central intelligence for complex legal frameworks. Manage legislations, rules, and connectors within their respective buckets."
        icon={FolderKanban}
        actions={
          canEdit && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowPdfWizard(true)}
                className="px-6 py-3 bg-emerald-600 text-white text-[12px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl shadow-emerald-600/20 whitespace-nowrap flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Act (PDF)
              </button>
              <button 
                onClick={() => { setEditingFw(null); setIsModalOpen(true); }}
                className="px-6 py-3 bg-indigo-600 text-white text-[12px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl shadow-indigo-600/20 whitespace-nowrap"
              >
                Create New Bucket
              </button>
            </div>
          )
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {frameworks.length === 0 ? (
           <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-[40px] bg-slate-50/50 dark:bg-zinc-900/50">
              <FolderKanban className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-700 mb-4" />
              <p className="text-lg font-bold text-slate-400 dark:text-zinc-600">No frameworks initialized yet.</p>
           </div>
        ) : (
          frameworks.map((fw) => (
             <div 
              key={fw.id}
              onClick={() => {
                setActiveCode(fw.shortName as any || fw.id);
                setActiveView('bucket');
              }}
              className="group relative flex flex-col p-8 bg-white dark:bg-zinc-900 rounded-[40px] border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-500 text-left overflow-hidden cursor-pointer"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none select-none">
                <Scale className="w-32 h-32 rotate-12" />
              </div>

              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <FolderKanban className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Legal Container</span>
                </div>
                                {canEdit && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all relative z-20">
                  <button 
                    type="button"
                    title="Analytics"
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); toast.success("Analytics coming soon!"); }}
                    className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-all"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    title="Edit Bucket"
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); setEditingFw(fw); setIsModalOpen(true); }}
                    className="p-2 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    title="Delete Bucket"
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); deleteFramework(fw.id); }}
                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                )}
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-3">
                {fw.name}
              </h3>
              
              <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium line-clamp-2 mb-8 flex-grow">
                {fw.description || "Comprehensive framework mapping sections, rules, and repealed legislations."}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-zinc-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                     <Activity className="w-3.5 h-3.5" />
                     <span className="text-[10px] font-black uppercase tracking-tighter">In Force</span>
                  </div>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{(fw.legislations || []).filter(l => !l.isRepealed).length}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                     <Scale className="w-3.5 h-3.5" />
                     <span className="text-[10px] font-black uppercase tracking-tighter">Repealed</span>
                  </div>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{(fw.legislations || []).filter(l => l.isRepealed).length}</p>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {(fw.legislations || []).slice(0, 3).map((l, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-4 border-white dark:border-zinc-900 bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-[8px] font-black overflow-hidden shadow-sm" style={{ backgroundColor: l.color || '#6366f1' }}>
                      <span className="text-white uppercase">{l.shortName[0]}</span>
                    </div>
                  ))}
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-zinc-800 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <FrameworkModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editingFramework={editingFw}
      />
    </div>
  );
}
