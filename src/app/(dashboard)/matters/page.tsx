import { Plus, Search, Briefcase, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function MattersIndex() {
  const mattersData = await prisma.matter.findMany({
    orderBy: { created_at: "desc" },
    include: {
      entity: true,
      tasks: true,
      members: {
        include: {
          user: true
        }
      }
    }
  });

  const matters = mattersData as any[];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
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
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matters.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4">
            <Briefcase className="w-16 h-16 text-slate-200 mx-auto" />
            <div className="text-slate-400 font-bold">No active matters found. Create a new matter to start collaborating.</div>
          </div>
        ) : (
          matters.map((matter: any) => {
            const completedTasks = (matter.tasks as any[]).filter((t: any) => t.status === 'Completed').length;
            const totalTasks = matter.tasks.length;
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            const latestTaskWithDate = (matter.tasks as any[]).sort((a: any, b: any) => (b.due_date?.getTime() || 0) - (a.due_date?.getTime() || 0))[0];

            return (
              <Link href={`/matters/${matter.id}`} key={matter.id} className="group bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-[240px]">
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
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
                  <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-1 uppercase tracking-widest truncate">{matter.entity?.name || "Independent"}</div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight line-clamp-2">{matter.name}</h3>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" /> 
                    {latestTaskWithDate?.due_date ? `Due ${format(latestTaskWithDate.due_date, 'MMM d')}` : 'No deadline'}
                  </div>
                  <div className="flex -space-x-2">
                    {matter.members.slice(0, 3).map((m: any, i: number) => (
                      <div key={i} title={m.user.name || ""} className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-zinc-300">
                        {m.user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || "?"}
                      </div>
                    ))}
                    {matter.members.length > 3 && (
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] font-black text-slate-400">
                        +{matter.members.length - 3}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      progress > 75 ? 'bg-emerald-500' : progress > 30 ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-zinc-600'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
