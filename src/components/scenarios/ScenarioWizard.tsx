/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createMatterFromScenario } from "@/app/actions/matters";
import { useSession } from "next-auth/react";
import { getScenarioTemplates, createScenarioTemplate } from "@/app/actions/scenarios";
import { ScenarioEditorModal } from "./ScenarioEditorModal";
import { WizardProgress } from "./Wizard/WizardProgress";
import { JurisdictionStep } from "./Wizard/JurisdictionStep";
import { EntityStep } from "./Wizard/EntityStep";
import { ScenarioStep } from "./Wizard/ScenarioStep";
import { SuccessStep } from "./Wizard/SuccessStep";
import { WizardFooter } from "./Wizard/WizardFooter";
import { CreateTemplateModal } from "./Wizard/CreateTemplateModal";

type Step = 1 | 2 | 3 | 4;

const ENTITIES = [
  { id: "pvt", name: "Private Limited Company" },
  { id: "pub", name: "Public Limited Company" },
  { id: "llp", name: "Limited Liability Partnership" },
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

  const canContinue = (step === 1 && !!jurisdiction) || (step === 2 && !!entity) || (step === 3 && !!scenarioId);

  return (
    <div className="max-w-4xl mx-auto w-full">
      <WizardProgress step={step} />

      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden min-h-[400px] flex flex-col relative">
        
        {step === 1 && (
          <JurisdictionStep jurisdiction={jurisdiction} setJurisdiction={setJurisdiction} />
        )}

        {step === 2 && (
          <EntityStep entity={entity} setEntity={setEntity} />
        )}

        {step === 3 && (
          <ScenarioStep 
            scenarios={scenarios}
            scenarioId={scenarioId}
            setScenarioId={setScenarioId}
            setShowCreateModal={setShowCreateModal}
            setEditingScenario={setEditingScenario}
          />
        )}

        {step === 4 && (
          <SuccessStep 
            scenarioName={selectedScenario?.name || ""}
            createMatter={createMatter}
          />
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
          <WizardFooter 
            step={step}
            handleBack={handleBack}
            handleNext={handleNext}
            canContinue={canContinue}
          />
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

      <CreateTemplateModal 
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateScenario}
        newScenarioName={newScenarioName}
        setNewScenarioName={setNewScenarioName}
      />
    </div>
  );
}
