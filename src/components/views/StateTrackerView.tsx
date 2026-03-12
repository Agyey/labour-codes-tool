"use client";

import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
import { CODES } from "@/config/codes";
import { STATES } from "@/config/states";
import { Badge } from "@/components/shared/Badge";
import { Globe, MapPin } from "lucide-react";

import { useMemo } from "react";

export function StateTrackerView() {
  const { activeCode } = useUI();
  const { provisions } = useData();
  const cObj = CODES[activeCode];

  const stateProvisions = useMemo(() => provisions
    .filter((x) => x.code === activeCode)
    .filter((p) =>
      STATES.some((s) => (p.stateNotes || {})[s] || (p.stateRuleText || {})[s])
    ), [provisions, activeCode]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold mb-1" style={{ color: cObj.c }}>
          {cObj.n} — State Tracker
        </h2>
        <p className="text-xs text-gray-500">
          Each state may amend Central provisions. Track state-specific rules,
          variations, and compliance status.
        </p>
      </div>

      {stateProvisions.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Globe className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-sm text-gray-400">
            No state-specific data available for {cObj.s}
          </p>
        </div>
      ) : (
        stateProvisions.map((p) => (
          <div
            key={p.id}
            className="border border-gray-200 rounded-xl overflow-hidden shadow-sm"
          >
            <div
              className="px-4 py-2.5 font-bold text-sm flex items-center gap-2"
              style={{ color: cObj.c, background: cObj.bg }}
            >
              <MapPin className="w-3.5 h-3.5" />
              S.{p.sec}
              {p.sub} — {p.title}
            </div>
            <table className="w-full text-xs border-collapse">
              <tbody>
                {STATES.filter(
                  (s) =>
                    (p.stateNotes || {})[s] || (p.stateRuleText || {})[s]
                ).map((s) => (
                  <tr key={s} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-2 font-semibold w-24 text-gray-700">
                      {s}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {(p.stateNotes || {})[s]}
                    </td>
                    <td className="px-4 py-2 italic text-gray-400">
                      {(p.stateRuleText || {})[s]}
                    </td>
                    <td className="px-4 py-2 w-24">
                      <Badge
                        text={(p.stateCompStatus || {})[s] || "Not Started"}
                        bgColor={
                          (p.stateCompStatus || {})[s] === "Compliant"
                            ? "#d1fae5"
                            : "#fef3c7"
                        }
                        color={
                          (p.stateCompStatus || {})[s] === "Compliant"
                            ? "#065f46"
                            : "#92400e"
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
