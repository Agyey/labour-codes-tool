"use client";

import { useApp } from "@/context/AppContext";
import { CODES } from "@/config/codes";
import { Calendar, Clock } from "lucide-react";

export function TimelineView() {
  const { activeCode, provisions } = useApp();
  const cObj = CODES[activeCode];

  const events = provisions
    .filter((x) => x.code === activeCode && (x.timelineDates || []).length > 0)
    .flatMap((p) =>
      (p.timelineDates || []).map((d) => ({
        date: d.date,
        label: d.label,
        sec: p.sec,
        sub: p.sub,
        title: p.title,
        id: p.id,
      }))
    )
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold text-gray-800">
        Timeline — Key Dates
      </h2>

      {events.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Calendar className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-sm text-gray-400">
            No timeline dates added yet. Add dates via the editor.
          </p>
        </div>
      ) : (
        <div className="relative pl-6">
          {/* Timeline line */}
          <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-300 via-emerald-300 to-gray-200 rounded-full" />

          {events.map((d, i) => (
            <div key={i} className="relative flex gap-4 pb-5">
              {/* Dot */}
              <div
                className="absolute left-[-14px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: cObj.c }}
              />
              <div className="flex-1 bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3.5 h-3.5" style={{ color: cObj.c }} />
                  <span className="text-sm font-bold" style={{ color: cObj.c }}>
                    {d.date || "TBD"}
                  </span>
                </div>
                <div className="text-sm font-semibold text-gray-800">
                  {d.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  S.{d.sec}
                  {d.sub} — {d.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
