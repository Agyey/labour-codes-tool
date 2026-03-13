"use client";

import { 
  Briefcase, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  MoreVertical,
  Building2
} from "lucide-react";
import Link from "next/link";

export default function FirmDashboard() {
  // Mock unified firm data
  const metrics = [
    { label: "Active Deals", value: "12", change: "+2 this week", icon: Briefcase, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Overdue Tasks", value: "3", change: "Requires attention", icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-500/10" },
    { label: "Completed (7d)", value: "48", change: "+12% vs last week", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Pending Signatures", value: "7", change: "Waiting on client", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const inboxTasks = [
    { id: 1, matter: "Reliance - Q3 Private Placement", task: "Upload Board Resolution (Draft)", due: "Today", status: "Overdue", type: "Docs" },
    { id: 2, matter: "Tata Motors - ESOP Restructuring", task: "Verify Form SH-7 Filing", due: "Tomorrow", status: "Pending", type: "Compliance" },
    { id: 3, matter: "Zomato - Seed Round", task: "Review Shareholders Agreement", due: "In 2 days", status: "In Progress", type: "Review" },
    { id: 4, matter: "Reliance - Q3 Private Placement", task: "Client signature: Valuation Report", due: "In 3 days", status: "Pending", type: "Client" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Good Morning, Partner</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Here is the status of your firm's active matters and compliance obligations.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/matters" className="text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-lg hover:scale-105 transition-transform flex items-center gap-2">
            New Matter
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.bg} ${m.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{m.value}</div>
              <div className="text-sm font-semibold text-slate-500 dark:text-zinc-400 mb-1">{m.label}</div>
              <div className={`text-xs font-medium ${m.color}`}>{m.change}</div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Unified Inbox Dashboard (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" /> Action Required Inbox
            </h2>
            <Link href="/matters" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:gap-2 transition-all">
              View All Tasks <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {inboxTasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${task.status === 'Overdue' ? 'bg-rose-500' : task.status === 'In Progress' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm mb-1">{task.task}</div>
                      <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                        <Briefcase className="w-3 h-3" /> {task.matter}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 sm:w-1/3 justify-between sm:justify-end border-t border-slate-100 sm:border-0 pt-3 sm:pt-0">
                    <div className="flex flex-col items-start sm:items-end">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        task.status === 'Overdue' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}>
                        {task.due}
                      </span>
                      <span className="text-xs text-slate-400 mt-1">{task.type}</span>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Client Pulse Widget (1/3 width) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-500" /> Client Hygiene Pulse
          </h2>
          
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-5">
            {[
              { client: "Reliance Industries", health: 98, status: "Healthy" },
              { client: "Tata Motors", health: 85, status: "Warning" },
              { client: "Zomato", health: 62, status: "Critical" },
            ].map((client, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="text-slate-800 dark:text-zinc-200">{client.client}</span>
                  <span className={client.health > 90 ? 'text-emerald-500' : client.health > 70 ? 'text-amber-500' : 'text-rose-500'}>
                    {client.health}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${client.health > 90 ? 'bg-emerald-500' : client.health > 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${client.health}%` }}
                  />
                </div>
              </div>
            ))}
            
            <Link href="/entities" className="block w-full text-center py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 rounded-xl transition-all">
              View Entity Database
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
