import SearchBase from "@/components/search-ui/SearchBase";

export default function SearchPage() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <header className="text-center max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
          Deep Semantic Search
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Search across multiple Acts, Rules, and Regulations simultaneously. Powered by PostgreSQL full-text search and tsvector ranking.
        </p>
      </header>

      <SearchBase />
    </div>
  );
}
