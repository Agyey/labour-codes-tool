"use client";

import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
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
  const { activeCode, setActiveCode, setActiveView } = useUI();
  const { provisions, stats } = useData();
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
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mb-1.5 tracking-tight">
          Executive Dashboard — {cObj.n}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Overall compliance posture and real-time mapping progress
        </p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((s, index) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.05,
                duration: 0.5,
                ease: [0.23, 1, 0.32, 1]
              }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="p-5 rounded-[24px] text-center border border-white/60 dark:border-slate-800 shadow-premium hover:shadow-premium-hover backdrop-blur-md transition-all duration-300 group overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${s.bg}80 0%, ${s.bg}40 100%)` }}
            >
              <div className="absolute inset-0 bg-white/10 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <Icon
                className="w-5 h-5 mx-auto mb-3 opacity-60 group-hover:opacity-100 transition-opacity"
                style={{ color: s.color }}
              />
              <div
                className="text-4xl font-black tracking-tighter"
                style={{ color: s.color }}
              >
                {s.value}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-50 group-hover:opacity-80 transition-opacity" style={{ color: s.color }}>
                {s.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="p-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[32px] border border-white/80 dark:border-slate-800 shadow-premium relative overflow-hidden"
      >
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-2 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">
            System Compliance Health
          </span>
        </div>
        <div className="relative z-10">
          <ProgressBar
            value={stats.compliant + stats.notApplicable}
            max={stats.totalCompItems}
          />
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </motion.div>

      {/* All Codes overview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-6 ml-2">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
          <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 subtitle uppercase tracking-widest">
            Legal Code Repository
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(Object.entries(CODES) as [CodeKey, typeof CODES[CodeKey]][]).map(
            ([key, code], index) => {
              const codeProvs = provisionsByCode[key] || [];
              return (
                <motion.button
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  onClick={() => {
                    setActiveCode(key);
                    setActiveView("mapping");
                  }}
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-[32px] border border-white/60 dark:border-slate-800 text-left transition-all shadow-premium hover:shadow-premium-hover cursor-pointer group relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${code.bg} 0%, white 100%)`, // We need to handle this gradient carefully for dark mode
                  }}
                >
                  <div className="absolute inset-0 bg-white/20 dark:bg-black/20 opacity-0 dark:opacity-40" />
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/40 dark:bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-2xl" />
                  
                  <div className="flex items-center justify-between relative z-10">
                    <span
                      className="text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-xl backdrop-blur-md shadow-sm border border-white/40 dark:border-slate-700"
                      style={{ color: code.c, backgroundColor: `${code.c}15` }}
                    >
                      {code.s}
                    </span>
                    <div 
                      className="w-10 h-10 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0 shadow-lg shadow-black/5"
                      style={{ backgroundColor: code.c, color: "white" }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white mt-6 mb-2 leading-tight relative z-10 tracking-tight">
                    {code.n}
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 relative z-10 uppercase tracking-wide">
                    <span>{code.secs} sections</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <span>{codeProvs.length} Mapped</span>
                  </div>
                </motion.button>
               );
            }
          )}
        </div>
      </motion.div>
    </div>
  );
}
