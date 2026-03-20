"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, Scale, FileText, Landmark, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

interface LegalDocument {
  id: string;
  title: string;
  short_title: string | null;
  doc_type: string;
  year: number | null;
  jurisdiction: string;
}

interface LibraryClientProps {
  legislations: LegalDocument[];
}

export default function LibraryClient({ legislations }: LibraryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  const filtered = useMemo(() => {
    return legislations.filter((l) => {
      const matchesSearch =
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.short_title && l.short_title.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTab = activeTab === "all" || l.doc_type.toLowerCase() === activeTab.toLowerCase();
      return matchesSearch && matchesTab;
    });
  }, [legislations, searchQuery, activeTab]);

  // Group by type for the bucket categories
  const buckets = useMemo(() => {
    const counts: Record<string, number> = { all: legislations.length };
    legislations.forEach((l) => {
      const t = l.doc_type.toLowerCase();
      counts[t] = (counts[t] || 0) + 1;
    });
    return counts;
  }, [legislations]);

  const tabs = [
    { id: "all", label: "All Laws", icon: BookOpen },
    { id: "act", label: "Central Acts", icon: Landmark },
    { id: "rules", label: "Rules & Regulations", icon: Scale },
    { id: "circular", label: "Circulars", icon: FileText },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header section with gradient background */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 p-8 sm:p-12 mt-4 shadow-2xl">
        {/* Abstract Background Vectors */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-6 border border-indigo-500/30">
              <BookOpen className="w-3.5 h-3.5" />
              Intelligence Hub
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight mb-4">
              Knowledge <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Library</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-lg leading-relaxed">
              Explore the structured bucket system of all ingested legislations, rules, and circulars. Select an act to instantly open the Agentic Reading View.
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search central acts, rules, or circulars..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 sm:py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner backdrop-blur-md"
            />
          </div>
        </div>
      </div>

      {/* Modern Bucket Navigation */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 py-2 px-2 -mx-2 bg-slate-100/50 dark:bg-zinc-900/50 rounded-2xl p-2 border border-slate-200 dark:border-zinc-800">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = buckets[tab.id] || 0;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-shrink-0 flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-zinc-700"
                  : "text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300 hover:bg-white/50 dark:hover:bg-zinc-800/50"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${isActive ? "text-indigo-500" : ""}`} />
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-[10px] ml-1 ${
                isActive 
                  ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300" 
                  : "bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Link href={`/reading/${item.id}`} className="block h-full group">
                  <div className="h-full flex flex-col bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-500/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10`}>
                        <Scale className={`w-6 h-6 text-indigo-600 dark:text-indigo-400`} />
                      </div>
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 rounded-full text-[10px] font-bold tracking-wider uppercase">
                        {item.jurisdiction} • {item.doc_type}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    {item.short_title && item.short_title !== item.title && (
                      <p className="text-sm font-medium text-slate-500 dark:text-zinc-500 mb-4 line-clamp-1">
                        {item.short_title}
                      </p>
                    )}

                    <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800/50">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {item.year || "N/A"}
                      </div>
                      <div className="flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                        Read Act <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-zinc-800 mb-6">
                <Search className="w-8 h-8 text-slate-400 dark:text-zinc-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No legislations found</h3>
              <p className="text-slate-500 dark:text-zinc-500">
                Adjust your search or category filters to find what you&apos;re looking for.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
