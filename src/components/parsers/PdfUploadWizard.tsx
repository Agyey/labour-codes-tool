"use client";
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */

import { motion } from "framer-motion";
import { FileUp, FileText, CheckCircle2, ShieldAlert, X, Scale } from "lucide-react";
import { usePdfParser } from "@/hooks/usePdfParser";
import { Badge } from "@/components/shared/Badge";
import { useState } from "react";
import toast from "react-hot-toast";
import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";

interface PdfUploadWizardProps {
  onClose: () => void;
}

export function PdfUploadWizard({ onClose }: PdfUploadWizardProps) {
  const { isParsing, parsedResult, setParsedResult, uploadAndParse, resetParser } = usePdfParser();
  const { activeCode } = useUI();
  const { frameworks } = useData();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAndParse(file);
    }
  };

  const getSectionCount = () => {
    if (!parsedResult) return 0;
    return parsedResult.chapters?.reduce((acc: number, ch: any) => acc + (ch.sections?.length || 0), 0) || 0;
  };

  const getTaskCount = () => {
    if (!parsedResult) return 0;
    let counts = 0;
    parsedResult.chapters?.forEach((ch: any) => {
      ch.sections?.forEach((sec: any) => {
        counts += sec.compliance_tasks?.length || 0;
        sec.sub_sections?.forEach((sub: any) => {
          counts += sub.compliance_tasks?.length || 0;
        });
      });
    });
    return counts;
  };

   const [reviewingId, setReviewingId] = useState<string | null>(null);

   const handleReviewSuggestion = async (id: string, action: "approve" | "reject") => {
      setReviewingId(id);
      try {
         // Determine framework ID to pass down (if approving a legislative act)
         const currentFramework = frameworks.find(f => f.shortName === activeCode || f.id === activeCode);
         const frameworkId = currentFramework ? currentFramework.id : activeCode;
         
         const res = await fetch(`/api/suggestions?id=${id}&action=${action}&frameworkId=${frameworkId}`, {
            method: "PATCH",
         });
         
         if (res.ok) {
            toast.success(`Suggestion ${action}d!`);
            // Optimistically update the local state
            setParsedResult((prev: any) => ({
                ...prev,
                suggestions: prev.suggestions.map((s: any) => s.id === id ? { ...s, status: action + "d" } : s)
            }));
         } else {
            const data = await res.json();
            throw new Error(data.error || "Failed to review suggestion");
         }
      } catch (err: any) {
         toast.error(err.message);
      } finally {
         setReviewingId(null);
      }
   };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-5xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-zinc-800"
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-950/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Document Parser (Vectorless RAG AI)
            </h2>
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
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Analyzing & Populating DB...</h3>
              <p className="text-slate-500 max-w-sm">
                LLM strictly extracting into Knowledge Base & Compliance Tracker...
              </p>
            </div>
          ) : !parsedResult ? (
            <div className="flex flex-col items-center justify-center py-20">
              <label className="w-full max-w-2xl flex flex-col items-center justify-center px-6 py-16 border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 rounded-3xl bg-indigo-50/50 dark:bg-indigo-500/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 cursor-pointer transition-colors group">
                <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm flex items-center justify-center mb-6 border border-slate-100 dark:border-zinc-700 group-hover:scale-110 transition-transform">
                  <FileUp className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Select Strict Document (PDF)</h3>
                <p className="text-sm text-slate-500 text-center max-w-sm">
                   Automatically parses and populates the Knowledge Base (Provisions) and Compliance Tracker using AI.
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
              {/* LEFT COLUMN: Summary & Struct Data */}
              <div className="space-y-6">
                 <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-6 flex items-start gap-4">
                   <CheckCircle2 className="w-8 h-8 text-emerald-600 mt-1 flex-shrink-0" />
                   <div className="flex-1">
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                       Knowledge Base & Auto-Population Complete!
                     </h3>
                     <p className="text-sm text-slate-600 dark:text-zinc-400 mb-3 font-medium">
                       {parsedResult.name} ({parsedResult.year})
                     </p>
                     <div className="flex flex-wrap gap-3">
                       <span className="text-xs font-bold px-3 py-1.5 bg-white dark:bg-zinc-800 rounded-lg text-slate-700 dark:text-zinc-300 shadow-sm flex items-center gap-1">
                         <Scale className="w-3 h-3" /> {getSectionCount()} Sections Added
                       </span>
                       <span className="text-xs font-bold px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-700 dark:text-indigo-300 shadow-sm flex items-center gap-1">
                         <ShieldAlert className="w-3 h-3" /> {getTaskCount()} Compliance Tracking Items Logged
                       </span>
                     </div>
                   </div>
                 </div>

                 {/* Data Summary */}
                 <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 max-h-[500px] overflow-y-auto space-y-4">
                    <h4 className="font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2 mb-3">
                      Preview Parsed Summary (Saved to Cloud)
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{parsedResult.summary}</p>
                    
                    <div className="mt-4 space-y-3">
                       {parsedResult.chapters?.map((ch: any, idx: number) => (
                          <div key={idx} className="bg-white dark:bg-zinc-900 p-4 border border-slate-100 dark:border-zinc-800 rounded-xl shadow-sm">
                             <h5 className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                                Chapter {ch.chapter_number}: {ch.chapter_name}
                             </h5>
                             <p className="text-xs text-slate-500 mt-1 line-clamp-3">{ch.summary}</p>
                             <Badge text={`${ch.sections?.length || 0} SECTIONS`} color="#6366f1" className="mt-2 text-[10px]" />
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* RIGHT COLUMN: AI Suggestions Review */}
              <div className="h-full">
                {parsedResult.suggestions && parsedResult.suggestions.length > 0 ? (
                  <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-5 h-full flex flex-col">
                    <h4 className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-4">
                      <ShieldAlert className="w-5 h-5" /> Review AI Suggestions
                    </h4>
                    <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mb-4 font-medium">
                      The AI has identified the following potential knowledge base additions and key differences. Approve suggestions to materialize them.
                    </p>
                    <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                       {parsedResult.suggestions.filter((s: any) => s.status === 'pending').map((suggestion: any) => (
                          <div key={suggestion.id} className="bg-white dark:bg-zinc-900 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4 shadow-[0_4px_20px_-10px_rgba(245,158,11,0.15)] flex flex-col gap-3 transition-opacity" style={{opacity: reviewingId === suggestion.id ? 0.5 : 1}}>
                            <div className="flex justify-between items-start">
                              <Badge text={suggestion.type.replace(/_/g, " ").toUpperCase()} color="#f59e0b" className="text-[10px]" />
                              <span className="text-xs font-bold text-slate-400">{(suggestion.confidence * 100).toFixed(0)}% Confidence</span>
                            </div>
                            
                            {suggestion.type === 'update_provision' ? (
                               <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-lg border border-slate-100 dark:border-zinc-800">
                                 <p className="font-bold text-slate-800 dark:text-zinc-200 text-sm mb-1 uppercase tracking-wide">Amendment / Difference Identified</p>
                                 <p className="text-sm text-slate-700 dark:text-zinc-300 font-medium">{suggestion.suggested_data.description}</p>
                                 <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                    <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-md font-mono">Old Ref: {suggestion.suggested_data.previous_reference || 'N/A'}</span>
                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md font-mono">New Ref: {suggestion.suggested_data.new_reference || 'N/A'}</span>
                                 </div>
                               </div>
                            ) : suggestion.type === 'create_provision' ? (
                               <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-lg border border-slate-100 dark:border-zinc-800">
                                 <p className="font-bold text-slate-800 dark:text-zinc-200 text-[13px] line-clamp-2">Section {suggestion.suggested_data.section}: {suggestion.suggested_data.title}</p>
                                 <p className="text-xs text-slate-500 mt-1 line-clamp-2">{suggestion.suggested_data.summary}</p>
                               </div>
                            ) : (
                               <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-lg border border-slate-100 dark:border-zinc-800">
                                 <p className="font-bold text-slate-800 dark:text-zinc-200 text-[13px]">New {suggestion.target_module.replace("_", " ")} Target</p>
                                 <p className="text-xs text-slate-500 mt-1 line-clamp-2">{JSON.stringify(suggestion.suggested_data)}</p>
                               </div>
                            )}

                            <div className="flex gap-2 justify-end mt-1">
                              <button 
                                onClick={() => handleReviewSuggestion(suggestion.id, "reject")} 
                                disabled={reviewingId !== null}
                                className="px-4 py-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-rose-100 hover:text-rose-600 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                              <button 
                                onClick={() => handleReviewSuggestion(suggestion.id, "approve")} 
                                disabled={reviewingId !== null}
                                className="px-4 py-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 rounded-lg text-xs font-bold transition-colors shadow-sm shadow-emerald-200/50 disabled:opacity-50"
                              >
                                Approve & Record
                              </button>
                            </div>
                          </div>
                       ))}
                       {parsedResult.suggestions.filter((s: any) => s.status === 'pending').length === 0 && (
                          <div className="flex flex-col items-center justify-center py-10 opacity-70">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                            <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">All suggestions reviewed!</p>
                            <p className="text-xs text-slate-500">The knowledge base is up to date.</p>
                          </div>
                       )}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center p-10 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50/50 dark:bg-zinc-950/50">
                     <p className="text-sm text-slate-500 text-center">No AI suggestions generated for this document.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex items-center justify-end">
           {parsedResult ? (
              <button 
                onClick={() => {
                   onClose();
                   window.location.reload();
                }}
                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl transition-colors hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
              >
                Close and Refresh Dashboard
              </button>
           ) : (
             <button 
                onClick={onClose}
                className="px-6 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 dark:text-zinc-400 dark:hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-50"
                disabled={isParsing}
              >
                Cancel
              </button>
           )}
        </div>
      </motion.div>
    </div>
  );
}
