/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
import { 
  ClipboardCheck, 
  Search, 
  Plus, 
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock3,
  ChevronLeft,
  Briefcase,
  FileText,
  ShieldCheck,
  MoreVertical,
  Activity,
  Building2,
  Landmark
} from "lucide-react";
import Link from "next/link";
import { getMatters } from "@/app/actions/matters";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DueDiligenceChecklist({ params }: { params: Promise<{ id: string }> }) {
  // Scaffolding: Fetch real matter data
  const matters = await getMatters();
  const { id } = await params;
  const matter = matters.find((m: any) => m.id === id);

  if (!matter) return notFound();

  const categories = [
    { title: "Corporate Governance", items: 12, completed: 8, icon: Building2 },
    { title: "Financial & Tax", items: 5, completed: 1, icon: Landmark },
    { title: "Material Contracts", items: 8, completed: 3, icon: FileText },
    { title: "Intellectual Property", items: 4, completed: 4, icon: ShieldCheck },
  ];

  const ddTasks = [
    { id: 'dd1', category: "Corporate", title: "Review Board Minutes (Last 3 years)", status: "Completed", priority: "High", assignee: "SM" },
    { id: 'dd2', category: "Financial", title: "Verify GST Compliance Audit", status: "In Progress", priority: "Urgent", assignee: "SK" },
    { id: 'dd3', category: "Legal", title: "IP Assignment Agreements check", status: "Not Started", priority: "Medium", assignee: "AM" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* breadcrumb */}
      <Link 
        href={`/matters/${id}`} 
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-4 group w-fit"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Deal Room
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 dark:border-zinc-800 pb-8">
        <div>
           <div className="flex items-center gap-2 mb-2 text-indigo-500">
             <ClipboardCheck className="w-5 h-5" />
             <span className="text-[10px] font-black uppercase tracking-widest leading-none">DD Framework</span>
           </div>
           <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Due Diligence Checklist</h1>
           <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Structured audit tracker for {matter.name}</p>
        </div>

        <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* Category Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-3 text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-widest">{cat.title}</span>
              <Activity className="w-4 h-4" />
            </div>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{cat.completed}</span>
              <span className="text-sm font-bold text-slate-400 mb-0.5">/ {cat.items} items</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                 style={{ width: `${(cat.completed / cat.items) * 100}%` }}
               />
            </div>
          </div>
        ))}
      </div>

      {/* Checklist Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50">
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Requirement</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Owner</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Priority</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
              {ddTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{task.title}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{task.category}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-black text-white">{task.assignee}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                      task.priority === 'Urgent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${task.status === 'Completed' ? 'bg-emerald-500' : task.status === 'In Progress' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">{task.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


