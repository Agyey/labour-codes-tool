import AmendmentTimeline from "@/components/graph-analysis/AmendmentTimeline";
import CrossRefGraph from "@/components/graph-analysis/CrossRefGraph";

export default function AnalysisPage() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 h-[calc(100vh-64px)] flex flex-col">
      <header className="shrink-0">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Graph & Timeline Analysis
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Explore legal networks and historical evolution for Section 7 (Companies Act, 2013).
        </p>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <CrossRefGraph />
        <AmendmentTimeline />
      </div>
    </div>
  );
}
