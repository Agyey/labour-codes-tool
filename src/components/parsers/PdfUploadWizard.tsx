"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, FileText, CheckCircle2, ShieldAlert, BookX, ArrowRight, Loader2, X, Scale, Gavel, ChevronDown, ChevronRight, Link2 } from "lucide-react";
import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
import { createBlankProvision } from "@/lib/utils";
import toast from "react-hot-toast";
import { CODES } from "@/config/codes";
import { CodeKey } from "@/types/code";
import { usePdfParser, ParsedData, ParsedSection } from "@/hooks/usePdfParser";
import { Badge } from "@/components/shared/Badge";

interface PdfUploadWizardProps {
  onClose: () => void;
}

function SectionPreviewCard({ sec, index }: { sec: ParsedSection; index: number }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="bg-white dark:bg-zinc-900 p-4 border border-slate-100 dark:border-zinc-800 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Chapter {sec.ch || "?"}
        </span>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
          sec.type === 'rule' 
            ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20' 
            : 'text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20'
        }`}>
          {sec.type === 'rule' ? `Rule ${sec.sec}` : `Section ${sec.sec}`}
        </span>
        {sec.parentSection && (
          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded">
            <Link2 className="w-3 h-3" /> See S.{sec.parentSection}
          </span>
        )}
      </div>
      <h5 className="text-sm font-bold text-slate-800 dark:text-zinc-100 mb-2 truncate">{sec.title}</h5>
      <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">{sec.text}</p>
      
      {sec.subSections.length > 0 && (
        <div className="mt-3">
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition-colors"
          >
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            {sec.subSections.length} Sub-sections
          </button>
          {expanded && (
            <div className="mt-2 space-y-1 pl-3 border-l-2 border-indigo-100 dark:border-indigo-800">
              {sec.subSections.slice(0, 5).map((sub, i) => (
                <div key={i} className="text-[11px] text-slate-600 dark:text-zinc-400">
                  <span className="font-bold text-indigo-600 dark:text-indigo-300">{sub.marker}</span>{" "}
                  <span className="line-clamp-1">{sub.text.substring(0, 100)}...</span>
                </div>
              ))}
              {sec.subSections.length > 5 && (
                <div className="text-[10px] text-slate-400 italic">+{sec.subSections.length - 5} more...</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function PdfUploadWizard({ onClose }: PdfUploadWizardProps) {
  const { isParsing, parsedResult, uploadAndParse, resetParser } = usePdfParser();
  const { activeCode } = useUI();
  const { saveProvision } = useData();
  const [isInjecting, setIsInjecting] = useState(false);
  const [injectionProgress, setInjectionProgress] = useState({ current: 0, total: 0 });
  const [selectedCode, setSelectedCode] = useState<CodeKey>(activeCode as CodeKey);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAndParse(file);
    }
  };

  const handleInjectData = async () => {
    if (!parsedResult || parsedResult.sections.length === 0) return;
    
    setIsInjecting(true);
    setInjectionProgress({ current: 0, total: parsedResult.sections.length });

    try {
      for (let i = 0; i < parsedResult.sections.length; i++) {
        const extractedSec = parsedResult.sections[i];
        
        const newProv = createBlankProvision(selectedCode);
        newProv.ch = extractedSec.ch || "";
        newProv.chName = extractedSec.chName || "";
        newProv.sec = extractedSec.sec || "";
        newProv.title = extractedSec.title || "";
        newProv.fullText = extractedSec.text || "";
        newProv.provisionType = extractedSec.type;
        newProv.parentSection = extractedSec.parentSection;
        newProv.subSections = extractedSec.subSections || [];
        
        if (parsedResult.penalties.length > 0) {
          newProv.penaltyNew = parsedResult.penalties[0];
        }

        newProv.id = `inserted-${Date.now()}-${i}`;

        await saveProvision(newProv);
        setInjectionProgress({ current: i + 1, total: parsedResult.sections.length });
      }

      toast.success(`Successfully injected ${parsedResult.sections.length} ${parsedResult.metadata.documentType === 'rules' ? 'rules' : 'sections'} into the Library!`);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error("An error occurred during bulk injection.");
    } finally {
      setIsInjecting(false);
    }
  };

  const sectionCount = parsedResult?.sections.filter(s => s.type === 'section').length || 0;
  const ruleCount = parsedResult?.sections.filter(s => s.type === 'rule').length || 0;
  const totalSubSections = parsedResult?.sections.reduce((acc, s) => acc + s.subSections.length, 0) || 0;

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
              AI Document Parser v2
            </h2>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Injecting into:</span>
                <select 
                  value={selectedCode}
                  onChange={(e) => setSelectedCode(e.target.value as CodeKey)}
                  className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded px-2 py-1 outline-none cursor-pointer"
                >
                  {(Object.entries(CODES) as [CodeKey, any][]).map(([key, obj]) => (
                    <option key={key} value={key}>{obj.n}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={() => toast.success("Use the Nexus Dashboard to create new buckets formally.")}
                className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                + Create New Bucket
              </button>
            </div>
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
              <p className="text-slate-500 max-w-sm">Multi-pass pipeline: Index detection → Chapter extraction → Section parsing → Sub-section analysis</p>
            </div>
          ) : !parsedResult ? (
            <div className="flex flex-col items-center justify-center py-20">
              <label className="w-full max-w-2xl flex flex-col items-center justify-center px-6 py-16 border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 rounded-3xl bg-indigo-50/50 dark:bg-indigo-500/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 cursor-pointer transition-colors group">
                <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm flex items-center justify-center mb-6 border border-slate-100 dark:border-zinc-700 group-hover:scale-110 transition-transform">
                  <FileUp className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Select PDF Document</h3>
                <p className="text-sm text-slate-500 text-center max-w-sm">
                  Upload an Act, Code, or Rules document. The parser auto-detects the document type.
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
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Extraction Complete</h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                      parsedResult.metadata.documentType === 'rules' 
                        ? 'bg-amber-100 text-amber-700' 
                        : parsedResult.metadata.documentType === 'act' 
                          ? 'bg-indigo-100 text-indigo-700' 
                          : 'bg-slate-100 text-slate-600'
                    }`}>
                      {parsedResult.metadata.documentType === 'rules' ? '📋 RULES DOCUMENT' : parsedResult.metadata.documentType === 'act' ? '⚖️ ACT / CODE' : '📄 UNKNOWN TYPE'}
                    </span>
                  </div>
                  {parsedResult.metadata.title && (
                    <p className="text-sm text-slate-600 dark:text-zinc-400 mb-3 font-medium">
                      {parsedResult.metadata.title}, {parsedResult.metadata.year}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <span className="text-xs font-bold px-3 py-1.5 bg-white dark:bg-zinc-800 rounded-lg text-slate-700 dark:text-zinc-300 shadow-sm">
                      {parsedResult.chapters.length} Chapters
                    </span>
                    {sectionCount > 0 && (
                      <span className="text-xs font-bold px-3 py-1.5 bg-white dark:bg-zinc-800 rounded-lg text-indigo-700 dark:text-indigo-300 shadow-sm flex items-center gap-1">
                        <Scale className="w-3 h-3" /> {sectionCount} Sections
                      </span>
                    )}
                    {ruleCount > 0 && (
                      <span className="text-xs font-bold px-3 py-1.5 bg-white dark:bg-zinc-800 rounded-lg text-amber-700 dark:text-amber-300 shadow-sm flex items-center gap-1">
                        <Gavel className="w-3 h-3" /> {ruleCount} Rules
                      </span>
                    )}
                    {totalSubSections > 0 && (
                      <span className="text-xs font-bold px-3 py-1.5 bg-white dark:bg-zinc-800 rounded-lg text-slate-700 dark:text-zinc-300 shadow-sm">
                        {totalSubSections} Sub-sections  
                      </span>
                    )}
                    {parsedResult.stats.duplicatesRemoved > 0 && (
                      <span className="text-xs font-bold px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-600 dark:text-rose-400 shadow-sm">
                        {parsedResult.stats.duplicatesRemoved} Index Duplicates Removed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Data Grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Penalties */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 bg-rose-50/50 dark:bg-rose-500/5 flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                       <ShieldAlert className="w-4 h-4 text-rose-500" /> Penalties Detected
                    </h4>
                    <Badge text={String(parsedResult.penalties.length)} color="#f43f5e" className="px-2" />
                  </div>
                  <div className="p-5 max-h-[200px] overflow-y-auto">
                    {parsedResult.penalties.length === 0 ? (
                      <p className="text-sm text-slate-500 italic">No explicit penalties detected.</p>
                    ) : (
                      <ul className="space-y-3">
                        {parsedResult.penalties.map((pen, i) => (
                           <li key={i} className="text-xs text-slate-600 dark:text-zinc-400 pb-3 border-b border-slate-100 dark:border-zinc-800 last:border-0 last:pb-0">
                             &ldquo;{pen}&rdquo;
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
                  <div className="p-5 max-h-[200px] overflow-y-auto">
                    {parsedResult.repealedActs.length === 0 ? (
                      <p className="text-sm text-slate-500 italic">No repealed acts found.</p>
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
                <h4 className="font-bold text-slate-800 dark:text-zinc-100 mb-3 px-1 flex items-center gap-2">
                  Parsed Output Preview
                  <span className="text-xs font-normal text-slate-500">
                    (showing first 8 of {parsedResult.sections.length})
                  </span>
                </h4>
                <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 max-h-[400px] overflow-y-auto space-y-4">
                   {parsedResult.sections.slice(0, 8).map((sec, i) => (
                     <SectionPreviewCard key={i} sec={sec} index={i} />
                   ))}
                   {parsedResult.sections.length > 8 && (
                     <div className="text-center py-2 text-xs font-bold text-slate-500">
                       + {parsedResult.sections.length - 8} more...
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
                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-50"
                disabled={isParsing || isInjecting}
              >
                Start Over
              </button>
              
              {isInjecting ? (
                 <div className="flex items-center gap-3 px-6 py-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm font-bold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Injecting {injectionProgress.current} / {injectionProgress.total}...
                 </div>
              ) : (
                <button 
                  onClick={handleInjectData}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
                >
                  Inject into Library <ArrowRight className="w-4 h-4" />
                </button>
              )}
             </>
           ) : (
             <button 
                onClick={onClose}
                className="px-6 py-2 ml-auto text-sm font-bold text-slate-600 hover:bg-slate-200 dark:text-zinc-400 dark:hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-50"
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
