"use client";

import { motion } from "framer-motion";
import { FileText, Eye, EyeOff } from "lucide-react";
import { useUI } from "@/context/UIContext";
import type { Provision } from "@/types/provision";

interface StatuteViewProps {
  provision: Provision;
  codeShortName: string;
}

export function StatuteView({ provision: p, codeShortName }: StatuteViewProps) {
  const { showTextMap, toggleShowText } = useUI();

  return (
    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" />
          {codeShortName} S.{p.sec}{p.sub} — Executive Summary
        </div>
        <button
          onClick={() => toggleShowText(`n-${p.id}`)}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm"
        >
          {showTextMap[`n-${p.id}`] ? (
            <><EyeOff className="w-3 h-3" /> Hide Text</>
          ) : (
            <><Eye className="w-3 h-3" /> Read Statute</>
          )}
        </button>
      </div>
      <div className="text-[15px] text-slate-800 leading-relaxed font-medium">
        {p.summary}
      </div>
      
      {showTextMap[`n-${p.id}`] && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 pt-4 border-t border-slate-200/60"
        >
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Original Statutory Text</div>
          <pre className="p-4 bg-white border border-slate-100 rounded-xl text-sm text-slate-700 whitespace-pre-wrap font-serif leading-relaxed max-h-[400px] overflow-auto shadow-inner">
            {p.fullText}
          </pre>
        </motion.div>
      )}
    </div>
  );
}
