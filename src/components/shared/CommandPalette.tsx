"use client";

import { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { useUI } from "@/context/UIContext";
import { Search, Command, FileText } from "lucide-react";
import { CODES } from "@/config/codes";
import { AnimatePresence, motion } from "framer-motion";

export function CommandPalette() {
  const { provisions } = useData();
  const { setActiveCode, setExpandedProvision, setActiveView } = useUI();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const results = query
    ? provisions.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.fullText.toLowerCase().includes(q) ||
          `s.${p.sec}${p.sub}`.toLowerCase().includes(q)
        );
      })
    : [];

  const handleSelect = (codeKey: string, provId: string) => {
    setActiveCode(codeKey as keyof typeof CODES);
    setActiveView("mapping");
    setExpandedProvision(provId);
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-black/20 hover:bg-black/30 border border-white/10 rounded-lg text-white/70 text-xs transition-colors"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="font-medium">Search provisions...</span>
        <kbd className="ml-4 font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/50 flex items-center gap-0.5">
          <Command className="w-3 h-3" /> K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15 }}
              className="fixed top-[15%] left-1/2 -translate-x-1/2 w-[90%] max-w-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden z-[2001] border border-gray-100"
            >
              <div className="flex items-center px-4 py-4 border-b border-gray-100">
                <Search className="w-5 h-5 text-blue-500 mr-3" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask or search across all Labour Codes..."
                  className="flex-1 text-base outline-none bg-transparent placeholder:text-gray-400 font-medium"
                />
                <div className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">ESC</div>
              </div>

              <div className="max-h-[400px] overflow-y-auto p-2">
                {!query && (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    Type to search through all code provisions, summaries, and statutes.
                  </div>
                )}
                
                {query && results.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    No results found for &quot;{query}&quot;
                  </div>
                )}

                {query && results.length > 0 && (
                  <div className="space-y-1">
                    {results.slice(0, 8).map((p) => {
                      const cObj = CODES[p.code as keyof typeof CODES];
                      return (
                        <button
                          key={p.id}
                          onClick={() => handleSelect(p.code, p.id)}
                          className="w-full flex items-start gap-3 p-3 text-left rounded-xl hover:bg-gray-50 transition-colors group"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: `${cObj.c}15`, color: cObj.c }}
                          >
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                S.{p.sec}{p.sub} {p.title}
                              </span>
                              <span
                                className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider whitespace-nowrap"
                                style={{ backgroundColor: cObj.bg, color: cObj.c }}
                              >
                                {cObj.s}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-1 mt-1 font-medium leading-relaxed">
                              {p.summary}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 text-[10px] text-gray-500 flex justify-between">
                <span>Navigate instantly across 4 codes</span>
                {results.length > 8 && <span>Showing top 8 results</span>}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
