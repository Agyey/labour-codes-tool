"use client";

import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
import { CODES } from "@/config/codes";
import { GitCompare, ArrowLeftRight, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Breadcrumbs } from "../shared/Breadcrumbs";
import toast from "react-hot-toast";
import { RegisterActModal } from "./CompareView/RegisterActModal";
import { ComparisonSide } from "./CompareView/ComparisonSide";

export function CompareView() {
  const { provisions, frameworks, legislations, saveProvision, createLegislation } = useData();
  const { comparePayload } = useUI();
  
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
  }, [comparePayload, codeA, provA]);

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

  const availableCodes = useMemo(() => {
    const codesInData = new Set([...provisions.map(p => p.code), ...legislations.map(l => l.shortName)]);
    return Array.from(codesInData).map(c => {
      const dbLeg = legislations.find(l => l.shortName === c);
      const staticMeta = CODES[c as keyof typeof CODES];
      
      return {
        id: c,
        name: dbLeg?.name || staticMeta?.n || c,
        short: dbLeg?.shortName || staticMeta?.s || c,
        color: dbLeg?.color || staticMeta?.c || "#64748b"
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
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
            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add New Act
          </button>
        </div>
      </div>

      {showAddAct && (
        <RegisterActModal 
          onClose={() => setShowAddAct(false)}
          onSubmit={handleRegisterAct}
          newActName={newActName}
          setNewActName={setNewActName}
          newActShort={newActShort}
          setNewActShort={setNewActShort}
          targetFrameworkId={targetFrameworkId}
          setTargetFrameworkId={setTargetFrameworkId}
          frameworks={frameworks}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border-4 border-slate-50 dark:border-zinc-950 items-center justify-center z-10 shadow-sm">
           <ArrowLeftRight className="w-4 h-4 text-slate-400" />
        </div>

        <ComparisonSide 
          label="MAIN LEGISLATION (New Code)"
          code={codeA}
          setCode={setCodeA}
          availableCodes={availableCodes}
          provId={provA}
          setProvId={setProvA}
          provisions={provsA}
          subId={subA}
          setSubId={setSubA}
          selectedProvision={a}
          getMeta={getMeta}
        />

        <ComparisonSide 
          label="REPEALED LEGISLATION (Old Law)"
          code={codeB}
          setCode={setCodeB}
          availableCodes={availableCodes}
          provId={provB}
          setProvId={setProvB}
          provisions={provsB}
          subId={subB}
          setSubId={setSubB}
          selectedProvision={b}
          getMeta={getMeta}
        />
      </div>
    </div>
  );
}
