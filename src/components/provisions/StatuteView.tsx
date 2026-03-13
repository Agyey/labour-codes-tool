"use client";

import { motion } from "framer-motion";
import { FileText, Eye, EyeOff, Scale, Gavel, Link2, ChevronDown, ChevronRight, Trash2, Layers, BookOpen } from "lucide-react";
import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
import type { Provision } from "@/types/provision";
import { useState } from "react";

interface StatuteViewProps {
  provision: Provision;
  codeShortName: string;
}

export function StatuteView({ provision: p, codeShortName }: StatuteViewProps) {
  const { mode, showTextMap, toggleShowText } = useUI();
  const { saveProvision } = useData();
  const [showSubSections, setShowSubSections] = useState(false);

  const isRule = p.provisionType === 'rule';
  const TypeIcon = isRule ? Gavel : Scale;

  const handleDeleteSubSection = async (index: number) => {
    if (!confirm("Are you sure you want to delete this sub-section/clause?")) return;
    
    const updatedSubSections = [...(p.subSections || [])];
    updatedSubSections.splice(index, 1);
    
    await saveProvision({
      ...p,
      subSections: updatedSubSections
    });
  };

  return (
    <div className="p-5 bg-slate-50 dark:bg-zinc-900/50 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
            isRule 
              ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
              : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
          }`}>
            <TypeIcon className="w-3 h-3 inline-block mr-1 -mt-0.5" />
            {isRule ? 'Rule' : 'Section'}
          </span>
          <div className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            {codeShortName} {isRule ? 'R.' : 'S.'}{p.sec}{p.sub}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {p.parentSection && (
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
              <Link2 className="w-3 h-3" /> Implements S.{p.parentSection}
            </span>
          )}
          <button
            onClick={() => toggleShowText(`n-${p.id}`)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-slate-600 dark:text-zinc-400 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
          >
            {showTextMap[`n-${p.id}`] ? (
              <><EyeOff className="w-3 h-3" /> Hide Text</>
            ) : (
              <><Eye className="w-3 h-3" /> Read Statute</>
            )}
          </button>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="text-[15px] text-slate-800 dark:text-zinc-100 leading-relaxed font-medium">
        {p.summary}
      </div>
      
      {/* Sub-sections */}
      {(p.subSections || []).length > 0 && (
        <div className="mt-4">
          <button 
            onClick={() => setShowSubSections(!showSubSections)}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition-colors mb-2"
          >
            {showSubSections ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            {p.subSections.length} Sub-sections
          </button>
          {showSubSections && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2 pl-3 border-l-2 border-indigo-200 dark:border-indigo-800"
            >
              {p.subSections.map((sub, i) => (
                <div key={i} className="py-2 text-sm text-slate-700 dark:text-zinc-300 flex items-start justify-between group/sub">
                  <div className="flex-1">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1.5">{sub.marker}</span>
                    <span className="leading-relaxed">{sub.text}</span>
                  </div>
                  {mode === 'admin' && (
                    <button 
                      onClick={() => handleDeleteSubSection(i)}
                      className="opacity-0 group-hover/sub:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all ml-2"
                      title="Delete Clause"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* Compliance Stack */}
      {(!isRule && ((p.linkedRuleRefs || []).length > 0 || (p.forms || []).length > 0)) && (
        <div className="mt-5 border-t border-slate-200/60 dark:border-zinc-800/80 pt-4">
          <div className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> Compliance Stack
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(p.linkedRuleRefs || []).length > 0 && (
              <div className="p-3 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl">
                <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Gavel className="w-3 h-3" /> Implementing Rules
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.linkedRuleRefs.map((ref, i) => (
                    <span key={i} className="text-xs font-semibold text-amber-800 dark:text-amber-200 bg-white dark:bg-zinc-800 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-700/30 shadow-sm">
                      {ref}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {(p.forms || []).length > 0 && (
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-xl">
                <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-3 h-3" /> Forms & Registers
                </div>
                <div className="flex flex-col gap-2">
                  {p.forms.map((form, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-800 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-700/30 shadow-sm">
                      <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-0.5">
                        {form.ref.toLowerCase().includes('register') ? <BookOpen className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                        {form.ref}
                      </div>
                      <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 leading-snug">
                        {form.summary}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Full Statutory Text (formatted, not <pre>) */}
      {showTextMap[`n-${p.id}`] && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60"
        >
          <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Original Statutory Text</div>
          <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl text-sm text-slate-700 dark:text-zinc-300 font-serif leading-[1.8] max-h-[400px] overflow-auto shadow-inner">
            {p.fullText.split('\n').map((para, i) => {
              if (!para.trim()) return <div key={i} className="h-3" />;
              
              // Detect sub-section markers and style them
              const isMarker = para.trim().match(/^\([a-z0-9ivxlcdm]+\)/i) || para.trim().match(/^Proviso/i) || para.trim().match(/^Explanation/i);
              
              return (
                <p key={i} className={`mb-1 ${isMarker ? 'pl-6 text-[13px]' : ''}`}>
                  {isMarker && <span className="font-bold text-indigo-600 dark:text-indigo-400">{para.trim().match(/^(\([a-z0-9ivxlcdm]+\)|Proviso|Explanation)/i)?.[0]}</span>}
                  {isMarker ? para.trim().replace(/^(\([a-z0-9ivxlcdm]+\)|Proviso|Explanation)/i, '') : para}
                </p>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
