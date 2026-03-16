"use client";
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, react/no-unescaped-entities */

import { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  Gavel, 
  ChevronRight, 
  Filter,
  Search,
  AlertCircle,
  FileText
} from "lucide-react";
import { format, isToday, isTomorrow, isFuture } from "date-fns";

interface HearingClientProps {
  initialHearings: any[];
}

export function HearingClient({ initialHearings }: HearingClientProps) {
  const [hearings, setHearings] = useState(initialHearings);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHearings = hearings.filter(h => 
    h.case?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.case?.case_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-rose-600" />
            Hearing Board
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Procedural timeline, upcoming court appearances, and judicial calendar management.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by case title or number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:ring-2 focus:ring-rose-500 focus:outline-none text-sm font-medium dark:text-white"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-black text-slate-500 hover:text-slate-900 transition-colors">
          <Filter className="w-4 h-4" /> Upcoming Only
        </button>
      </div>

      {/* Timeline List */}
      <div className="space-y-6 relative before:absolute before:left-8 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-zinc-800 before:hidden md:before:block">
        {filteredHearings.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-zinc-900 border border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl">
            <Gavel className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">No hearings scheduled. Your judicial calendar is clear.</div>
          </div>
        ) : (
          filteredHearings.map((h, i) => {
            const date = new Date(h.date);
            const isTdy = isToday(date);
            const isTmr = isTomorrow(date);

            return (
              <div key={h.id} className="relative md:pl-20 group">
                {/* Timeline Node */}
                <div className={`absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-white dark:border-zinc-900 z-10 hidden md:block transition-all duration-300 group-hover:scale-150 ${
                  isTdy ? 'bg-rose-500 animate-pulse' : isTmr ? 'bg-amber-500' : 'bg-slate-300 dark:bg-zinc-700'
                }`} />

                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[32px] p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    
                    {/* Date Block */}
                    <div className="flex items-center gap-6 min-w-[140px]">
                       <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center ${
                         isTdy ? 'bg-rose-500 text-white' : 'bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white'
                       }`}>
                          <span className="text-[10px] font-black uppercase tracking-tighter opacity-80">{format(date, 'MMM')}</span>
                          <span className="text-2xl font-black">{format(date, 'dd')}</span>
                       </div>
                       <div>
                          <p className={`text-xs font-black uppercase tracking-widest ${isTdy ? 'text-rose-600' : 'text-slate-400'}`}>
                            {isTdy ? 'Today' : isTmr ? 'Tomorrow' : format(date, 'EEEE')}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 mt-1">
                             <Clock className="w-3 h-3" /> 10:30 AM
                          </div>
                       </div>
                    </div>

                    {/* Case Info */}
                    <div className="flex-1 space-y-2">
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-md">
                            {h.status}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h.case?.case_number}</span>
                       </div>
                       <h3 className="text-lg font-black text-slate-900 dark:text-white">{h.case?.name}</h3>
                       <div className="flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-zinc-400">
                          <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {h.case?.court}</div>
                          <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> {h.case?.stage} Stage</div>
                       </div>
                    </div>

                    {/* Description/Notes */}
                    <div className="flex-1 lg:max-w-md">
                       <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 line-clamp-2 italic">
                         "{h.description || "Procedural hearing for submission of evidence and witnesses."}"
                       </p>
                    </div>

                    <button className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl hover:bg-slate-900 hover:text-white transition-all">
                       <ChevronRight className="w-5 h-5" />
                    </button>

                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
