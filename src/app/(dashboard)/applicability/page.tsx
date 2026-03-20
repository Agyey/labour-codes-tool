import ApplicabilityChecker from "@/components/search-ui/ApplicabilityChecker";

export default function ApplicabilityPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Applicability Engine
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
          Determine exactly which laws, registrations, and regulatory bodies apply to your organization based on profile, industry, geographical location, and dynamic financial thresholds.
        </p>
      </header>
      
      <ApplicabilityChecker />
    </div>
  );
}
