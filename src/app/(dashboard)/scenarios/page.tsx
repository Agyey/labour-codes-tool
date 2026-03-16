import { ScenarioWizard } from "@/components/scenarios/ScenarioWizard";
import { ChevronLeft, Zap } from "lucide-react";
import Link from "next/link";
import { ModuleHeader } from "@/components/shared/ModuleHeader";

export default function ScenarioGeneratorPage() {
  return (
    <div className="p-6 lg:p-10 max-w-[1400px] mx-auto w-full">
      <Link 
        href="/dashboard"
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-600 transition-colors mb-6 group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Dashboard
      </Link>
      
      <ModuleHeader 
        title="Scenario Engine"
        description="Instantly translate complex legal transactions into actionable, jurisdiction-specific compliance checklists and execution pipelines."
        icon={Zap}
        iconColor="text-amber-500"
      />
      
      <ScenarioWizard />
    </div>
  );
}
