"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";

interface Definition {
  term: string;
  definition_text: string;
  is_inclusive: boolean;
}

interface CrossRef {
  reference_type: string;
  reference_text?: string;
  target_title?: string;
}

interface StateAmendment {
  state: string;
  text: string;
}

interface ProvisionContentProps {
  unitType: string;
  number?: string;
  title?: string;
  fullText?: string;
  status: string;
  complianceType: string;
  definitions?: Definition[];
  crossReferences?: CrossRef[];
  state_amendments?: StateAmendment[];
}

export default function ProvisionContent({
  unitType,
  number,
  title,
  fullText,
  status,
  complianceType,
  definitions = [],
  crossReferences = [],
  state_amendments = [],
}: ProvisionContentProps) {
  const [hoveredTerm, setHoveredTerm] = useState<string | null>(null);

  // Highlight defined terms in the text
  const renderTextWithDefinitions = (text: string) => {
    if (!definitions.length) return <p className="whitespace-pre-wrap">{text}</p>;


    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Sort definitions by length (longest first) to avoid partial matches
    const sortedDefs = [...definitions].sort(
      (a, b) => b.term.length - a.term.length
    );

    const regex = new RegExp(
      `\\b(${sortedDefs.map((d) => d.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
      "gi"
    );

    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      const matchedTerm = match[1];
      const def = sortedDefs.find(
        (d) => d.term.toLowerCase() === matchedTerm.toLowerCase()
      );

      parts.push(
        <span
          key={match.index}
          className="relative cursor-help border-b border-dashed border-amber-500 text-amber-700 dark:text-amber-400"
          onMouseEnter={() => setHoveredTerm(matchedTerm)}
          onMouseLeave={() => setHoveredTerm(null)}
        >
          {matchedTerm}
          {hoveredTerm === matchedTerm && def && (
            <span className="absolute left-0 bottom-full mb-2 w-80 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl z-50">
              <strong className="text-amber-400">{def.term}</strong>
              {def.is_inclusive && (
                <span className="ml-2 text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                  Inclusive
                </span>
              )}
              <p className="mt-1 opacity-90">{def.definition_text}</p>
            </span>
          )}
        </span>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return <p className="whitespace-pre-wrap leading-relaxed">{parts}</p>;
  };

  const statusColor: Record<string, string> = {
    Active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    Repealed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    Suspended: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  };

  return (
    <article className="flex-1 p-8 overflow-y-auto bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {unitType}
            {number && ` ${number}`}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor[status] || statusColor.Active}`}>
            {status}
          </span>
          {complianceType !== "None" && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 font-medium">
              ⚡ {complianceType}
            </span>
          )}
        </div>
        {title && (
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {title}
          </h1>
        )}
      </header>

      {/* Body Text */}
      <div className="prose prose-slate dark:prose-invert max-w-none text-[15px]">
        {fullText ? renderTextWithDefinitions(fullText) : (
          <p className="italic text-slate-400">No text available for this provision.</p>
        )}
      </div>

      {/* State Amendments / Overlays */}
      {state_amendments.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-400 border-b border-indigo-100 dark:border-indigo-500/20 pb-2">
            State Amendments & Rules
          </h3>
          {state_amendments.map((amendment, i) => (
            <div key={i} className="bg-indigo-50/50 dark:bg-indigo-500/5 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 dark:bg-indigo-400" />
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider mb-2">
                {amendment.state} Amendment
              </div>
              <div className="text-sm text-slate-700 dark:text-slate-300 italic">
                {renderTextWithDefinitions(amendment.text)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cross References Sidebar */}
      {crossReferences.length > 0 && (
        <aside className="mt-8 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
            <ExternalLink className="w-4 h-4" />
            Cross References
          </h3>
          <ul className="space-y-2">
            {crossReferences.map((ref, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="text-[10px] font-medium uppercase bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded shrink-0">
                  {ref.reference_type}
                </span>
                <span>{ref.reference_text || ref.target_title || "—"}</span>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </article>
  );
}
