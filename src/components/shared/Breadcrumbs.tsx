"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
import { ChevronRight, Home, FolderKanban, BookOpen } from "lucide-react";

export function Breadcrumbs() {
  const { activeView, activeCode, setActiveView, setActiveCode } = useUI();
  const { frameworks } = useData();

  if (activeView === 'dashboard') return null;

  const currentFramework = frameworks.find(f => f.shortName === activeCode || f.id === activeCode);

  return (
    <nav className="flex items-center gap-2 mb-6 animate-in fade-in slide-in-from-left-2 duration-300">
      <button
        onClick={() => {
          setActiveView('dashboard');
          setActiveCode(null as any);
        }}
        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        Nexus
      </button>

      <ChevronRight className="w-3 h-3 text-slate-300" />

      {activeView === 'bucket' ? (
        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
          <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />
          {currentFramework?.name || activeCode}
        </span>
      ) : (
        <>
          <button
            onClick={() => setActiveView('bucket')}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <FolderKanban className="w-3.5 h-3.5" />
            {currentFramework?.name || activeCode}
          </button>
          
          <ChevronRight className="w-3 h-3 text-slate-300" />

          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
            Library
          </span>
        </>
      )}
    </nav>
  );
}
