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

export function DashboardView() {
  const { activeCode, provisions, stats, setActiveCode, setActiveView } = useApp();
  const cObj = CODES[activeCode];

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
      <div>
        <h2 className="text-xl font-extrabold text-gray-800 mb-1">
          Dashboard — {cObj.n}
        </h2>
        <p className="text-xs text-gray-500">
          Overall compliance posture and progress tracking
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="p-4 rounded-2xl text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              style={{ background: s.bg }}
            >
              <Icon
                className="w-5 h-5 mx-auto mb-2 opacity-60"
                style={{ color: s.color }}
              />
              <div
                className="text-3xl font-extrabold"
                style={{ color: s.color }}
              >
                {s.value}
              </div>
              <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress */}
      <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-bold text-gray-700">
            Overall Compliance Progress
          </span>
        </div>
        <ProgressBar
          value={stats.compliant + stats.notApplicable}
          max={stats.totalCompItems}
        />
      </div>

      {/* All Codes overview */}
      <div>
        <h3 className="text-base font-bold text-gray-700 mb-3">
          All Codes Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(Object.entries(CODES) as [CodeKey, typeof CODES[CodeKey]][]).map(
            ([key, code]) => {
              const codeProvs = provisions.filter((x) => x.code === key);
              return (
                <button
                  key={key}
                  onClick={() => {
                    setActiveCode(key);
                    setActiveView("mapping");
                  }}
                  className="p-5 rounded-2xl border-2 text-left transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group"
                  style={{
                    borderColor: `${code.c}30`,
                    background: code.bg,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-extrabold tracking-wider uppercase"
                      style={{ color: code.c }}
                    >
                      {code.s}
                    </span>
                    <ArrowRight
                      className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: code.c }}
                    />
                  </div>
                  <h4 className="text-base font-bold text-gray-800 mt-1.5 mb-1">
                    {code.n}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {code.secs} Sections · {code.acts.length} Repealed Acts ·{" "}
                    {codeProvs.length} Mapped
                  </p>
                </button>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
