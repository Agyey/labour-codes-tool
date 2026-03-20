/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Search, Filter, Layers } from "lucide-react";

export default function SearchBase() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setIsSearching(true);
    // Simulate API delay
    setTimeout(() => {
      setResults([
        {
          id: "1",
          documentTitle: "Companies Act, 2013",
          unitType: "Section",
          number: "7",
          title: "Incorporation of company",
          snippet: "There shall be filed with the <b>Registrar</b> within whose jurisdiction the registered office of a company is proposed to be situated...",
          rank: 0.89,
        },
        {
          id: "2",
          documentTitle: "Companies (Incorporation) Rules, 2014",
          unitType: "Rule",
          number: "12",
          title: "Application for incorporation of companies",
          snippet: "An application for registration of a company shall be filed, with the <b>Registrar</b> within whose jurisdiction the registered office...",
          rank: 0.75,
        }
      ]);
      setIsSearching(false);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="block w-full pl-11 pr-32 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-lg shadow-sm"
          placeholder="Search legal provisions, definitions, or rules..."
        />
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <Filter className="w-4 h-4 text-slate-400" /> All Acts
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <Layers className="w-4 h-4 text-slate-400" /> Document Type (Act)
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Found {results.length} results
          </p>
          {results.map((r, i) => (
            <div key={i} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer group">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {r.documentTitle}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                      {r.unitType} {r.number}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {r.title}
                  </h3>
                </div>
                {/* Ranking Score Badge */}
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase text-slate-500 font-semibold mb-0.5">Relevance</span>
                  <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded-lg">
                    {Math.round(r.rank * 100)}%
                  </span>
                </div>
              </div>
              <p 
                className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: r.snippet.replace(/<b>/g, '<strong class="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1 rounded">').replace(/<\/b>/g, '</strong>') }}
              />
            </div>
          ))}
        </div>
      )}

      {query && results.length === 0 && !isSearching && (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No results found</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search terms or filters.</p>
        </div>
      )}
    </div>
  );
}
