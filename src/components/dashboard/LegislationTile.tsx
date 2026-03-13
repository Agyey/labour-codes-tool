"use client";

import { Legislation } from "@/types/provision";
import { Scale, FileText, CheckCircle2, Trash2 } from "lucide-react";

interface LegislationTileProps {
  legislation: Legislation & { provisions?: { id: string }[] };
  onSelect: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
}

export function LegislationTile({ legislation, onSelect, onDelete, canEdit }: LegislationTileProps) {
  const provCount = legislation.provisions?.length || 0;
  
  return (
    <div 
      className="group relative bg-white dark:bg-zinc-900 rounded-[32px] border border-slate-200 dark:border-zinc-800 p-6 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-zinc-950/50 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
          style={{ backgroundColor: legislation.color || '#6366f1' }}
        >
          {legislation.type === 'act' || legislation.type === 'repealed_act' ? (
            <Scale className="w-6 h-6" />
          ) : (
            <FileText className="w-6 h-6" />
          )}
        </div>
        
        <div className="flex gap-2">
          {legislation.isRepealed && (
            <div className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              Repealed
            </div>
          )}
          {!legislation.isRepealed && (
            <div className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              Live
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1 mb-6">
        <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight line-clamp-2">
          {legislation.name}
        </h3>
        <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
          {legislation.shortName} • {legislation.year || 'No Year'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-zinc-800/50">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-slate-500 dark:text-zinc-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">{provCount} Provisions</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {canEdit && (
            <button 
              onClick={(e) => { e.stopPropagation(); if (confirm("Delete this legislation tile?")) onDelete?.(); }}
              className="p-2.5 bg-slate-50 dark:bg-zinc-800 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-xl transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onSelect}
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md"
          >
            Open
          </button>
        </div>
      </div>
    </div>
  );
}
