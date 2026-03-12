"use client";

import { useApp } from "@/context/AppContext";
import { CODES } from "@/config/codes";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

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
          <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-300 via-emerald-300 to-gray-200 rounded-full opacity-50" />

          {events.map((d, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="relative flex gap-5 pb-8 group cursor-pointer"
            >
              {/* Dot */}
              <div
                className="absolute left-[-14px] top-2 z-10 w-3.5 h-3.5 rounded-full border-[3px] border-white shadow-sm transition-transform duration-300 group-hover:scale-125"
                style={{ backgroundColor: cObj.c }}
              />
              <div className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 relative overflow-hidden group-hover:border-blue-100">
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: cObj.c }}
                />
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" style={{ color: cObj.c }} />
                    <span className="text-sm font-extrabold tracking-tight" style={{ color: cObj.c }}>
                      {d.date || "TBD"}
                    </span>
                  </div>
                  <div className="bg-gray-50 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    S.{d.sec}{d.sub} <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
                <div className="text-base font-bold text-gray-900 mb-1.5 leading-tight">
                  {d.label}
                </div>
                <div className="text-sm text-gray-500 line-clamp-2">
                  {d.title}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
