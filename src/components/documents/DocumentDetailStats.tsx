import type { DocumentDetail } from "@/types/document";

interface Props {
  analysis: NonNullable<DocumentDetail["analysis"]>;
  pendingCount: number;
  approvedCount: number;
}
export function DocumentDetailStats({ analysis, pendingCount, approvedCount }: Props) {
  const stats = [
    { label: "Graph Nodes", value: analysis.graph_nodes, color: "text-indigo-600 dark:text-indigo-400" },
    { label: "Relationships", value: analysis.graph_relationships, color: "text-violet-600 dark:text-violet-400" },
    { label: "Pending Review", value: pendingCount, color: "text-amber-600 dark:text-amber-400" },
    { label: "Approved", value: approvedCount, color: "text-emerald-600 dark:text-emerald-400" },
  ];
  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 text-center">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500 mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
