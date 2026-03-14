"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Building2, Briefcase, CheckCircle2, ArrowRight, ArrowLeft, Loader2, Play, Scale, Landmark, Settings2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createMatterFromScenario } from "@/app/actions/matters";
import { useSession } from "next-auth/react";
import { getScenarioTemplates, createScenarioTemplate } from "@/app/actions/scenarios";
import { ScenarioEditorModal } from "./ScenarioEditorModal";

type Step = 1 | 2 | 3 | 4;

const JURISDICTIONS = [
  { id: "in", name: "India", icon: Globe, desc: "BSE, NSE, MCA, RBI Compliances" },
  { id: "sg", name: "Singapore", icon: Globe, desc: "ACRA, MAS Regulations" },
  { id: "us", name: "United States (Delaware)", icon: Globe, desc: "SEC, Delaware General Corp Law" },
];

const ENTITIES = [
  { id: "pvt", name: "Private Limited Company", icon: Building2 },
  { id: "pub", name: "Public Limited Company", icon: Building2 },
  { id: "llp", name: "Limited Liability Partnership", icon: Building2 },
];

export function ScenarioWizard() {
  const [step, setStep] = useState<Step>(1);
  const [jurisdiction, setJurisdiction] = useState("");
  const [entity, setEntity] = useState("");
  const [scenarioId, setScenarioId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [editingScenario, setEditingScenario] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState("");
  
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    loadScenarios();
  }, []);

  async function loadScenarios() {
    const data = await getScenarioTemplates();
    setScenarios(data);
  }

  const selectedScenario = scenarios.find(s => s.id === scenarioId);

  const handleNext = () => {
    if (step < 4) {
      if (step === 3) {
        setIsGenerating(true);
        setTimeout(() => {
          setIsGenerating(false);
          setStep(4);
        }, 2000);
      } else {
        setStep((s) => (s + 1) as Step);
      }
    }
  };

  const handleBack = () => setStep((s) => (s - 1) as Step);

  const handleCreateScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScenarioName) return;
    const res = await createScenarioTemplate({ name: newScenarioName });
    if (res.success) {
      toast.success("Scenario template created");
      setNewScenarioName("");
      setShowCreateModal(false);
      loadScenarios();
    }
  };

  const createMatter = async () => {
    if (!selectedScenario) return;
    setIsGenerating(true);
    
    const checklist = selectedScenario.rules.map((rule: any) => ({
      title: rule.obligation.title,
      type: "Compliance",
      priority: "High",
      due: "In 3 days"
    }));

    try {
      if (!session?.user?.orgId) {
        toast.error("Organization context missing. Please sign in again.");
        return;
      }

      const res = await createMatterFromScenario({
        orgId: session.user.orgId,
        matterName: `${selectedScenario.name} - ${ENTITIES.find(e => e.id === entity)?.name}`,
        clientName: ENTITIES.find(e => e.id === entity)?.name || "New Client",
        tasks: checklist.length > 0 ? checklist : [{ title: "Initial Compliance Review", type: "Docs", priority: "High", due: "Today" }]
      });
      
      if (res.success && res.matterId) {
        router.push(`/matters/${res.matterId}`);
      } else {
        toast.error("Failed to create Matter.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Progress Header */}
      <div className="mb-8 relative">
        <div className="flex items-center justify-between relative z-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm ${
                  step >= i 
                    ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-indigo-500/30" 
                    : "bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 text-slate-400 dark:text-zinc-500"
                }`}
              >
                {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= i ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-zinc-600"}`}>
                {i === 1 ? "Jurisdiction" : i === 2 ? "Entity" : i === 3 ? "Scenario" : "Generation"}
              </span>
            </div>
          ))}
        </div>
        <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-200 dark:bg-zinc-800 -z-0">
          <div 
            className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500 ease-in-out" 
            style={{ width: `${((step - 1) / 3) * 100}%` }} 
          />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden min-h-[400px] flex flex-col relative">
        
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-8 flex-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Select Target Jurisdiction</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">Which regulatory body governs this transaction?</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {JURISDICTIONS.map((j) => {
                const isSelected = jurisdiction === j.id;
                const Icon = j.icon;
                return (
                  <button key={j.id} onClick={() => setJurisdiction(j.id)} className={`p-5 rounded-2xl text-left border-2 transition-all ${isSelected ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:border-indigo-500" : "border-slate-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-500/30"}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white mb-1">{j.name}</div>
                    <div className="text-xs text-slate-500 dark:text-zinc-400">{j.desc}</div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-8 flex-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Specify Entity Structure</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">Obligations vary drastically by company structure.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ENTITIES.map((e) => {
                const isSelected = entity === e.id;
                const Icon = e.icon;
                return (
                  <button key={e.id} onClick={() => setEntity(e.id)} className={`p-5 rounded-2xl text-left border-2 transition-all flex flex-col items-center text-center ${isSelected ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:border-indigo-500" : "border-slate-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-500/30"}`}>
                    <Icon className={`w-8 h-8 mb-3 ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-zinc-500"}`} />
                    <span className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{e.name}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-8 flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Identify the Scenario</h2>
                <p className="text-sm text-slate-500 dark:text-zinc-400">What transaction or event are we executing?</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20"
              >
                <Plus className="w-4 h-4" /> New Template
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {scenarios.map((s) => {
                const isSelected = scenarioId === s.id;
                return (
                  <div key={s.id} className="relative group">
                    <button
                      onClick={() => setScenarioId(s.id)}
                      className={`w-full p-5 rounded-2xl text-left border-2 transition-all ${isSelected ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:border-indigo-500" : "border-slate-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-500/30"}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                         <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${isSelected ? "bg-indigo-600/20 text-indigo-700 dark:text-indigo-300" : "bg-slate-100 dark:bg-zinc-800 text-slate-500"}`}>COMPLIANCE</span>
                         {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white mb-1">{s.name}</div>
                      <div className="text-xs text-slate-500 dark:text-zinc-400 mb-2">{s.description || "Custom compliance workflow."}</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.rules?.length || 0} REQUIREMENTS</div>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingScenario(s); }}
                      className="absolute top-4 right-4 p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-slate-100 dark:border-zinc-700 opacity-0 group-hover:opacity-100 transition-all hover:text-indigo-600"
                    >
                      <Settings2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
              {scenarios.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                  No scenario templates found. Create one to get started.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Workflow Ready</h2>
            <p className="text-slate-500 dark:text-zinc-400 max-w-sm mb-8 text-sm leading-relaxed">
              The engine mapped <strong>{selectedScenario?.name}</strong> across the selected jurisdiction and generated tailored compliance tasks.
            </p>
            <button onClick={createMatter} className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-3.5 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20 dark:shadow-white/10">
              Configure Deal Room <ArrowRight className="w-4 h-4 mt-0.5" />
            </button>
          </motion.div>
        )}

        <AnimatePresence>
          {isGenerating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
              <h3 className="font-bold text-slate-900 dark:text-white">Analyzing Compliance Path...</h3>
            </motion.div>
          )}
        </AnimatePresence>

        {step < 4 && (
          <div className="border-t border-slate-100 dark:border-zinc-800 p-5 bg-slate-50/50 dark:bg-zinc-950/50 flex items-center justify-between">
            <button onClick={handleBack} disabled={step === 1} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={handleNext} disabled={(step === 1 && !jurisdiction) || (step === 2 && !entity) || (step === 3 && !scenarioId)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20">
              {step === 3 ? "Generate Workflow" : "Continue"} {step === 3 ? <Play className="w-4 h-4 fill-current" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {editingScenario && (
        <ScenarioEditorModal 
          isOpen={!!editingScenario} 
          onClose={() => setEditingScenario(null)} 
          scenario={editingScenario} 
          onUpdate={loadScenarios}
        />
      )}

      {/* Create Template Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[32px] p-8 shadow-2xl">
              <h3 className="text-xl font-bold mb-6">New Scenario Template</h3>
              <form onSubmit={handleCreateScenario} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Workflow Name</label>
                  <input required value={newScenarioName} onChange={e => setNewScenarioName(e.target.value)} placeholder="e.g. Rights Issue" className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-800" />
                </div>
                <button className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 mt-4">Create Template</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
