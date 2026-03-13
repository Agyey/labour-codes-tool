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
        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/30">
          <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">
            Draft Central Rules
          </div>
          {p.draftRules!.map((r, i) => (
            <div key={i} className="text-xs mb-1.5">
              <b className="text-amber-800 dark:text-amber-300">{r.ref}</b>
              <br />
              <span className="text-slate-600 dark:text-slate-400">{r.summary}</span>
            </div>
          ))}
        </div>
      )}
      {(p.repealedRules || []).length > 0 && (
        <div className="p-3 bg-pink-50 dark:bg-pink-950/20 rounded-xl border border-pink-200 dark:border-pink-900/30">
          <div className="text-[10px] font-bold text-pink-700 dark:text-pink-400 uppercase tracking-wider mb-2">
            Repealed Rules
          </div>
          {p.repealedRules!.map((r, i) => (
            <div key={i} className="text-xs mb-1.5">
              <b className="text-pink-800 dark:text-pink-300">✕ {r.ref}</b>
              <br />
              <span className="text-slate-600 dark:text-slate-400">{r.summary}</span>
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
