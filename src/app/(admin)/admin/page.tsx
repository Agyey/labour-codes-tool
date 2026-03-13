"use client";

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

export default function SuperAdminDashboard() {
  const kpis = [
    { title: "Monthly Recurring Revenue", value: "$42,500", trend: "+12.5%", color: "indigo" },
    { title: "Active Law Firms (Tenants)", value: "18", trend: "+2", color: "emerald" },
    { title: "Total Platform Users", value: "842", trend: "+145", color: "blue" },
    { title: "Active Scenarios Executed", value: "1,204", trend: "+34%", color: "amber" },
  ];

  const tenants = [
    { id: "org_alpha", name: "Alpha & Partners", plan: "Enterprise", users: 145, mrr: "$4,500", status: "Active" },
    { id: "org_beta", name: "Beta Legal Advisors", plan: "Growth", users: 42, mrr: "$999", status: "Active" },
    { id: "org_gamma", name: "Gamma IP Boutique", plan: "Boutique", users: 12, mrr: "$299", status: "Past Due" },
    { id: "org_delta", name: "Delta Corporate Services", plan: "Enterprise", users: 89, mrr: "$4,500", status: "Active" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Platform Control Center</h1>
        <p className="text-slate-500 dark:text-zinc-400">Global overview of multi-tenant SaaS health, subscriptions, and system metrics.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 dark:text-zinc-400 mb-4">{kpi.title}</h3>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{kpi.value}</span>
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
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
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-indigo-500" /> Active Tenants
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search organizations..." 
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="pb-4 font-bold">Organization</th>
                  <th className="pb-4 font-bold">Plan Details</th>
                  <th className="pb-4 font-bold">Users</th>
                  <th className="pb-4 font-bold">MRR</th>
                  <th className="pb-4 font-bold">Status</th>
                  <th className="pb-4"></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {tenants.map(t => (
                  <tr key={t.id} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="py-4 font-bold text-slate-900 dark:text-white">{t.name}</td>
                    <td className="py-4">
                      <span className="px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-400">
                        {t.plan}
                      </span>
                    </td>
                    <td className="py-4 text-slate-500">{t.users}</td>
                    <td className="py-4 font-black text-slate-900 dark:text-indigo-400">{t.mrr}</td>
                    <td className="py-4">
                      <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        t.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                      }`}>
                        {t.status === 'Active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />} {t.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                  <div className="text-slate-400 text-xs font-bold mb-1">Webhook Status</div>
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Listening
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors">Test</button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-xs font-bold mb-1">Last Sync</div>
                  <div className="text-slate-200 text-sm font-semibold">2 mins ago</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 border-l-4 border-l-rose-500">
            <h3 className="text-sm font-black text-rose-600 dark:text-rose-400 flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4" /> 1 Action Required
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium leading-relaxed mb-4">
              Organization <strong>Gamma IP Boutique</strong> failed their latest subscription renewal charge. Access has been restricted to read-only mode to prevent data loss.
            </p>
            <button className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 transition-colors">
              Review Failed Invoice &rarr;
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
