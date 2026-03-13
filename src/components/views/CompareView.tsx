"use client";

import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
import { CODES } from "@/config/codes";
import { IMPACT_COLORS } from "@/config/tags";
import { Badge } from "@/components/shared/Badge";
import { GitCompare, ArrowLeftRight } from "lucide-react";
import { useMemo, useState } from "react";

export function CompareView() {
  const { provisions } = useData();
  const [codeA, setCodeA] = useState<string>("");
  const [codeB, setCodeB] = useState<string>("");
  const [provA, setProvA] = useState<string>("");
  const [provB, setProvB] = useState<string>("");

  // Dynamically derive available codes from provisions + static config
  const availableCodes = useMemo(() => {
    const codesInData = new Set(provisions.map(p => p.code));
    const all = Array.from(codesInData).map(c => {
      const meta = CODES[c as keyof typeof CODES];
      return {
        id: c,
        name: meta?.n || c,
        short: meta?.s || c,
        color: meta?.c || "#64748b"
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
    return all;
  }, [provisions]);

  const provsA = useMemo(() => provisions.filter(p => p.code === codeA), [provisions, codeA]);
  const provsB = useMemo(() => provisions.filter(p => p.code === codeB), [provisions, codeB]);

  const a = useMemo(() => provsA.find(p => p.id === provA), [provsA, provA]);
  const b = useMemo(() => provsB.find(p => p.id === provB), [provsB, provB]);

  const getMeta = (code: string) => CODES[code as keyof typeof CODES] || { c: "#64748b", n: code };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">
          Cross-Act Comparison
        </h2>
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-zinc-800/50 px-3 py-1 rounded-full">
          <GitCompare className="w-3 h-3" /> Side-by-Side Analysis
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border-4 border-slate-50 dark:border-zinc-950 items-center justify-center z-10 shadow-sm">
           <ArrowLeftRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* SIDE A */}
        <div className="space-y-4 p-6 bg-white dark:bg-zinc-900/50 rounded-[32px] border border-slate-200 dark:border-zinc-800/80 shadow-sm">
          <div className="space-y-3">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Act / Code</label>
             <select
                value={codeA}
                onChange={(e) => { setCodeA(e.target.value); setProvA(""); }}
                className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs bg-slate-50 dark:bg-zinc-900 font-bold text-slate-700 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
             >
                <option value="">Select Framework</option>
                {availableCodes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
             </select>

             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mt-4">Select Provision</label>
             <select
                value={provA}
                onChange={(e) => setProvA(e.target.value)}
                disabled={!codeA}
                className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs bg-slate-50 dark:bg-zinc-900 font-bold text-slate-700 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all disabled:opacity-50"
             >
                <option value="">Select Section/Rule</option>
                {provsA.map(p => (
                  <option key={p.id} value={p.id}>[S.{p.sec}{p.sub}] {p.title}</option>
                ))}
             </select>
          </div>

          {a ? (
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">SIDE A</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-2" style={{ color: getMeta(codeA).c }}>
                S.{a.sec}{a.sub} — {a.title}
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge text={a.impact} color={IMPACT_COLORS[a.impact]} className="text-[9px]" />
                <Badge text={a.provisionType} color="#64748b" className="text-[9px] uppercase" />
              </div>
              <div className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-medium bg-slate-50 dark:bg-zinc-800/30 p-4 rounded-2xl">
                {a.summary}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center opacity-30 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-[24px] mt-4">
               <GitCompare className="w-8 h-8 mx-auto mb-2" />
               <p className="text-xs font-bold uppercase tracking-wider">Empty Slot A</p>
            </div>
          )}
        </div>

        {/* SIDE B */}
        <div className="space-y-4 p-6 bg-white dark:bg-zinc-900/50 rounded-[32px] border border-slate-200 dark:border-zinc-800/80 shadow-sm">
          <div className="space-y-3">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Act / Code</label>
             <select
                value={codeB}
                onChange={(e) => { setCodeB(e.target.value); setProvB(""); }}
                className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs bg-slate-50 dark:bg-zinc-900 font-bold text-slate-700 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
             >
                <option value="">Select Framework</option>
                {availableCodes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
             </select>

             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mt-4">Select Provision</label>
             <select
                value={provB}
                onChange={(e) => setProvB(e.target.value)}
                disabled={!codeB}
                className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs bg-slate-50 dark:bg-zinc-900 font-bold text-slate-700 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all disabled:opacity-50"
             >
                <option value="">Select Section/Rule</option>
                {provsB.map(p => (
                  <option key={p.id} value={p.id}>[S.{p.sec}{p.sub}] {p.title}</option>
                ))}
             </select>
          </div>

          {b ? (
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">SIDE B</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-2" style={{ color: getMeta(codeB).c }}>
                S.{b.sec}{b.sub} — {b.title}
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge text={b.impact} color={IMPACT_COLORS[b.impact]} className="text-[9px]" />
                <Badge text={b.provisionType} color="#64748b" className="text-[9px] uppercase" />
              </div>
              <div className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-medium bg-slate-50 dark:bg-zinc-800/30 p-4 rounded-2xl">
                {b.summary}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center opacity-30 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-[24px] mt-4">
               <GitCompare className="w-8 h-8 mx-auto mb-2" />
               <p className="text-xs font-bold uppercase tracking-wider">Empty Slot B</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
