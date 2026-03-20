"use client";

import { useState } from "react";
import { ArrowLeftRight, AlertTriangle, CheckCircle, MinusCircle } from "lucide-react";

interface RepealMapping {
  id: string;
  mapping_type: string;
  repealed_unit_type: string;
  repealed_number?: string;
  repealed_title?: string;
  repealed_text?: string;
  replacing_unit_type: string;
  replacing_number?: string;
  replacing_title?: string;
  replacing_text?: string;
  mapping_notes?: string;
  savings_clause_ref?: string;
}

interface RepealDiffViewProps {
  oldActTitle: string;
  newActTitle: string;
  mappings: RepealMapping[];
}

const mappingTypeColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  "Direct Replacement": { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  "Partial Replacement": { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-400", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  "No Equivalent": { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", icon: <MinusCircle className="w-3.5 h-3.5" /> },
  "New Provision": { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-400", icon: <CheckCircle className="w-3.5 h-3.5" /> },
};

export default function RepealDiffView({ oldActTitle, newActTitle, mappings }: RepealDiffViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-emerald-50 dark:from-red-950/30 dark:to-emerald-950/30 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="text-center flex-1">
          <p className="text-xs uppercase tracking-wider text-red-500 font-semibold">Repealed</p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{oldActTitle}</p>
        </div>
        <ArrowLeftRight className="w-6 h-6 text-slate-400 mx-4 shrink-0" />
        <div className="text-center flex-1">
          <p className="text-xs uppercase tracking-wider text-emerald-500 font-semibold">Replacing</p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{newActTitle}</p>
        </div>
      </div>

      {/* Diff Rows */}
      {mappings.map((m) => {
        const style = mappingTypeColors[m.mapping_type] || mappingTypeColors["Direct Replacement"];
        const isExpanded = expandedId === m.id;

        return (
          <div
            key={m.id}
            className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all duration-200"
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : m.id)}
              className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-900 text-left"
            >
              <span className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-full ${style.bg} ${style.text}`}>
                {style.icon}
                {m.mapping_type}
              </span>
              <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
                <span className="text-red-600 dark:text-red-400 line-through opacity-70">
                  {m.repealed_unit_type} {m.repealed_number}: {m.repealed_title || "—"}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {m.replacing_unit_type} {m.replacing_number}: {m.replacing_title || "—"}
                </span>
              </div>
            </button>

            {isExpanded && (
              <div className="grid grid-cols-2 gap-4 p-4 pt-0 border-t border-slate-100 dark:border-slate-800">
                <div className="p-3 bg-red-50/50 dark:bg-red-900/10 rounded-lg">
                  <p className="text-xs font-semibold text-red-500 mb-2">Old Text</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {m.repealed_text || "Text not available"}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg">
                  <p className="text-xs font-semibold text-emerald-500 mb-2">New Text</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {m.replacing_text || "Text not available"}
                  </p>
                </div>
                {m.mapping_notes && (
                  <div className="col-span-2 text-xs text-slate-500 dark:text-slate-400 italic">
                    Note: {m.mapping_notes}
                  </div>
                )}
                {m.savings_clause_ref && (
                  <div className="col-span-2 text-xs text-amber-600 dark:text-amber-400">
                    ⚠ Savings Clause: {m.savings_clause_ref}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
