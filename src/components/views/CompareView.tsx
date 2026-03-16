"use client";
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */

import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
import { CODES } from "@/config/codes";
import { IMPACT_COLORS } from "@/config/tags";
import { Badge } from "@/components/shared/Badge";
import { GitCompare, ArrowLeftRight, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Breadcrumbs } from "../shared/Breadcrumbs";
import toast from "react-hot-toast";

export function CompareView() {
  const { provisions, frameworks, legislations, saveProvision, createLegislation } = useData();
  const { comparePayload, setComparePayload } = useUI();
  
  const [codeA, setCodeA] = useState<string>("");
  const [codeB, setCodeB] = useState<string>("");
  const [provA, setProvA] = useState<string>("");
  const [provB, setProvB] = useState<string>("");
  const [subA, setSubA] = useState<string>("");
  const [subB, setSubB] = useState<string>("");
  const [targetFrameworkId, setTargetFrameworkId] = useState("");

  const [showAddAct, setShowAddAct] = useState(false);
  const [newActName, setNewActName] = useState("");
  const [newActShort, setNewActShort] = useState("");

  // Initialize from payload
  useMemo(() => {
    if (comparePayload?.sideA && !codeA && !provA) {
      setCodeA(comparePayload.sideA.code);
      setProvA(comparePayload.sideA.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comparePayload]);

  const handleRegisterAct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActName || !newActShort || !targetFrameworkId) return;
    
    const success = await createLegislation({
      frameworkId: targetFrameworkId,
      name: newActName,
      shortName: newActShort,
      type: 'act',
      isRepealed: true,
      year: new Date().getFullYear(),
      color: "#94a3b8"
    });

    if (success) {
      setNewActName("");
      setNewActShort("");
      setShowAddAct(false);
      toast.success(`Registered ${newActShort} persistently.`);
    }
  };

  /** Create a formal OldMapping connector between A and B */
  const handleCreateConnector = async () => {
    if (!a || !b) return;
    
    const mapping = {
      act: getMeta(b.code).n,
      sec: b.sec,
      subSec: subB || "",
      targetSubSec: subA || "",
      summary: b.summary,
      fullText: b.fullText || "",
      change: "Mapped via Cross-Act Connector",
      changeTags: ["Structural Alignment"]
    };

    const updated = { ...a };
    updated.oldMappings = [...(updated.oldMappings || []), mapping];
    
    await saveProvision(updated);
    toast.success(`Connected ${a.sec}${subA} to ${b.code} ${b.sec}${subB}`);
  };

  // Dynamically derive available codes from provisions + static config + manual registrations
  const availableCodes = useMemo(() => {
    // Collect unique codes from provisions + global legislations
    const codesInData = new Set([...provisions.map(p => p.code), ...legislations.map(l => l.shortName)]);
    const all = Array.from(codesInData).map(c => {
      const dbLeg = legislations.find(l => l.shortName === c);
      const staticMeta = CODES[c as keyof typeof CODES];
      
      return {
        id: c,
        name: dbLeg?.name || staticMeta?.n || c,
        short: dbLeg?.shortName || staticMeta?.s || c,
        color: dbLeg?.color || staticMeta?.c || "#64748b"
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
    return all;
  }, [provisions, legislations]);

  const provsA = useMemo(() => provisions.filter(p => p.code === codeA), [provisions, codeA]);
  const provsB = useMemo(() => provisions.filter(p => p.code === codeB), [provisions, codeB]);

  const a = useMemo(() => provsA.find(p => p.id === provA), [provsA, provA]);
  const b = useMemo(() => {
    if (provB) return provsB.find(p => p.id === provB);
    if (!codeB && !provB && comparePayload?.sideB) {
      return {
        id: "custom",
        sec: comparePayload.sideB.code,
        sub: "",
        title: comparePayload.sideB.title,
        impact: "High",
        provisionType: "repealed",
        summary: comparePayload.sideB.summary,
        code: "REPEALED",
        fullText: (comparePayload.sideB as any).fullText || ""
      } as any;
    }
    return undefined;
  }, [provsB, provB, codeB, comparePayload]);

  const getMeta = (code: string) => {
    if (code === "REPEALED") return { c: "#e11d48", n: "Repealed Law" };
    return CODES[code as keyof typeof CODES] || { c: "#64748b", n: code };
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">
          Cross-Act Connector
        </h2>
        <div className="flex items-center gap-3">
          {a && b && (
            <button 
              onClick={handleCreateConnector}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white text-[12px] font-black uppercase tracking-widest rounded-full hover:scale-[1.05] active:scale-95 transition-all shadow-lg shadow-indigo-500/30"
            >
              <GitCompare className="w-4 h-4" /> Create Connector
            </button>
          )}
          <button 
            onClick={() => setShowAddAct(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add New Act
          </button>
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

            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Register Legal Container</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">Define a new Act or Code to enable comparative mapping.</p>

            <form onSubmit={handleRegisterAct} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Act Name</label>
                <input 
                  autoFocus
                  required
                  value={newActName}
                  onChange={e => setNewActName(e.target.value)}
                  placeholder="e.g. Payment of Wages Act, 1936"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Short Code</label>
                <input 
                  required
                  value={newActShort}
                  onChange={e => setNewActShort(e.target.value)}
                  placeholder="e.g. PWA36"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Framework (Bucket)</label>
                <select 
                  required
                  value={targetFrameworkId}
                  onChange={e => setTargetFrameworkId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Select Bucket</option>
                  {frameworks.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/20 mt-4"
              >
                Register Act
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
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">MAIN LEGISLATION (New Code)</label>
             <select
                value={codeA}
                onChange={(e) => { setCodeA(e.target.value); setProvA(""); setSubA(""); }}
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
                      value={provA}
                      onChange={(e) => setProvA(e.target.value)}
                      disabled={!codeA}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs bg-slate-50 dark:bg-zinc-900 font-bold text-slate-700 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all disabled:opacity-50"
                   >
                      <option value="">Select Section/Rule</option>
                      {provsA.map(p => (
                        <option key={p.id} value={p.id}>[{p.provisionType === 'rule' ? 'R.' : 'S.'}{p.sec}] {p.title}</option>
                      ))}
                   </select>
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Sub-Sec</label>
                   <select
                      value={subA}
                      onChange={(e) => setSubA(e.target.value)}
                      disabled={!a}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs bg-slate-50 dark:bg-zinc-900 font-bold text-slate-700 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all disabled:opacity-50"
                   >
                      <option value="">None</option>
                      {(a?.subSections || []).map((ss: any, idx: number) => (
                        <option key={idx} value={ss.marker}>{ss.marker}</option>
                      ))}
                   </select>
                </div>
             </div>
          </div>

          {a ? (
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-2" style={{ color: getMeta(codeA).c }}>
                {a.provisionType === 'rule' ? 'Rule' : 'Section'} {a.sec}{subA} — {a.title}
              </h3>
              <div className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-medium bg-slate-50 dark:bg-zinc-800/30 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800/50">
                {subA ? (a.subSections.find((ss: any) => ss.marker === subA)?.text || a.summary) : a.summary}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center opacity-30 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-[24px] mt-4">
               <GitCompare className="w-8 h-8 mx-auto mb-2" />
               <p className="text-xs font-bold uppercase tracking-wider">Select New Law</p>
            </div>
          )}
        </div>

        {/* SIDE B */}
        <div className="space-y-4 p-6 bg-white dark:bg-zinc-900/50 rounded-[32px] border border-slate-200 dark:border-zinc-800/80 shadow-sm relative">
          <div className="space-y-3">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">REPEALED LEGISLATION (Old Law)</label>
             <select
                value={codeB}
                onChange={(e) => { setCodeB(e.target.value); setProvB(""); setSubB(""); }}
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
                      value={provB}
                      onChange={(e) => setProvB(e.target.value)}
                      disabled={!codeB}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs bg-slate-50 dark:bg-zinc-900 font-bold text-slate-700 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all disabled:opacity-50"
                   >
                      <option value="">Select Section/Rule</option>
                      {provsB.map(p => (
                        <option key={p.id} value={p.id}>[S.{p.sec}] {p.title}</option>
                      ))}
                   </select>
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Sub-Sec</label>
                   <select
                      value={subB}
                      onChange={(e) => setSubB(e.target.value)}
                      disabled={!b}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs bg-slate-50 dark:bg-zinc-900 font-bold text-slate-700 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all disabled:opacity-50"
                   >
                      <option value="">None</option>
                      {(b?.subSections || []).map((ss: any, idx: number) => (
                        <option key={idx} value={ss.marker}>{ss.marker}</option>
                      ))}
                   </select>
                </div>
             </div>
          </div>

          {b || comparePayload?.sideB ? (
             <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-2" style={{ color: getMeta(codeB || "REPEALED").c }}>
                  {b?.provisionType === 'rule' ? 'Rule' : 'Section'} {b?.sec || comparePayload?.sideB?.code}{subB} — {b?.title || comparePayload?.sideB?.title}
                </h3>
                <div className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-medium bg-slate-50 dark:bg-zinc-800/30 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800/50">
                   {subB ? (b?.subSections.find((ss: any) => ss.marker === subB)?.text || b?.summary || comparePayload?.sideB?.summary) : (b?.summary || comparePayload?.sideB?.summary)}
                </div>
             </div>
          ) : (
            <div className="py-20 text-center opacity-30 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-[24px] mt-4">
               <GitCompare className="w-8 h-8 mx-auto mb-2" />
               <p className="text-xs font-bold uppercase tracking-wider">Select Old Law</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
