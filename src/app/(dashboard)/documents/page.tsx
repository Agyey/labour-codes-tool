import { DocumentList } from "@/components/documents/DocumentList";

export const metadata = {
  title: "Ingestion Queue | Legal Intelligence",
  description: "Upload and monitor legal documents moving through the AI extraction pipeline.",
};

export default function DocumentsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Ingestion Queue</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-500 mt-1">
            Upload PDFs to the AI Extractor (Agent 0). The pipeline automatically processes them into the SQL Database.
          </p>
        </div>
      </div>

      {/* Document List (Client Component handles interative parts) */}
      <DocumentList />
    </div>
  );
}
