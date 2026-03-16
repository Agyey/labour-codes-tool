import { Clock, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

export function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { bg: string; text: string; icon: any }> = {
    uploaded: { bg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-700 dark:text-blue-400", icon: Clock },
    analyzing: { bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-700 dark:text-amber-400", icon: Loader2 },
    analyzed: { bg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-400", icon: CheckCircle2 },
    error: { bg: "bg-red-100 dark:bg-red-500/20", text: "text-red-700 dark:text-red-400", icon: AlertTriangle },
  };
  const c = configs[status] || configs.uploaded;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${c.bg} ${c.text}`}>
      <Icon className={`w-3 h-3 ${status === "analyzing" ? "animate-spin" : ""}`} />
      {status}
    </span>
  );
}
