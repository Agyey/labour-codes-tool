"use client";

import { useState } from "react";
import { 
  Kanban, 
  Files, 
  Clock, 
  Settings, 
  Plus, 
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Clock3,
  ChevronLeft,
  ArrowRight,
  FileText,
  History,
  Activity,
  User
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";

export default function MatterDashboardView({ matter }: { matter: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"board" | "vdr" | "timeline">("board");

  const columns = [
    { id: "To Do", title: "Prioritized Items", count: matter.tasks.filter((t: any) => t.status === 'To Do').length, color: "bg-slate-200 dark:bg-zinc-800" },
    { id: "In Progress", title: "Execution", count: matter.tasks.filter((t: any) => t.status === 'In Progress').length, color: "bg-blue-500/20 text-blue-700 dark:text-blue-400" },
    { id: "Under Review", title: "Quality Control", count: matter.tasks.filter((t: any) => t.status === 'Under Review').length, color: "bg-amber-500/20 text-amber-700 dark:text-amber-400" },
    { id: "Completed", title: "Archived/Done", count: matter.tasks.filter((t: any) => t.status === 'Completed').length, color: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* Matter Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 p-6 flex-shrink-0">
        <button 
          onClick={() => router.push('/matters')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-4 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to All Matters
        </button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                matter.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-zinc-800'
              }`}>
                {matter.status}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{matter.entity?.name || "Independent Deal"}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {matter.name}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Execution Progress</div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                   {/* Simplified progress calculation */}
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(matter.tasks.filter((t: any) => t.status === 'Completed').length / (matter.tasks.length || 1)) * 100}%` }} />
                </div>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                   {Math.round((matter.tasks.filter((t: any) => t.status === 'Completed').length / (matter.tasks.length || 1)) * 100)}%
                </span>
              </div>
            </div>
            
            <Link 
               href={`/matters/${matter.id}/checklist`}
               className="p-2.5 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-xs hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg"
            >
              <FileText className="w-4 h-4" /> DD Checklist
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-slate-100 dark:border-zinc-800 pt-2">
          {[
            { id: "board", label: "Workflow (Board)", icon: Kanban },
            { id: "vdr", label: "Data Room (VDR)", icon: Files },
            { id: "timeline", label: "History (Timeline)", icon: Clock },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3 px-1 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
                activeTab === tab.id 
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" 
                  : "border-transparent text-slate-400 hover:text-slate-800 dark:hover:text-zinc-200"
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-zinc-950/20">
        
        {/* Board Content */}
        {activeTab === "board" && (
          <div className="flex gap-6 h-full min-w-max pb-8 overflow-x-auto">
            {columns.map(col => (
              <div key={col.id} className="w-[320px] flex flex-col h-fit">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">{col.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${col.color}`}>
                      {col.count}
                    </span>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-slate-300 hover:text-indigo-500 cursor-pointer" />
                </div>

                <div className="space-y-3">
                  {matter.tasks.filter((t: any) => t.status === col.id).map((task: any) => (
                    <div key={task.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group cursor-pointer border-l-4 border-l-indigo-500">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{task.stage || "Structuring"}</span>
                        <MoreVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 leading-tight">{task.name}</h4>
                      <div className="flex items-center justify-between border-t border-slate-50 dark:border-zinc-800 pt-3">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                           <Clock3 className="w-3 h-3" /> {task.due_date ? format(new Date(task.due_date), "MMM d") : "No due date"}
                        </div>
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-[8px] font-black text-slate-500">
                           {task.assignee_id ? "OWN" : "ANY"}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-3 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-500 hover:border-indigo-500 transition-all">
                    + New Workflow Item
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VDR Subsystem (Live Scaffolding) */}
        {activeTab === "vdr" && (
          <div className="max-w-5xl mx-auto py-8 space-y-8 animate-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                 <div className="flex items-center justify-between">
                   <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white italic">Vault Contents</h2>
                   <div className="flex items-center gap-4">
                      <Search className="w-4 h-4 text-slate-400" />
                      <Filter className="w-4 h-4 text-slate-400" />
                   </div>
                 </div>
                 
                 <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                    {matter.documents.length === 0 ? (
                      <div className="p-20 text-center space-y-4">
                         <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto">
                            <Files className="w-8 h-8 text-slate-200" />
                         </div>
                         <p className="text-xs font-bold text-slate-400">Zero documents staged. Upload files to begin indexing.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                        {matter.documents.map((doc: any) => (
                           <div key={doc.id} className="p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/30 flex items-center justify-between transition-colors">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg"><FileText className="w-4 h-4 text-indigo-500" /></div>
                                <div className="space-y-0.5">
                                   <div className="text-sm font-bold text-slate-900 dark:text-white">{doc.name}</div>
                                   <div className="text-[10px] font-bold text-slate-400 uppercase">Stage: {doc.task?.stage || "Global"}</div>
                                </div>
                             </div>
                             <div className="text-right text-[10px] font-bold text-slate-400">
                                {format(new Date(doc.uploaded_at), "MMM d, HH:mm")}
                             </div>
                           </div>
                        ))}
                      </div>
                    )}
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-600/20 space-y-4">
                   <h3 className="text-xs font-black uppercase tracking-widest italic opacity-80">VDR Integrity</h3>
                   <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <span className="text-[10px] font-bold">Total Size</span>
                      <span className="text-xs font-black">0.0 MB</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold">Encrypted</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                   </div>
                   <button className="w-full py-2.5 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest">
                     Secure Upload
                   </button>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Subsystem (Live Prisma Activity) */}
        {activeTab === "timeline" && (
           <div className="max-w-3xl mx-auto py-8 space-y-6 animate-in slide-in-from-bottom-2 duration-500">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white italic">Audit Trail & Pulse</h2>
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
                 {(matter.auditLogs || []).length === 0 ? (
                   <p className="text-center py-12 text-xs font-bold text-slate-400 italic">No activity recorded yet for this deal.</p>
                 ) : (
                    <div className="space-y-8">
                      {matter.auditLogs.map((log: any, i: number) => (
                        <div key={log.id} className="relative flex gap-6 group">
                          {i !== matter.auditLogs.length - 1 && (
                            <div className="absolute left-[11px] top-6 bottom-[-32px] w-[2px] bg-slate-100 dark:bg-zinc-800" />
                          )}
                          <div className={`z-10 w-6 h-6 rounded-full border-4 border-white dark:border-zinc-900 shrink-0 flex items-center justify-center ${
                             log.action.includes('CREATE') ? 'bg-indigo-500' :
                             log.action.includes('UPDATE') ? 'bg-amber-500' : 'bg-slate-400'
                          }`}>
                             {log.action.includes('DOCUMENT') ? <FileText className="w-2.5 h-2.5 text-white" /> : <Activity className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <div className="space-y-1 pb-2">
                             <div className="text-sm font-bold text-slate-900 dark:text-white">
                                {log.action.replace(/_/g, ' ')}
                             </div>
                             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <User className="w-3 h-3" /> Partner SM • {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                             </div>
                             {log.metadata && (
                               <div className="mt-2 p-2 bg-slate-50 dark:bg-zinc-950/50 rounded-lg text-[10px] font-mono text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">
                                  {JSON.stringify(log.metadata)}
                               </div>
                             )}
                          </div>
                        </div>
                      ))}
                    </div>
                 )}
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
