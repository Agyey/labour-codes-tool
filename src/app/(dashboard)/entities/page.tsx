import { 
  Building2, 
  Search, 
  Plus, 
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  History,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import Link from "next/link";

export default async function EntitiesPage() {
  const entities = await prisma.entity.findMany({
    orderBy: { created_at: "desc" },
    include: {
      compliances: true,
      matters: true,
    }
  });

  // Calculate real stats
  const totalEntities = entities.length;
  const healthyCount = entities.filter(e => e.status === "Healthy").length;
  const warningCount = entities.filter(e => e.status === "Warning").length;
  const criticalCount = entities.filter(e => e.status === "Critical").length;

  const stats = [
    { label: "Total Entities", value: totalEntities.toString(), icon: Building2, color: "text-slate-600" },
    { label: "Healthy", value: healthyCount.toString(), icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Warnings", value: warningCount.toString(), icon: AlertTriangle, color: "text-amber-500" },
    { label: "Critical", value: criticalCount.toString(), icon: XCircle, color: "text-rose-500" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-emerald-500" />
            Entity Database
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Global tracking of corporate hygiene, KYC status, and periodic compliance across all managed clients.</p>
        </div>
        
        <button className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2.5 rounded-xl font-bold hover:scale-105 active:scale-95 transition-transform shadow-md">
          <Plus className="w-5 h-5" /> Add Entity
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-3 text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-widest">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Search & Filter (Placeholder for client interaction) */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by legal name, PAN, or CIN..." 
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-medium dark:text-white"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-100 dark:border-zinc-800 rounded-xl text-sm font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-50 transition-colors">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Entity Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {entities.length === 0 ? (
            <div className="p-20 text-center space-y-4">
              <Building2 className="w-16 h-16 text-slate-200 mx-auto" />
              <div className="text-slate-400 font-bold">No entities found. Add your first client to start tracking.</div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50">
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Entity Name</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Hygiene Pulse</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Last Audit</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Score</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                {entities.map((ent) => (
                  <tr key={ent.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors group cursor-pointer">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 transition-colors">{ent.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{ent.type || "Company"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="w-32 space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-500">{ent.health_score}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${ent.health_score > 90 ? 'bg-emerald-500' : ent.health_score > 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${ent.health_score}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-zinc-400">
                        <History className="w-3.5 h-3.5" /> {ent.last_audit_at ? format(ent.last_audit_at, "MMM d, yyyy") : "Never"}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-1 rounded-lg font-black text-xs ${
                        ent.compliance_score.startsWith('A') ? 'bg-emerald-50 text-emerald-600' :
                        ent.compliance_score.startsWith('B') ? 'bg-amber-50 text-amber-600' :
                        'bg-rose-50 text-rose-600'
                      }`}>
                        {ent.compliance_score}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        ent.status === 'Healthy' ? 'bg-emerald-100 text-emerald-700' : 
                        ent.status === 'Warning' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        <ShieldCheck className="w-3 h-3" /> {ent.status}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
