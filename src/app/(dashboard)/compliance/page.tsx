import { 
  Calendar as CalendarIcon, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  ArrowRight,
  ShieldCheck,
  Building2
} from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay } from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ComplianceTracker() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return redirect("/login");

  // 1. Fetch live tasks for the current organization
  const tasks = await prisma.task.findMany({
    where: {
      matter: {
        org_id: session.user.orgId
      },
      due_date: { not: null },
      status: { not: "Completed" }
    },
    include: {
      matter: {
        include: {
          entity: true
        }
      }
    },
    orderBy: {
      due_date: 'asc'
    }
  });

  const overdueCount = tasks.filter(t => t.due_date && t.due_date < new Date()).length;
  const upcomingCount = tasks.length - overdueCount;

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-rose-500/10 text-rose-500 p-1.5 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Compliance & Risk</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Regulatory Calendar</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 max-w-2xl font-medium">
            Monitor critical legal deadlines, statutory filings, and corporate hygiene obligations across your organization.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="text-center px-4 border-r border-slate-100 dark:border-zinc-800">
              <div className="text-2xl font-black text-rose-500">{overdueCount}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Overdue</div>
            </div>
            <div className="text-center px-4">
              <div className="text-2xl font-black text-slate-900 dark:text-white">{upcomingCount}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upcoming</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main List Area (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Upcoming Deadlines</h2>
            </div>
            <button className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl transition-colors">
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
          </div>

          <div className="space-y-4">
            {tasks.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-[32px] p-20 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-20" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-loose">
                  No active compliance tasks found.<br/>Your regulatory pipeline is clear.
                </p>
              </div>
            ) : (
              tasks.map((task) => {
                const isOverdue = task.due_date && task.due_date < new Date();
                return (
                  <div key={task.id} className="group bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-6 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${isOverdue ? 'bg-rose-500' : 'bg-indigo-500'}`} />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full ${isOverdue ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'}`}>
                            {isOverdue ? 'Action Required' : 'On Track'}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                             Stage: {task.stage}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 leading-tight">
                          {task.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5" /> 
                            {task.matter?.entity?.name || "Global"}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> 
                            {task.due_date ? format(task.due_date, 'MMM dd, yyyy') : "No Deadline"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <div className={`text-xs font-black uppercase tracking-widest ${isOverdue ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                            {task.due_date ? format(task.due_date, 'do MMMM') : ""}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Due Date</div>
                        </div>
                        <Link href={`/matters/${task.matter_id}`} className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <ArrowRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar Info Area (1/3) */}
        <div className="space-y-8">
          <div className="bg-indigo-600 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-600/20 animate-in slide-in-from-right-8 duration-700">
            <div className="absolute -top-10 -right-10 p-4 opacity-10 rotate-12">
              <ShieldCheck className="w-48 h-48" />
            </div>
            <h3 className="text-xl font-black mb-4 relative z-10">Smart Monitoring</h3>
            <p className="text-sm font-medium text-indigo-100 leading-relaxed relative z-10 mb-8">
              Legal OS automatically monitors regulatory websites and your internal matters to flag upcoming filings before they become overdue.
            </p>
            <div className="space-y-4 relative z-10">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 mb-1">Last Sync</div>
                <div className="text-sm font-black">March 14, 2024 - 01:22 AM</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[32px] p-8">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Upcoming Milestones</h3>
            <div className="space-y-6">
              {[
                { label: "Q1 GST Filings", date: "April 20", status: "Upcoming" },
                { label: "Annual General Meeting", date: "June 15", status: "Planned" },
                { label: "Board Resolution #4", date: "March 28", status: "Urgent" }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.label}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.date}</div>
                  </div>
                  <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${item.status === 'Urgent' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
