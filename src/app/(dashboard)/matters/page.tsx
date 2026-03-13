"use client";

import { useState } from "react";
import { Plus, Search, Briefcase, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function MattersIndex() {
  const [searchQuery, setSearchQuery] = useState("");

  const mockMatters = [
    { id: "1", name: "Reliance - Q3 Private Placement", client: "Reliance Industries", status: "Active", progress: 45, date: "Apr 15", team: ["SK", "AM", "JS"] },
    { id: "2", name: "Tata Motors - ESOP Restructuring", client: "Tata Motors", status: "Review", progress: 85, date: "Mar 20", team: ["JS", "SK"] },
    { id: "3", name: "Zomato - Seed Round", client: "Zomato", status: "On Hold", progress: 15, date: "May 01", team: ["AM"] },
    { id: "4", name: "Infosys - Whistleblower Audit", client: "Infosys", status: "Active", progress: 60, date: "Mar 30", team: ["SK", "AM"] },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-indigo-500" />
            Active Matters
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Manage and track your firm's ongoing transactional and compliance engagements.</p>
        </div>
        
        <button className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2.5 rounded-xl font-bold hover:scale-105 active:scale-95 transition-transform shadow-md">
          <Plus className="w-5 h-5" /> New Matter
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search deals, clients..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockMatters.map(matter => (
          <Link href={`/matters/${matter.id}`} key={matter.id} className="group bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-[220px]">
            <div className="flex items-start justify-between mb-4">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${
                matter.status === 'Active' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400' :
                matter.status === 'Review' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-400'
              }`}>
                {matter.status}
              </span>
              <div className="text-slate-400 group-hover:text-indigo-500 transition-colors group-hover:translate-x-1 duration-300">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>

            <div className="flex-1">
              <div className="text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1">{matter.client}</div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight line-clamp-2">{matter.name}</h3>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
                <Clock className="w-4 h-4" /> Due {matter.date}
              </div>
              <div className="flex -space-x-2">
                {matter.team.map((m, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-zinc-300">
                    {m}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  matter.progress > 75 ? 'bg-emerald-500' : matter.progress > 40 ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-zinc-600'
                }`}
                style={{ width: `${matter.progress}%` }}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
