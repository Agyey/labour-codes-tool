"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollText, AlertTriangle, Eye, EyeOff, Pencil, Check, X, Scale, ChevronDown, ChevronRight } from "lucide-react";
import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
import { Badge } from "@/components/shared/Badge";
import { CHANGE_TAG_COLORS } from "@/config/tags";
import type { Provision, OldMapping } from "@/types/provision";

interface RepealedAnalysisProps {
  provision: Provision;
}

interface EditableMapping {
  idx: number;
  summary: string;
  change: string;
}

export function RepealedAnalysis({ provision: p }: RepealedAnalysisProps) {
  const { showTextMap, toggleShowText } = useUI();
  const { canEdit, saveProvision } = useData();
  const [editing, setEditing] = useState<EditableMapping | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  if (!p.oldMappings || p.oldMappings.length === 0) return null;

  const toggleCard = (idx: number) => {
    setExpandedCards(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    const updated = { ...p };
    const mappings = [...(updated.oldMappings || [])];
    mappings[editing.idx] = {
      ...mappings[editing.idx],
      summary: editing.summary,
      change: editing.change,
    };
    updated.oldMappings = mappings;
    await saveProvision(updated);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
        <ScrollText className="w-4 h-4 text-rose-500" />
        Repealed Provisions ({p.oldMappings.length})
      </h4>

      {p.oldMappings.map((m, i) => {
        const isExpanded = expandedCards[i];
        const isEditing = editing?.idx === i;

        return (
          <div
            key={i}
            className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-zinc-800 hover:shadow-md transition-shadow"
          >
            {/* Card Header — matches StatuteView visual hierarchy */}
            <button
              onClick={() => toggleCard(i)}
              className="w-full p-4 text-left flex items-center gap-3 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 flex-shrink-0">
                REPEALED
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-slate-900 dark:text-white truncate">{m.act}</div>
                <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  {m.sec && <span className="font-semibold">S.{m.sec}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(m.changeTags || []).slice(0, 2).map(t => (
                  <Badge key={t} text={t} bgColor={CHANGE_TAG_COLORS[t]} className="text-[9px] py-0.5" />
                ))}
                {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {/* Expanded Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-slate-100 dark:border-zinc-800">
                    {/* Summary section — editable */}
                    <div className="p-4 bg-slate-50/50 dark:bg-zinc-950/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Old Provision Summary</div>
                        {canEdit && !isEditing && (
                          <button 
                            onClick={() => setEditing({ idx: i, summary: m.summary, change: m.change })}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      
                      {isEditing ? (
                        <div className="space-y-3">
                          <textarea
                            value={editing!.summary}
                            onChange={(e) => setEditing({ ...editing!, summary: e.target.value })}
                            rows={3}
                            className="w-full text-sm text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                          />
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">What Changed</div>
                            <textarea
                              value={editing!.change}
                              onChange={(e) => setEditing({ ...editing!, change: e.target.value })}
                              rows={3}
                              className="w-full text-sm text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={handleSaveEdit} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors">
                              <Check className="w-3 h-3" /> Save
                            </button>
                            <button onClick={() => setEditing(null)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors">
                              <X className="w-3 h-3" /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                          {m.summary}
                        </div>
                      )}
                    </div>

                    {/* Full Text Toggle */}
                    <div className="px-4 py-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Original Text</div>
                      <button
                        onClick={() => toggleShowText(`o-${p.id}-${i}`)}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-[10px] font-bold text-slate-600 dark:text-zinc-400 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                      >
                        {showTextMap[`o-${p.id}-${i}`] ? (
                          <><EyeOff className="w-3 h-3" /> Hide</>
                        ) : (
                          <><Eye className="w-3 h-3" /> Read</>
                        )}
                      </button>
                    </div>

                    {showTextMap[`o-${p.id}-${i}`] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="px-4 pb-4"
                      >
                        <div className="p-3 bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-xl text-xs text-slate-600 dark:text-zinc-400 font-serif leading-[1.8] max-h-[250px] overflow-auto shadow-inner">
                          {m.fullText.split('\n').map((para, pi) => (
                            <p key={pi} className={`mb-1 ${!para.trim() ? 'h-2' : ''}`}>{para}</p>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Key Changes (non-editing mode) */}
                    {!isEditing && (
                      <div className="p-4 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800">
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
                              <Badge key={t} text={t} bgColor={CHANGE_TAG_COLORS[t]} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
