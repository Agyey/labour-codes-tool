import TransactionWorkflow from "@/components/compliance-dashboard/TransactionWorkflow";
import ComplianceCalendar from "@/components/compliance-dashboard/ComplianceCalendar";

export default function ComplianceTrackerPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Compliance & Workflows
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Track transaction progress and upcoming statutory deadlines.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TransactionWorkflow />
        <ComplianceCalendar />
      </div>
    </div>
  );
}
