/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { GitCompare } from "lucide-react";
import { Provision } from "@/types/provision";

interface ComparisonSideProps {
  label: string;
  code: string;
  setCode: (val: string) => void;
  availableCodes: any[];
  provId: string;
  setProvId: (val: string) => void;
  provisions: Provision[];
  subId: string;
  setSubId: (val: string) => void;
  selectedProvision?: Provision;
  getMeta: (code: string) => { c: string; n: string };
}

export function ComparisonSide({
  label,
  code,
  setCode,
  availableCodes,
  provId,
  setProvId,
  provisions,
  subId,
  setSubId,
  selectedProvision,
  getMeta
}: ComparisonSideProps) {
  return (
    <div className="space-y-4 p-6 bg-white dark:bg-zinc-900/50 rounded-[32px] border border-slate-200 dark:border-zinc-800/80 shadow-sm">
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <select
          value={code}
          onChange={(e) => { setCode(e.target.value); setProvId(""); setSubId(""); }}
          className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs bg-slate-50 dark:bg-zinc-900 font-bold text-slate-700 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
        >
          <option value="">Select Act</option>
          {availableCodes.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <div className="grid grid-cols-[3fr_1fr] gap-2 mt-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Provision</label>
            <select
              value={provId}
              onChange={(e) => setProvId(e.target.value)}
              disabled={!code}
              className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs bg-slate-50 dark:bg-zinc-900 font-bold text-slate-700 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all disabled:opacity-50"
            >
              <option value="">Select Section/Rule</option>
              {provisions.map(p => (
                <option key={p.id} value={p.id}>[{p.provisionType === 'rule' ? 'R.' : 'S.'}{p.sec}] {p.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Sub-Sec</label>
            <select
              value={subId}
              onChange={(e) => setSubId(e.target.value)}
              disabled={!selectedProvision}
              className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs bg-slate-50 dark:bg-zinc-900 font-bold text-slate-700 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all disabled:opacity-50"
            >
              <option value="">None</option>
              {(selectedProvision?.subSections || []).map((ss: any, idx: number) => (
                <option key={idx} value={ss.marker}>{ss.marker}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedProvision ? (
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-2" style={{ color: getMeta(code || "REPEALED").c }}>
            {selectedProvision.provisionType === 'rule' ? 'Rule' : 'Section'} {selectedProvision.sec}{subId} — {selectedProvision.title}
          </h3>
          <div className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-medium bg-slate-50 dark:bg-zinc-800/30 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800/50">
            {subId ? (selectedProvision.subSections.find((ss: any) => ss.marker === subId)?.text || selectedProvision.summary) : selectedProvision.summary}
          </div>
        </div>
      ) : (
        <div className="py-20 text-center opacity-30 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-[24px] mt-4">
          <GitCompare className="w-8 h-8 mx-auto mb-2" />
          <p className="text-xs font-bold uppercase tracking-wider">Select {label.includes("MAIN") ? "New Law" : "Old Law"}</p>
        </div>
      )}
    </div>
  );
}
