"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Layers, Network, ShieldCheck, Zap, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="pt-32 pb-24">
      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 text-center space-y-8 mb-32">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Legal OS 2.0 is Live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.1] max-w-5xl mx-auto">
          The Intelligence Layer for <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-300">
            Modern Legal Execution.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Unify your firm's knowledge graph, automate complex compliance scenarios, and execute deals in collaborative deal rooms. Built for Tier-1 firms and enterprise GCs.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-4 rounded-full text-base font-bold hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-slate-900/20 dark:shadow-white/10">
            Start Free Trial <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/#platform" className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
            Explore Platform
          </Link>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section id="platform" className="max-w-7xl mx-auto px-6 py-24 border-t border-slate-200 dark:border-zinc-800/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-4">A Complete Legal Ecosystem</h2>
          <p className="text-slate-500 dark:text-zinc-400">Everything flows. From static textbooks to dynamic deal closing.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-50 dark:bg-zinc-900/50 p-8 rounded-3xl border border-slate-200 dark:border-zinc-800/80 hover:shadow-xl transition-all group">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BookOpen className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Knowledge Graph</h3>
            <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed">Instantly upload and parse legislative Acts. Our AI automatically maps chapters, sections, penalties, and cross-references into a queryable relational database.</p>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-900/50 p-8 rounded-3xl border border-slate-200 dark:border-zinc-800/80 hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full -z-10" />
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Network className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Scenario Engine</h3>
            <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed">Map specific legal obligations to company types and triggers. Instantly generate massive, foolproof compliance checklists for M&A, Fundraising, and Incorporation.</p>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-900/50 p-8 rounded-3xl border border-slate-200 dark:border-zinc-800/80 hover:shadow-xl transition-all group">
            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Layers className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Deal Rooms</h3>
            <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed">Convert checklists into collaborative Kanban boards. Assign tasks, track dependencies, loop in clients via the secure portal, and finalize VDR documents in one place.</p>
          </div>
        </div>
      </section>

      {/* SOLUTIONS SECTION */}
      <section id="solutions" className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Enterprise Scaling for <br/> Global Counsel.</h2>
            <div className="space-y-6">
              {[
                { title: "For Tier-1 Law Firms", desc: "Manage multi-jurisdictional compliance across 100+ entities with zero manual tracking." },
                { title: "For In-House Counsel", desc: "Convert board mandates into executable task flows with automated alerting." },
                { title: "For FinTech & Compliance", desc: "Native API support for KYC and regulatory reporting directly from the knowledge engine." }
              ].map((s, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{s.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-100 dark:bg-zinc-800 rounded-[2.5rem] p-12 aspect-square flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20" />
             <div className="w-full h-full border-4 border-white/50 dark:border-zinc-700/50 rounded-3xl shadow-2xl relative z-10 flex flex-col p-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="px-3 py-1 bg-indigo-500 text-white text-[10px] font-bold rounded-full uppercase tracking-widest">Live Execution</div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-zinc-800 rounded-full animate-pulse" />
                  <div className="h-4 w-full bg-slate-100 dark:bg-zinc-800/80 rounded-full animate-pulse" />
                  <div className="h-4 w-5/6 bg-slate-100 dark:bg-zinc-800/80 rounded-full animate-pulse" />
                </div>
                <div className="mt-12 grid grid-cols-2 gap-4">
                  <div className="h-24 bg-indigo-500/10 rounded-2xl border border-indigo-500/20" />
                  <div className="h-24 bg-cyan-500/10 rounded-2xl border border-cyan-500/20" />
                </div>
                <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-indigo-500/30 blur-[80px]" />
             </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-6 mt-24">
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 dark:from-indigo-950 dark:to-zinc-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-indigo-900/20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 relative z-10">Stop practicing law on spreadsheets.</h2>
          <p className="text-indigo-200 text-lg md:text-xl max-w-2xl mx-auto mb-10 relative z-10">
            Join the top firms migrating their workflows to Legal OS. Zero migration cost. Infinite scalability.
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-full text-lg font-bold hover:scale-105 active:scale-95 transition-transform relative z-10 shadow-xl">
            Create your Organization
          </Link>
        </div>
      </section>
    </div>
  );
}
