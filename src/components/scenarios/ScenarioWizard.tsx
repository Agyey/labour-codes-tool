"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Building2, Briefcase, CheckCircle2, ArrowRight, ArrowLeft, Loader2, Play, Scale, Landmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { createMatterFromScenario } from "@/app/actions/matters";

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

const SCENARIOS = [
  { id: "series_a", name: "Private Placement (Series A/B)", category: "Fundraising", desc: "Issuance of CCPS to VC funds under Section 42." },
  { id: "esop", name: "ESOP Rollout", category: "Equity", desc: "Drafting and issuing an Employee Stock Option Plan." },
  { id: "director", name: "Director Appointment/Resignation", category: "Governance", desc: "Filing DIR-12 and board resolution mapping." },
  { id: "due_diligence", name: "Vendor Due Diligence", category: "M&A", desc: "Pre-acquisition master hygiene check." },
];

export function ScenarioWizard() {
  const [step, setStep] = useState<Step>(1);
  const [jurisdiction, setJurisdiction] = useState("");
  const [entity, setEntity] = useState("");
  const [scenario, setScenario] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const handleNext = () => {
    if (step < 4) {
      if (step === 3) {
        setIsGenerating(true);
        setTimeout(() => {
          setIsGenerating(false);
          setStep(4);
        }, 3000);
      } else {
        setStep((s) => (s + 1) as Step);
      }
    }
  };

  const handleBack = () => setStep((s) => (s - 1) as Step);

  const createMatter = async () => {
    setIsGenerating(true);
    // Hardcoded mock scenario checklist based on current wizard mock result
    const checklist = [
      { title: "Prerequisite Approvals", type: "Docs", priority: "High", due: "Today" },
      { title: "Valuation Documents", type: "Review", priority: "High", due: "Tomorrow" },
      { title: "Government Filings (PAS-3, MGT-14)", type: "Compliance", priority: "Urgent", due: "In 3 days" },
      { title: "Board & Shareholder Resolutions", type: "Docs", priority: "High", due: "In 2 days" }
    ];

    try {
      const res = await createMatterFromScenario({
        orgId: "org_alpha", // In reality, this would be fetched from the user's current session or org context
        matterName: "Private Placement - Series A",
        clientName: ENTITIES.find(e => e.id === entity)?.name || "New Client",
        tasks: checklist
      });
      
      if (res.success && res.matterId) {
        router.push(`/matters/${res.matterId}`);
      } else {
        alert("Failed to create Matter. Check logs.");
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
        {/* Progress Line */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-200 dark:bg-zinc-800 -z-0">
          <div 
            className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500 ease-in-out" 
            style={{ width: `${((step - 1) / 3) * 100}%` }} 
          />
        </div>
      </div>

      {/* Main Wizard Area */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden min-h-[400px] flex flex-col relative">
        
        {/* Step 1: Jurisdiction */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-8 flex-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Select Target Jurisdiction</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">Which regulatory body governs this transaction?</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {JURISDICTIONS.map((j) => {
                const isSelected = jurisdiction === j.id;
                const Icon = j.icon;
                return (
                  <button
                    key={j.id}
                    onClick={() => setJurisdiction(j.id)}
                    className={`p-5 rounded-2xl text-left border-2 transition-all ${
                      isSelected 
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:border-indigo-500" 
                        : "border-slate-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-500/30"
                    }`}
                  >
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

        {/* Step 2: Entity */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-8 flex-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Specify Entity Structure</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">Obligations vary drastically by company structure.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ENTITIES.map((e) => {
                const isSelected = entity === e.id;
                const Icon = e.icon;
                return (
                  <button
                    key={e.id}
                    onClick={() => setEntity(e.id)}
                    className={`p-5 rounded-2xl text-left border-2 transition-all flex flex-col items-center text-center ${
                      isSelected 
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:border-indigo-500" 
                        : "border-slate-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-500/30"
                    }`}
                  >
                    <Icon className={`w-8 h-8 mb-3 ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-zinc-500"}`} />
                    <span className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{e.name}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Step 3: Scenario */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-8 flex-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Identify the Scenario</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">What transaction or event are we executing?</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SCENARIOS.map((s) => {
                const isSelected = scenario === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setScenario(s.id)}
                    className={`p-5 rounded-2xl text-left border-2 transition-all ${
                      isSelected 
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:border-indigo-500" 
                        : "border-slate-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-500/30"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                       <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${isSelected ? "bg-indigo-600/20 text-indigo-700 dark:text-indigo-300" : "bg-slate-100 dark:bg-zinc-800 text-slate-500"}`}>{s.category}</span>
                       {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white mb-1">{s.name}</div>
                    <div className="text-xs text-slate-500 dark:text-zinc-400">{s.desc}</div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Step 4: Loading & Results */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Checklist Compiled Successfully</h2>
            <p className="text-slate-500 dark:text-zinc-400 max-w-sm mb-8 text-sm leading-relaxed">
              The engine mapped <strong>Private Placement (Series A)</strong> across the <strong>Indian Companies Act, 2013</strong> and generated 14 immediate compliance tasks.
            </p>

            <div className="w-full max-w-md bg-slate-50 dark:bg-zinc-950 rounded-xl p-4 border border-slate-100 dark:border-zinc-800 mb-8 text-left">
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-200 dark:border-zinc-800">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-bold text-slate-700 dark:text-zinc-200">Execution Overview</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-zinc-400 font-medium">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-slate-400 rounded-full" /> 3 Prerequisite Approvals</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-slate-400 rounded-full" /> 2 Valuation Documents</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-slate-400 rounded-full" /> 4 Government Filings (PAS-3, MGT-14)</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-slate-400 rounded-full" /> Board & Shareholder Resolutions</li>
              </ul>
            </div>

            <button 
              onClick={createMatter}
              className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-3.5 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20 dark:shadow-white/10"
            >
              Configure Deal Room <ArrowRight className="w-4 h-4 mt-0.5" />
            </button>
          </motion.div>
        )}

        {/* Loading Overlay */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm flex flex-col items-center justify-center"
            >
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
              <h3 className="font-bold text-slate-900 dark:text-white loading-text">Parsing Knowledge Graph...</h3>
              <p className="text-xs text-slate-500 mt-2">Mapping regulatory overlaps</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Footer */}
        {step < 4 && (
          <div className="border-t border-slate-100 dark:border-zinc-800 p-5 bg-slate-50/50 dark:bg-zinc-950/50 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleNext}
              disabled={(step === 1 && !jurisdiction) || (step === 2 && !entity) || (step === 3 && !scenario)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20"
            >
              {step === 3 ? "Generate Checklist" : "Continue"} {step === 3 ? <Play className="w-4 h-4 fill-current" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
