/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
import { 
  Building2, 
  ShieldCheck, 
  History, 
  Activity, 
  FileText, 
  Briefcase, 
  Plus, 
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { getEntityDetails } from "@/app/actions/entities";
import { format } from "date-fns";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EntityDetailView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entity = await getEntityDetails(id);

  if (!entity) return notFound();

  const metrics = [
    { label: "Hygiene Pulse", value: `${entity.health_score}%`, sub: "Corporate Governance", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Active Matters", value: entity.matters?.length.toString() || "0", sub: "Legal Deal Room", icon: Briefcase, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Compliance Tier", value: entity.compliance_score, sub: "Regulatory Grade", icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Licenses", value: entity.licenses?.length.toString() || "0", sub: "Operating Permits", icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-32 animate-in fade-in duration-700">
      {/* breadcrumb */}
      <Link 
        href="/entities" 
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-4 group w-fit"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Entity Database
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 dark:border-zinc-800 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              entity.status === 'Healthy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
            }`}>
              {entity.status}
            </div>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{entity.type || "Company"}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{entity.name}</h1>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-zinc-400">
             <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> {entity.industry || "General Services"}</span>
             <span className="flex items-center gap-1.5"><History className="w-3.5 h-3.5" /> Incorporated {entity.incorporation_date ? format(new Date(entity.incorporation_date), "MMM yyyy") : "N/A"}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
            Manage Metadata
          </button>
          <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-600/20">
            Start New Audit
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.bg} ${m.color}`}>
                <m.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-0.5">{m.value}</div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</div>
            <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-500">{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Recent Matters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Active Matters</h2>
              <Link href="/matters" className="text-xs font-black text-indigo-500 hover:text-indigo-600 uppercase tracking-widest">View Deal Room</Link>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
              {entity.matters.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-bold text-sm">No active matters for this entity.</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                  {entity.matters.map((matter: any) => (
                    <div key={matter.id} className="p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors flex items-center justify-between group">
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{matter.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{matter.status}</div>
                      </div>
                      <Link href={`/matters/${matter.id}`} className="p-2 bg-slate-100 dark:bg-zinc-800 text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-all rounded-lg">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Compliance Log (Scaffolding for Hygiene Logs) */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Hygiene Log & Filings</h2>
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
              <div className="space-y-6">
                {(entity.hygieneLogs || []).length === 0 ? (
                  <div className="text-center py-6 text-slate-400 font-bold text-sm">No corporate hygiene logs available yet.</div>
                ) : (
                  entity.hygieneLogs.map((log: any, i: number) => (
                    <div key={log.id} className="flex gap-4 group">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full mt-1.5 ${log.status === 'Compliant' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {i !== (entity.hygieneLogs || []).length - 1 && <div className="w-0.5 h-full bg-slate-100 dark:bg-zinc-800 mt-2" />}
                      </div>
                      <div className="pb-6 space-y-1">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{log.event_type}</div>
                        <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                          {log.due_date ? format(new Date(log.due_date), "MMM d, yyyy") : "N/A"} • <span className={log.status === 'Compliant' ? 'text-emerald-500' : 'text-amber-500'}>{log.status}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <button className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 text-xs font-black text-slate-400 hover:text-indigo-500 hover:border-indigo-500 transition-all uppercase tracking-widest">
                  Log New Event
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Side Column (1/3) */}
        <div className="space-y-8">
          {/* Licenses Widget */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs italic">Licenses</h3>
              <Plus className="w-4 h-4 text-slate-400 cursor-pointer hover:text-indigo-500" />
            </div>
            <div className="space-y-3">
              {(entity.licenses || []).length === 0 ? (
                <p className="text-[10px] text-slate-400 font-bold py-2 italic">Zero licenses recorded.</p>
              ) : (
                entity.licenses.map((lic: any) => (
                  <div key={lic.id} className="p-3 bg-slate-50 dark:bg-zinc-950/50 rounded-xl border border-slate-100 dark:border-zinc-800/50 space-y-2">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{lic.name}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-indigo-500">{lic.status}</span>
                      <span className="text-[10px] font-bold text-slate-400 italic">Exp: {lic.expiry_date ? format(new Date(lic.expiry_date), "MMM yyyy") : "Never"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Tasks Placeholder */}
          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-600/20 space-y-4 relative overflow-hidden group">
             <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
             <h3 className="font-black uppercase tracking-widest text-xs italic opacity-80">Next Critical Steps</h3>
             <ul className="space-y-4 relative z-10">
               <li className="flex items-center gap-3">
                 <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"><CheckCircle2 className="w-3 h-3" /></div>
                 <span className="text-xs font-bold">Review FY24 Financials</span>
               </li>
               <li className="flex items-center gap-3">
                 <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"><AlertTriangle className="w-3 h-3" /></div>
                 <span className="text-xs font-bold">Renew Factory License</span>
               </li>
             </ul>
             <button className="w-full py-2.5 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-colors">
               Go to Compliance Hub
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
