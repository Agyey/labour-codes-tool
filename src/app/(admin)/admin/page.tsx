/* eslint-disable @typescript-eslint/no-unused-vars */
import { 
  Building2, 
  Users, 
  CreditCard, 
  Activity,
  ArrowUpRight,
  ShieldAlert,
  Search,
  MoreVertical,
  CheckCircle2
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SuperAdminDashboard() {
  // 1. Fetch real system-wide data
  const orgs = await prisma.organization.findMany({
    orderBy: { created_at: "desc" },
    include: {
      users: true,
    }
  });

  const totalUsers = await prisma.user.count();
  const matterCount = await prisma.matter.count();
  
  // 2. Calculate KPIs
  const kpis = [
    { title: "Monthly Recurring Revenue", value: `$${(orgs.length * 250).toLocaleString()}`, trend: "Est. $250/ten", color: "indigo" },
    { title: "Active Law Firms (Tenants)", value: orgs.length.toString(), trend: `+${orgs.filter(o => o.created_at > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} (30d)`, color: "emerald" },
    { title: "Total Platform Users", value: totalUsers.toString(), trend: "Live count", color: "blue" },
    { title: "Active Matters Executed", value: matterCount.toString(), trend: "Deal volume", color: "amber" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">Platform Control Center</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400">Global overview of multi-tenant SaaS health, subscriptions, and system metrics.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-4">{kpi.title}</h3>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{kpi.value}</span>
              <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                kpi.color === 'indigo' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400' :
                kpi.color === 'emerald' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                kpi.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
              }`}>
                <Activity className="w-3 h-3" /> {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Tenant Management Table */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm h-fit">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-indigo-500" /> Active Tenants
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search organizations..." 
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white font-medium"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {orgs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-bold italic">No organizations registered.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-zinc-800 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-zinc-950/50">
                    <th className="px-4 py-3">Organization</th>
                    <th className="px-4 py-3">Users</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {orgs.map(org => (
                    <tr key={org.id} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-4 font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{org.name}</td>
                      <td className="px-4 py-4 text-slate-500 font-medium">{org.users.length}</td>
                      <td className="px-4 py-4 text-slate-500 font-medium">{org.created_at.toLocaleDateString()}</td>
                      <td className="px-4 py-4">
                        <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400`}>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* System & Billing Health */}
        <div className="space-y-6">
          <div className="bg-slate-900 dark:bg-zinc-950 border border-slate-800 dark:border-zinc-800 rounded-3xl p-6">
            <h2 className="text-lg font-black text-white flex items-center gap-2 mb-6">
              <CreditCard className="w-5 h-5 text-indigo-400" /> Stripe Integration
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="text-slate-400 text-xs font-bold mb-1 uppercase tracking-widest">Webhook Status</div>
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Listening
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors">Test</button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-xs font-bold mb-1 uppercase tracking-widest">Last Sync</div>
                  <div className="text-slate-200 text-sm font-semibold">2 mins ago</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 border-l-4 border-l-emerald-500 shadow-sm">
            <h3 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-2 uppercase tracking-widest">
              <CheckCircle2 className="w-4 h-4" /> System Healthy
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium leading-relaxed mb-4">
              All multi-tenant database clusters are performing within nominal latency (&lt; 50ms). Webhooks and async workers are active.
            </p>
            <button className="text-[10px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-widest">
              Platform Logs &rarr;
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
