import { ScenarioWizard } from "@/components/scenarios/ScenarioWizard";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

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
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black text-slate-900 dark:text-zinc-50 tracking-tight mb-3">Scenario Engine</h1>
        <p className="text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto font-medium">Instantly translate complex legal transactions into actionable, jurisdiction-specific compliance checklists and execution pipelines.</p>
      </div>
      
      <ScenarioWizard />
    </div>
  );
}
