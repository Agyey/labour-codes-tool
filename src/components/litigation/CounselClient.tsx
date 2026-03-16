"use client";
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  Star, 
  Mail, 
  Phone, 
  Building2, 
  Award,
  Filter,
  MoreVertical,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { CreateCounselModal } from "./CreateCounselModal";

interface CounselClientProps {
  initialCounsels: any[];
}

export function CounselClient({ initialCounsels }: CounselClientProps) {
  const [counsels, setCounsels] = useState(initialCounsels);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCounsels = counsels.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.firm?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-slate-700" />
            Counsel Repository
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Empanelled legal experts, performance analytics, and specialized litigation counsel.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold hover:scale-105 active:scale-95 transition-transform shadow-md"
        >
          <Plus className="w-5 h-5" /> Empanel Counsel
        </button>
      </div>

      {/* Stats/Filters Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, firm, or specialization..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:ring-2 focus:ring-slate-500 focus:outline-none text-sm font-medium dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {["All", "Arbitration", "Labour", "Criminal", "Civil", "Tax"].map(tag => (
            <button key={tag} className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-slate-500 hover:border-slate-900 dark:hover:border-zinc-400 transition-colors">
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Counsel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCounsels.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white dark:bg-zinc-900 border border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl">
            <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">No counsels found. Empanel your first expert.</div>
          </div>
        ) : (
          filteredCounsels.map((c) => (
            <div key={c.id} className="group bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[32px] p-6 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
               {/* Rating Badge */}
               <div className="absolute top-6 right-6 flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="text-[10px] font-black text-amber-700 dark:text-amber-400">{c.rating.toFixed(1)}</span>
               </div>

               <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-all">
                       <Users className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{c.name}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{c.representative_name || "Lead Counsel"}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-500 dark:text-zinc-400">
                      <Building2 className="w-3.5 h-3.5" /> {c.firm || "Independent Practice"}
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-500 dark:text-zinc-400">
                      <Award className="w-3.5 h-3.5" /> Specialist: {c.specialization || "General Litigation"}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <a href={`mailto:${c.email}`} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                       <Mail className="w-3 h-3" /> Email
                    </a>
                    <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                       <Phone className="w-3 h-3" /> Contact
                    </button>
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">Standard Rate</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">₹{c.hourly_rate?.toLocaleString()}/hr</span>
                     </div>
                     <button className="p-2 bg-slate-50 dark:bg-zinc-800 rounded-xl hover:bg-slate-900 group-hover:text-white transition-all cursor-pointer">
                        <ChevronRight className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
      <CreateCounselModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={(newCounsel: any) => setCounsels([newCounsel, ...counsels])}
      />
    </div>
  );
}
