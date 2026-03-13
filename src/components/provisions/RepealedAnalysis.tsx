"use client";

import { motion } from "framer-motion";
import { ScrollText, AlertTriangle } from "lucide-react";
import { useUI } from "@/context/UIContext";
import { Badge } from "@/components/shared/Badge";
import { CHANGE_TAG_COLORS } from "@/config/tags";
import type { Provision } from "@/types/provision";

interface RepealedAnalysisProps {
  provision: Provision;
}

export function RepealedAnalysis({ provision: p }: RepealedAnalysisProps) {
  const { showTextMap, toggleShowText } = useUI();

  if (!p.oldMappings || p.oldMappings.length === 0) return null;

  return (
    <div className="mt-6">
      <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-100 uppercase tracking-wider mb-3 flex items-center gap-2">
        <ScrollText className="w-4 h-4 text-rose-500" />
        Old Act Analysis ({p.oldMappings.length})
      </h4>
      <div className="space-y-3">
        {p.oldMappings.map((m, i) => (
          <div
            key={i}
            className="bg-white dark:bg-zinc-900 border border-rose-100 dark:border-rose-900/30 rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="p-4 bg-rose-50/50 dark:bg-rose-900/10 border-b border-rose-100/50 dark:border-rose-900/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-[4px] text-[10px] tracking-wider uppercase">Old</span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white flex-1">{m.act}</span>
                  </div>
                  <div className="text-sm text-slate-700 dark:text-zinc-300 font-medium leading-relaxed">
                    {m.summary}
                  </div>
                </div>
                  <button
                    onClick={() => toggleShowText(`o-${p.id}-${i}`)}
                    className="flex-shrink-0 px-2.5 py-1.5 bg-white dark:bg-zinc-950 border border-rose-100 dark:border-rose-900/30 rounded-lg text-[10px] font-bold text-rose-600 dark:text-rose-400 cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors shadow-sm"
                  >
                    {showTextMap[`o-${p.id}-${i}`] ? "Hide Text" : "Read Text"}
                  </button>
              </div>
              
              {showTextMap[`o-${p.id}-${i}`] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3"
                >
                  <pre className="p-3 bg-white dark:bg-zinc-950 border border-rose-100 dark:border-rose-900/20 rounded-xl text-xs text-slate-600 dark:text-zinc-400 whitespace-pre-wrap font-serif leading-relaxed max-h-[250px] overflow-auto shadow-inner">
                    {m.fullText}
                  </pre>
                </motion.div>
              )}
            </div>
            <div className="p-4 bg-white dark:bg-zinc-900">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Key Changes
              </div>
              <div className="text-[14px] text-slate-800 dark:text-zinc-100 leading-relaxed font-medium">
                {m.change}
              </div>
              {(m.changeTags || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {m.changeTags.map((t) => (
                    <Badge
                      key={t}
                      text={t}
                      bgColor={CHANGE_TAG_COLORS[t]}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
