"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, FileText, CheckCircle2, ShieldAlert, BookX, ArrowRight, Loader2, X } from "lucide-react";
import { usePdfParser, ParsedData } from "@/hooks/usePdfParser";
import { Badge } from "@/components/shared/Badge";
import { useUI } from "@/context/UIContext";

interface PdfUploadWizardProps {
  onClose: () => void;
}

export function PdfUploadWizard({ onClose }: PdfUploadWizardProps) {
  const { isParsing, parsedResult, uploadAndParse, resetParser } = usePdfParser();
  const { activeCode } = useUI();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAndParse(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-zinc-800"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-950/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              AI Document Parser
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Upload Official Gazette PDFs to instantly extract structured compliance data.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isParsing ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <FileText className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Analyzing Document...</h3>
              <p className="text-slate-500 max-w-sm">Applying Legal Heuristics to extract Chapters, Sections, Penalties, and Repealed Acts.</p>
            </div>
          ) : !parsedResult ? (
            <div className="flex flex-col items-center justify-center py-20">
              <label className="w-full max-w-2xl flex flex-col items-center justify-center px-6 py-16 border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 rounded-3xl bg-indigo-50/50 dark:bg-indigo-500/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 cursor-pointer transition-colors group">
                <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm flex items-center justify-center mb-6 border border-slate-100 dark:border-zinc-700 group-hover:scale-110 transition-transform">
                  <FileUp className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Select PDF Document</h3>
                <p className="text-sm text-slate-500 text-center max-w-sm">
                  Upload the official act, rules, or gazette notification. Recommended size: &lt; 10MB.
                </p>
                <input 
                  type="file" 
                  accept="application/pdf" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>
            </div>
          ) : (
            <div className="space-y-8 pb-10">
              {/* Extraction Summary Hero */}
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-6 flex items-start gap-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Extraction Complete</h3>
                  <p className="text-sm text-slate-600 dark:text-zinc-400 mb-4">
                    The heuristic engine successfully parsed the document structure. Review the extracted datasets below before appending them to the Knowledge Library.
                  </p>
                  <div className="flex gap-4">
                     <span className="text-xs font-bold px-3 py-1.5 bg-white dark:bg-zinc-800 rounded-lg text-slate-700 dark:text-zinc-300 shadow-sm">
                       {parsedResult.chapters.length} Chapters Found
                     </span>
                     <span className="text-xs font-bold px-3 py-1.5 bg-white dark:bg-zinc-800 rounded-lg text-slate-700 dark:text-zinc-300 shadow-sm">
                       {parsedResult.sections.length} Sections Extracted
                     </span>
                  </div>
                </div>
              </div>

              {/* Data Grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Penalties Captured */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 bg-rose-50/50 dark:bg-rose-500/5 flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                       <ShieldAlert className="w-4 h-4 text-rose-500" /> Penalties Detected
                    </h4>
                    <Badge text={String(parsedResult.penalties.length)} color="#f43f5e" className="px-2" />
                  </div>
                  <div className="p-5">
                    {parsedResult.penalties.length === 0 ? (
                      <p className="text-sm text-slate-500 italic">No explicit penalties detected in text.</p>
                    ) : (
                      <ul className="space-y-3">
                        {parsedResult.penalties.map((pen, i) => (
                           <li key={i} className="text-xs text-slate-600 dark:text-zinc-400 pb-3 border-b border-slate-100 dark:border-zinc-800 last:border-0 last:pb-0">
                             "{pen}"
                           </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Repealed Acts */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 bg-amber-50/50 dark:bg-amber-500/5 flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                       <BookX className="w-4 h-4 text-amber-500" /> Repeals Identified
                    </h4>
                    <Badge text={String(parsedResult.repealedActs.length)} color="#f59e0b" className="px-2" />
                  </div>
                  <div className="p-5">
                    {parsedResult.repealedActs.length === 0 ? (
                      <p className="text-sm text-slate-500 italic">No repealed acts found in 'Savings & Repeal' clause.</p>
                    ) : (
                      <ul className="space-y-3">
                        {parsedResult.repealedActs.map((act, i) => (
                           <li key={i} className="text-xs font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" /> {act}
                           </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Section Preview */}
              <div>
                <h4 className="font-bold text-slate-800 dark:text-zinc-100 mb-3 px-1">Raw Section Output (Preview)</h4>
                <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 max-h-[300px] overflow-y-auto space-y-4">
                   {parsedResult.sections.slice(0, 5).map((sec, i) => (
                     <div key={i} className="bg-white dark:bg-zinc-900 p-4 border border-slate-100 dark:border-zinc-800 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Chapter {sec.ch || "?"}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Section {sec.sec}</span>
                        </div>
                        <h5 className="text-sm font-bold text-slate-800 dark:text-zinc-100 mb-2 truncate">{sec.title}</h5>
                        <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">{sec.text}</p>
                     </div>
                   ))}
                   {parsedResult.sections.length > 5 && (
                     <div className="text-center py-2 text-xs font-bold text-slate-500">
                       + {parsedResult.sections.length - 5} more sections...
                     </div>
                   )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex items-center justify-between">
           {parsedResult ? (
             <>
              <button 
                onClick={resetParser}
                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                disabled={isParsing}
              >
                Start Over
              </button>
              <button 
                onClick={() => {
                  alert("Phase 4 Pipeline Active: Under construction, but this data will directly hydrate the Postgres Knowledge Graph!");
                  onClose();
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
              >
                Inject into Library <ArrowRight className="w-4 h-4" />
              </button>
             </>
           ) : (
             <button 
                onClick={onClose}
                className="px-6 py-2 ml-auto text-sm font-bold text-slate-600 hover:bg-slate-200 dark:text-zinc-400 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
           )}
        </div>
      </motion.div>
    </div>
  );
}
