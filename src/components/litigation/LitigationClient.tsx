"use client";

import { useState } from "react";
import { 
  Gavel, 
  Search, 
  Plus, 
  Scale, 
  Clock, 
  ChevronRight, 
  AlertCircle,
  ShieldCheck,
  FileText,
  User,
  MoreVertical
} from "lucide-react";
import { format } from "date-fns";
import { CreateCaseModal } from "./CreateCaseModal";

interface LitigationClientProps {
  initialCases: any[];
  matters: any[];
}

export function LitigationClient({ initialCases, matters }: LitigationClientProps) {
  const [cases, setCases] = useState(initialCases);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCases = cases.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.case_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalExposure = cases.reduce((acc, c) => acc + (c.exposure_amount || 0), 0);
  const activeCases = cases.filter(c => c.status === "Active").length;

  const stats = [
    { label: "Active Litigations", value: activeCases.toString(), icon: Gavel, color: "text-indigo-600" },
    { label: "Upcoming Hearings", value: cases.reduce((acc, c) => acc + (c.hearings?.length || 0), 0).toString(), icon: Clock, color: "text-rose-500" },
    { label: "Total Exposure", value: `₹${(totalExposure / 10000000).toFixed(2)} Cr`, icon: Scale, color: "text-amber-500" },
    { label: "Disposition Rate", value: "92%", icon: ShieldCheck, color: "text-emerald-500" },
  ];

  const STAGES = ["Notice", "Pleadings", "Evidence", "Arguments", "Judgment"];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Gavel className="w-8 h-8 text-indigo-700" />
            Litigation Nexus
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Enterprise case tracking, counsel oversight, and procedural timeline management.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2.5 rounded-xl font-bold hover:scale-105 active:scale-95 transition-transform shadow-md cursor-pointer"
        >
          <Plus className="w-5 h-5" /> New Case
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

      {/* Search & Cases */}
      <div className="space-y-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by case title or number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-medium dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredCases.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-zinc-900 border border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl">
              <Gavel className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <div className="text-slate-400 font-bold">No litigation cases found. Start by tracking your first matter.</div>
            </div>
          ) : (
            filteredCases.map((c) => (
              <div key={c.id} className="group bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  
                  {/* Basic Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                       <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                         c.status === 'Active' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                       }`}>
                         {c.status}
                       </span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.case_number || "Draft No."}</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                      {c.name}
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5"><Scale className="w-3.5 h-3.5" /> {c.court || "Jurisdiction Not Set"}</div>
                      <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> {c.matter?.name || "Independent"}</div>
                    </div>
                  </div>

                  {/* Visual Stage Tracker */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Case Progression</span>
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{c.stage} Stage</span>
                    </div>
                    <div className="flex gap-1.5">
                      {STAGES.map((s, i) => {
                        const currentIdx = STAGES.indexOf(c.stage);
                        const isPast = i < currentIdx;
                        const isCurrent = i === currentIdx;
                        return (
                          <div 
                            key={s} 
                            title={s}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                              isPast ? 'bg-indigo-500' : isCurrent ? 'bg-indigo-600 ring-4 ring-indigo-500/20' : 'bg-slate-100 dark:bg-zinc-800'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions / Next Hearing */}
                  <div className="flex items-center gap-6 lg:border-l border-slate-100 dark:border-zinc-800 lg:pl-8">
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Next Hearing</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white">
                        {c.hearings?.[0] ? format(new Date(c.hearings[0].date), "MMM d, yyyy") : "Yet to be listed"}
                      </div>
                    </div>
                    <button className="p-3 bg-slate-50 dark:bg-zinc-800 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <CreateCaseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        matters={matters}
        onSuccess={(newCase) => setCases([newCase, ...cases])}
      />
    </div>
  );
}
