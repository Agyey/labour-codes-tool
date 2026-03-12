"use client";

import { useApp } from "@/context/AppContext";
import { CODES } from "@/config/codes";
import type { CodeKey } from "@/types/code";
import { ProgressBar } from "@/components/shared/ProgressBar";
import {
  FileText,
  CheckCircle,
  ClipboardList,
  CheckCheck,
  Clock,
  Circle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { useMemo } from "react";
import { motion } from "framer-motion";

export function DashboardView() {
  const { activeCode, provisions, stats, setActiveCode, setActiveView } = useApp();
  const cObj = CODES[activeCode];

  // Group provisions by code once to prevent map-filter O(N^2) inner loops
  const provisionsByCode = useMemo(() => {
    const acc = {} as Record<string, typeof provisions>;
    for (const p of provisions) {
      if (!acc[p.code]) acc[p.code] = [];
      acc[p.code].push(p);
    }
    return acc;
  }, [provisions]);

  const statCards = [
    { label: "Provisions", value: stats.totalProvisions, icon: FileText, color: cObj.c, bg: cObj.bg },
    { label: "Verified", value: stats.verified, icon: CheckCircle, color: "#059669", bg: "#ecfdf5" },
    { label: "Compliance Items", value: stats.totalCompItems, icon: ClipboardList, color: "#374151", bg: "#f3f4f6" },
    { label: "Compliant", value: stats.compliant, icon: CheckCheck, color: "#10b981", bg: "#d1fae5" },
    { label: "In Progress", value: stats.inProgress, icon: Clock, color: "#f59e0b", bg: "#fef3c7" },
    { label: "Not Started", value: stats.notStarted, icon: Circle, color: "#6b7280", bg: "#f3f4f6" },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-extrabold text-slate-800 mb-1.5 tracking-tight">
          Executive Dashboard — {cObj.n}
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Overall compliance posture and real-time mapping progress
        </p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((s, index) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="p-5 rounded-[20px] text-center border border-white border-opacity-50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              style={{ background: s.bg }}
            >
              <Icon
                className="w-5 h-5 mx-auto mb-3 opacity-70"
                style={{ color: s.color }}
              />
              <div
                className="text-4xl font-black tracking-tighter"
                style={{ color: s.color }}
              >
                {s.value}
              </div>
              <div className="text-[11px] font-bold uppercase tracking-widest mt-1 opacity-70" style={{ color: s.color }}>
                {s.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 bg-white rounded-[24px] border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]"
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-1.5 bg-emerald-50 rounded-lg">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-sm font-extrabold text-slate-800 uppercase tracking-widest">
            Overall Compliance Progress
          </span>
        </div>
        <ProgressBar
          value={stats.compliant + stats.notApplicable}
          max={stats.totalCompItems}
        />
      </motion.div>

      {/* All Codes overview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
          All Codes Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.entries(CODES) as [CodeKey, typeof CODES[CodeKey]][]).map(
            ([key, code], index) => {
              const codeProvs = provisionsByCode[key] || [];
              return (
                <motion.button
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  onClick={() => {
                    setActiveCode(key);
                    setActiveView("mapping");
                  }}
                  className="p-6 rounded-[24px] border border-white text-left transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1 cursor-pointer group relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${code.bg} 0%, white 100%)`,
                  }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                  
                  <div className="flex items-center justify-between relative z-10">
                    <span
                      className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md"
                      style={{ color: code.c, backgroundColor: `${code.c}20` }}
                    >
                      {code.s}
                    </span>
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0"
                      style={{ backgroundColor: code.c, color: "white" }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-lg font-black text-slate-900 mt-4 mb-1.5 leading-tight relative z-10">
                    {code.n}
                  </h4>
                  <p className="text-xs font-semibold text-slate-500 relative z-10">
                    {code.secs} Sections · {code.acts.length} Repealed Acts ·{" "}
                    {codeProvs.length} Mapped
                  </p>
                </motion.button>
              );
            }
          )}
        </div>
      </motion.div>
    </div>
  );
}
