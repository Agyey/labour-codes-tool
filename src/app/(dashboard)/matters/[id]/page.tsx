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
  Clock3
} from "lucide-react";
import Link from "next/link";

export default function MatterDealRoom({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<"board" | "vdr" | "timeline">("board");

  // Mock Matter Data
  const matter = {
    name: "Reliance - Q3 Private Placement",
    client: "Reliance Industries",
    status: "Active",
    progress: 45,
    dueDate: "2026-04-15",
  };

  const columns = [
    { id: "todo", title: "To Do", count: 12, color: "bg-slate-200 dark:bg-zinc-800" },
    { id: "in_progress", title: "In Progress", count: 5, color: "bg-blue-500/20 text-blue-700 dark:text-blue-400" },
    { id: "review", title: "Client Review", count: 3, color: "bg-amber-500/20 text-amber-700 dark:text-amber-400" },
    { id: "done", title: "Completed", count: 18, color: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" },
  ];

  const tasks = [
    { id: 1, title: "Draft Board Resolution for Issue of Shares", col: "in_progress", assignee: "SK", due: "Tomorrow", priority: "High", ref: "Sec 42(1)" },
    { id: 2, title: "Client Signature: Valuation Report", col: "review", assignee: "Client", due: "Today", priority: "Urgent", overdue: true, ref: "PAS-4 Rule 14" },
    { id: 3, title: "File Form PAS-3 with ROC", col: "todo", assignee: "AM", due: "Next Week", priority: "Medium", ref: "Sec 42(8)" },
    { id: 4, title: "Dispatch Offer Letter (PAS-4)", col: "done", assignee: "SK", due: "Completed", priority: "High", ref: "Rule 14(3)" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-[1600px] mx-auto">
      {/* Matter Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 p-6 flex-shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                {matter.status}
              </span>
              <span className="text-sm font-semibold text-slate-500 dark:text-zinc-400">{matter.client}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {matter.name}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">Overall Progress</div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${matter.progress}%` }} />
                </div>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{matter.progress}%</span>
              </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors bg-slate-50 dark:bg-zinc-800 rounded-lg">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-slate-200 dark:border-zinc-800">
          {[
            { id: "board", label: "Task Board", icon: Kanban },
            { id: "vdr", label: "Data Room (VDR)", icon: Files },
            { id: "timeline", label: "Timeline", icon: Clock },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3 px-1 text-sm font-bold border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" 
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Board Content */}
      {activeTab === "board" && (
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-6 h-full min-w-max">
            {columns.map(col => (
              <div key={col.id} className="w-[350px] flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 dark:text-zinc-200">{col.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${col.color}`}>
                      {col.count}
                    </span>
                  </div>
                  <button className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-400 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pb-4">
                  {tasks.filter(t => t.col === col.id).map(task => (
                    <div key={task.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group">
                      <div className="flex items-start justify-between mb-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          task.priority === 'Urgent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
                          task.priority === 'High' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                          'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}>
                          {task.priority}
                        </span>
                        <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug mb-2">{task.title}</h4>
                      <div className="flex items-center gap-1.5 mb-4">
                        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {task.ref}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-800/50 pt-3">
                        <div className={`flex items-center gap-1.5 text-xs font-medium ${(task as any).overdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-zinc-400'}`}>
                          {(task as any).overdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock3 className="w-3.5 h-3.5" />}
                          {task.due}
                        </div>
                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[10px] font-black border border-indigo-200 dark:border-indigo-700 uppercase">
                          {task.assignee}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button className="w-full py-3 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 text-sm font-semibold text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Add Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VDR Content Placeholder */}
      {activeTab === "vdr" && (
        <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-4">
            <Files className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Virtual Data Room</h2>
          <p className="text-slate-500 dark:text-zinc-400 max-w-sm">Secure document storage for this deal. Upload board resolutions, term sheets, and compliance filings here.</p>
        </div>
      )}
    </div>
  );
}
