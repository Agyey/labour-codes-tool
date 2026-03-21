import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface ChapterNode {
  chapter_number: string;
  chapter_name: string;
  summary?: string;
  sections?: SectionNode[];
}

interface SectionNode {
  section_number: string;
  title: string;
  summary?: string;
}

interface StructureAnalysis {
  structured_data?: {
    chapters?: ChapterNode[];
  };
}

interface DocumentStructureTabProps {
  analysis: StructureAnalysis | null;
}

export function DocumentStructureTab({ analysis }: DocumentStructureTabProps) {
  return (
    <motion.div
      key="structure"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6"
    >
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-4">
        Document Structure (Vectorless RAG Tree)
      </h3>
      {analysis?.structured_data?.chapters ? (
        <div className="space-y-3">
          {analysis.structured_data.chapters.map((ch: ChapterNode, i: number) => (
            <details key={i} className="group">
              <summary className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 p-3 rounded-xl transition-colors">
                <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  Ch. {ch.chapter_number}
                </span>
                <span className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                  {ch.chapter_name}
                </span>
                <span className="ml-auto text-[10px] text-slate-400">
                  {ch.sections?.length || 0} sections
                </span>
              </summary>
              <div className="ml-8 mt-1 space-y-1">
                <p className="text-xs text-slate-500 dark:text-zinc-500 mb-2 italic">
                  {ch.summary}
                </p>
                {ch.sections?.map((sec: SectionNode, j: number) => (
                  <details key={j} className="group/sec">
                    <summary className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 p-2 rounded-lg transition-colors">
                      <ChevronRight className="w-3 h-3 text-slate-400 group-open/sec:rotate-90 transition-transform" />
                      <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400">
                        §{sec.section_number}
                      </span>
                      <span className="text-xs text-slate-700 dark:text-zinc-300">
                        {sec.title}
                      </span>
                    </summary>
                    <div className="ml-6 p-2">
                      <p className="text-xs text-slate-500 dark:text-zinc-500">
                        {sec.summary}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            </details>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">Structure data not available.</p>
      )}
    </motion.div>
  );
}
