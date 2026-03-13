"use client";

import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
import { CODES } from "@/config/codes";
import { IMPACT_COLORS } from "@/config/tags";
import { Badge } from "@/components/shared/Badge";
import { GitCompare, ArrowLeftRight, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

export function CompareView() {
  const { provisions } = useData();
  const [codeA, setCodeA] = useState<string>("");
  const [codeB, setCodeB] = useState<string>("");
  const [provA, setProvA] = useState<string>("");
  const [provB, setProvB] = useState<string>("");

  // Local state for manually registered acts (that aren't in provisions yet)
  const [registeredActs, setRegisteredActs] = useState<Record<string, { n: string; s: string; c: string }>>({});
  const [showAddAct, setShowAddAct] = useState(false);
  const [newActName, setNewActName] = useState("");
  const [newActShort, setNewActShort] = useState("");

  const handleRegisterAct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActName || !newActShort) return;
    const id = newActShort.toUpperCase().replace(/\s+/g, '_');
    setRegisteredActs(prev => ({
      ...prev,
      [id]: { n: newActName, s: newActShort, c: "#94a3b8" }
    }));
    setNewActName("");
    setNewActShort("");
    setShowAddAct(false);
  };

  // Dynamically derive available codes from provisions + static config + manual registrations
  const availableCodes = useMemo(() => {
    const codesInData = new Set([...provisions.map(p => p.code), ...Object.keys(registeredActs)]);
    const all = Array.from(codesInData).map(c => {
      const meta = CODES[c as keyof typeof CODES] || registeredActs[c];
      return {
        id: c,
        name: meta?.n || c,
        short: meta?.s || c,
        color: meta?.c || "#64748b"
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
    return all;
  }, [provisions, registeredActs]);

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
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddAct(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add New Act
          </button>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-zinc-800/50 px-3 py-1 rounded-full">
            <GitCompare className="w-3 h-3" /> Side-by-Side Analysis
          </div>
        </div>
      </div>

      {/* Add Act Modal */}
      {showAddAct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-zinc-800 p-8 relative overflow-hidden">
            <button 
              onClick={() => setShowAddAct(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Register New Act</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">Create a framework container to start comparing provisions.</p>

            <form onSubmit={handleRegisterAct} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Act Name</label>
                <input 
                  autoFocus
                  required
                  value={newActName}
                  onChange={e => setNewActName(e.target.value)}
                  placeholder="e.g. Companies Act, 2013"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Short Code</label>
                <input 
                  required
                  value={newActShort}
                  onChange={e => setNewActShort(e.target.value)}
                  placeholder="e.g. CA13"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/20 mt-4"
              >
                Register Framework
              </button>
            </form>
          </div>
        </div>
      )}

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
