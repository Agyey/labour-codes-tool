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
      <summary className="text-xs font-bold text-violet-600 cursor-pointer select-none flex items-center gap-1">
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
            <tr key={s} className="border-b border-gray-100">
              <td className="py-1.5 px-2 font-semibold w-20">{s}</td>
              <td className="py-1.5 px-2 text-gray-600">
                {(p.stateNotes || {})[s]}
              </td>
              <td className="py-1.5 px-2 text-gray-400 italic">
                {(p.stateRuleText || {})[s]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
