/* eslint-disable @typescript-eslint/no-explicit-any, react/no-unescaped-entities */
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
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function FirmDashboard() {
  const session = await getServerSession(authOptions);

  // 1. Fetch real data
  const [matters, entities, overdueTasks, notifications] = await Promise.all([
    prisma.matter.findMany({
      include: {
        tasks: true,
        entity: true,
      }
    }),
    prisma.entity.findMany({
      orderBy: { health_score: "asc" },
      take: 5
    }),
    prisma.task.findMany({
      where: {
        status: { not: "Completed" },
        due_date: { lt: new Date() }
      },
      include: {
        matter: true
      },
      take: 5
    }),
    prisma.notification.findMany({
      where: {
        user_id: session?.user?.id,
        read: false
      },
      orderBy: { created_at: "desc" },
      take: 5
    })
  ]);

  // Combine and sort for the inbox
  const inboxItems = [
    ...(overdueTasks || []).map((t: any) => ({ 
      id: t.id, 
      title: t.name, 
      subtitle: t.matter?.name || "Independent Task",
      type: 'TASK' as const,
      date: t.due_date,
      urgent: true,
      link: `/matters/${t.id}`
    })),
    ...(notifications || []).map((n: any) => ({
      id: n.id,
      title: n.title,
      subtitle: n.message,
      type: 'NOTIFICATION' as const,
      date: n.created_at,
      urgent: n.type === 'URGENT',
      link: n.link
    }))
  ].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  }).slice(0, 8);

  // 2. Calculate metrics
  const activeDeals = matters.filter(m => m.status === "Active").length;
  const overdueCount = overdueTasks.length;
  
  const completedLast7Days = await prisma.task.count({
    where: {
      status: "Completed",
      updated_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }
  });

  const pendingSignatures = await prisma.task.count({
    where: {
      name: { contains: "Signature" },
      status: { not: "Completed" }
    }
  });

  const metrics = [
    { label: "Active Deals", value: activeDeals.toString(), change: "Live from database", icon: Briefcase, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Overdue Tasks", value: overdueCount.toString(), change: overdueCount > 0 ? "Requires attention" : "Everything on track", icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-500/10" },
    { label: "Completed (7d)", value: completedLast7Days.toString(), change: "Task throughput", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Pending Signatures", value: pendingSignatures.toString(), change: "Execution pipeline", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
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
            <Link href="/compliance-tracker" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:gap-2 transition-all">
              Open Compliance Hub <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            {inboxItems.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-20" />
                <p className="text-sm font-bold text-slate-400">Zero urgent items. You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {inboxItems.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${item.urgent ? 'bg-rose-500' : 'bg-indigo-500'}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.type}</span>
                          <div className="font-bold text-slate-900 dark:text-white text-sm truncate">{item.title}</div>
                        </div>
                        <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400 truncate">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 sm:w-1/3 justify-between sm:justify-end border-t border-slate-100 sm:border-0 pt-3 sm:pt-0">
                      <div className="flex flex-col items-start sm:items-end">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${item.urgent ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                          {item.date ? formatDistanceToNow(new Date(item.date), { addSuffix: true }) : "Always"}
                        </span>
                      </div>
                      {item.link && (
                        <Link href={item.link} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg">
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Client Pulse Widget (1/3 width) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-500" /> Client Hygiene Pulse
          </h2>
          
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-5">
            {entities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4 italic">No entities tracked yet.</p>
            ) : (
              entities.map((ent, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span className="text-slate-800 dark:text-zinc-200 truncate pr-2">{ent.name}</span>
                    <span className={ent.health_score > 90 ? 'text-emerald-500' : ent.health_score > 70 ? 'text-amber-500' : 'text-rose-500'}>
                      {ent.health_score}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${ent.health_score > 90 ? 'bg-emerald-500' : ent.health_score > 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${ent.health_score}%` }}
                    />
                  </div>
                </div>
              ))
            )}
            
            <Link href="/entities" className="block w-full text-center py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 rounded-xl transition-all">
              View Entity Database
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
