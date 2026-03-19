"use client";

import { Globe, ChevronDown } from "lucide-react";
import { STATES } from "@/config/states";
import type { Provision } from "@/types/provision";

interface StateNotesTableProps {
  provision: Provision;
}

export function StateNotesTable({ provision: p }: StateNotesTableProps) {
  const hasStateData = STATES.some(
    (s) => (p.stateNotes || {})[s] || (p.stateRuleText || {})[s]
  );

  if (!hasStateData) return null;

  return (
    <details className="group">
      <summary className="text-xs font-bold text-violet-600 dark:text-violet-400 cursor-pointer select-none flex items-center gap-1 hover:text-violet-700 dark:hover:text-violet-300 transition-colors">
        <Globe className="w-3 h-3" />
        State-wise Notes
        <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
      </summary>
      <table className="w-full text-xs border-collapse mt-2">
        <tbody>
          {STATES.filter(
            (s) =>
              (p.stateNotes || {})[s] || (p.stateRuleText || {})[s]
          ).map((s) => (
            <tr key={s} className="border-b border-slate-100 dark:border-slate-800">
              <td className="py-1.5 px-2 font-semibold w-20 text-slate-900 dark:text-white">{s}</td>
              <td className="py-1.5 px-2 text-slate-600 dark:text-slate-300">
                {(p.stateNotes || {})[s]}
              </td>
              <td className="py-1.5 px-2 text-slate-400 dark:text-slate-500 italic">
                {(p.stateRuleText || {})[s]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
