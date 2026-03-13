"use client";

import type { Provision } from "@/types/provision";

interface RulesAndFormsProps {
  provision: Provision;
}

export function RulesAndForms({ provision: p }: RulesAndFormsProps) {
  const hasData = (p.draftRules || []).length > 0 ||
                  (p.repealedRules || []).length > 0 ||
                  (p.forms || []).length > 0;

  if (!hasData) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {(p.draftRules || []).length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-100 uppercase tracking-wider mb-2 flex items-center gap-2">
            New Rules
          </h4>
          {p.draftRules!.map((r, i) => (
            <div key={i} className="mb-2 last:mb-0 border-l-2 border-slate-200 dark:border-zinc-700 pl-3">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{r.ref}</p>
              <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">{r.summary}</p>
            </div>
          ))}
        </div>
      )}

      {(p.repealedRules || []).length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-100 uppercase tracking-wider mb-2 flex items-center gap-2">
            Old Rules
          </h4>
          {p.repealedRules!.map((r, i) => (
            <div key={i} className="mb-2 last:mb-0 border-l-2 border-slate-200 dark:border-zinc-700 pl-3">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">✕ {r.ref}</p>
              <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">{r.summary}</p>
            </div>
          ))}
        </div>
      )}
      {(p.forms || []).length > 0 && (
        <div className="p-3 bg-sky-50 dark:bg-sky-950/20 rounded-xl border border-sky-200 dark:border-sky-900/30">
          <div className="text-[10px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider mb-2">
            Forms / Registers
          </div>
          {p.forms!.map((r, i) => (
            <div key={i} className="text-xs mb-1.5">
              <b className="text-sky-800 dark:text-sky-300">{r.ref}</b>
              <br />
              <span className="text-slate-600 dark:text-slate-400">{r.summary}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
