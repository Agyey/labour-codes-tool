import { LoadingCard } from "@/components/shared/Feedback";

export default function DashboardLoading() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Skeleton for Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-9 w-64 bg-slate-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
          <div className="h-4 w-96 bg-slate-50 dark:bg-zinc-900 rounded-md animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-slate-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
      </div>

      {/* Main Loader for the metrics and inbox */}
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingCard message="Aggregating firm metrics and active deal rooms..." />
      </div>
    </div>
  );
}
