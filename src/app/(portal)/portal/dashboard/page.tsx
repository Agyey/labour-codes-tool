"use client";

import { 
  Building2, 
  Briefcase, 
  AlertTriangle,
  ArrowRight,
  Clock,
  ShieldCheck,
  FileText
} from "lucide-react";
import Link from "next/link";

export default function ClientPortalDashboard() {
  const activeMatters = [
    { id: "1", name: "Reliance - Q3 Private Placement", status: "In Progress", progress: 45, date: "Apr 15" },
    { id: "2", name: "Intellectual Property Transfer", status: "Action Required", progress: 85, date: "Mar 20" },
  ];

  const pendingActions = [
    { id: 1, matter: "Intellectual Property Transfer", task: "Upload Signed Assignment Deed", due: "Today", urgent: true },
    { id: 2, matter: "Reliance - Q3 Private Placement", task: "Upload Board Resolution", due: "Tomorrow", urgent: false },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Welcome Banner */}
      <div className="bg-slate-900 dark:bg-zinc-950 rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-2xl shadow-slate-900/10 dark:shadow-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -z-0 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -z-0 -translate-x-1/3 translate-y-1/3" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-md">
            <Building2 className="w-3.5 h-3.5" /> Reliance Industries
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Welcome back, Mukesh.</h1>
          <p className="text-slate-400 text-sm max-w-xl">Your legal team at <strong>Alpha & Partners</strong> has requested 2 documents to proceed with your active transactions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Action Required Column */}
        <div className="lg:col-span-1 border border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/10 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertTriangle className="w-24 h-24 text-rose-500" />
          </div>
          <div className="relative z-10">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" /> Action Required
            </h2>

            <div className="space-y-4">
              {pendingActions.map(action => (
                <div key={action.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${action.urgent ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                      Due {action.due}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-2">{action.task}</h3>
                  <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-4">
                    <Briefcase className="w-3.5 h-3.5" /> {action.matter}
                  </div>
                  <button className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" /> Upload Document
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Matters Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-indigo-500" /> Active Matters
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeMatters.map(matter => (
              <Link href={`/portal/matters/${matter.id}`} key={matter.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="flex items-start justify-between mb-6">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                    matter.status === 'Action Required' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
                    'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400'
                  }`}>
                    {matter.status}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug mb-6 h-12">{matter.name}</h3>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-zinc-400">
                    <span>Progress</span>
                    <span>{matter.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${matter.progress}%` }} />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/50 flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Clock className="w-3.5 h-3.5" /> Target Date: {matter.date}
                </div>
              </Link>
            ))}
          </div>

          {/* Corporate Hygiene Snapshot */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 mt-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Corporate Hygiene is 98% Healthy</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400">Your law firm is managing 142 recurring compliance obligations. No overdue state filings.</p>
              </div>
            </div>
            <button className="flex-shrink-0 px-6 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 font-bold text-sm text-slate-900 dark:text-white rounded-xl transition-colors whitespace-nowrap">
              View Audit Report
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
