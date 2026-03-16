import { motion } from "framer-motion";
import { FileText, Shield, AlertTriangle, XCircle, Sparkles, GitBranch, CheckCircle2 } from "lucide-react";
import { Suggestion } from "@/types/document";
import { StatusBadge } from "./StatusBadge";

export function SuggestionCard({ suggestion, onApprove, onReject }: {
  suggestion: Suggestion;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const typeLabels: Record<string, { label: string; color: string; icon: any }> = {
    create_legislation: { label: "Legislation", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400", icon: FileText },
    create_provision: { label: "Provision", color: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400", icon: GitBranch },
    create_compliance_item: { label: "Compliance", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400", icon: Shield },
    create_penalty: { label: "Penalty", color: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400", icon: AlertTriangle },
    flag_repeal: { label: "Repeal", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400", icon: XCircle },
    update_provision: { label: "Update", color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400", icon: Sparkles },
  };
  const t = typeLabels[suggestion.type] || typeLabels.create_provision;
  const Icon = t.icon;

  const statusColors: Record<string, string> = {
    pending: "border-l-amber-400",
    approved: "border-l-emerald-400",
    rejected: "border-l-red-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm border-l-4 ${statusColors[suggestion.status] || "border-l-slate-300"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-2 rounded-xl ${t.color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${t.color}`}>
                {t.label}
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                {Math.round(suggestion.confidence * 100)}% confidence
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200 truncate">
              {suggestion.suggested_data.title || suggestion.suggested_data.name || suggestion.suggested_data.task || suggestion.suggested_data.repealed_act_name || "-"}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1 line-clamp-2">
              {suggestion.suggested_data.summary || suggestion.suggested_data.description || suggestion.suggested_data.due_logic || ""}
            </p>
          </div>
        </div>
        {suggestion.status === "pending" && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onApprove(suggestion.id)}
              className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
              title="Approve"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onReject(suggestion.id)}
              className="p-2 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
              title="Reject"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}
        {suggestion.status !== "pending" && (
          <StatusBadge status={suggestion.status} />
        )}
      </div>
    </motion.div>
  );
}
