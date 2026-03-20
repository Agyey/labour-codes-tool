import { DocumentList } from "@/components/documents/DocumentList";

export const metadata = {
  title: "Document Hub | LexNexus",
  description: "Advanced legal document management and AI analysis suite.",
};

export default function DocumentsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Document Hub</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-500 mt-1">
            Upload legal documents. AI analyzes, you validate.
          </p>
        </div>
      </div>

      {/* Document List (Client Component handles interative parts) */}
      <DocumentList />
    </div>
  );
}
