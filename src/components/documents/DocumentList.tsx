/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

import { Upload, FileText, Loader2, Search } from "lucide-react";
import toast from "react-hot-toast";
import { Document } from "@/types/document";

import { DocumentDetailView } from "@/components/documents/DocumentDetailView";
import { IngestJobCard } from "@/components/documents/IngestJobCard";
import { PipelineProgressTracker } from "@/components/documents/PipelineProgressTracker";
import { confirmAction } from "@/lib/confirm";

interface DocumentListProps {
  initialDocuments?: Document[];
}

export function DocumentList({ initialDocuments = [] }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [loading, setLoading] = useState(initialDocuments.length === 0);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debouncing search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (initialDocuments.length === 0) {
      fetchDocuments();
    }
  }, [fetchDocuments, initialDocuments.length]);

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const allowed = [".pdf", ".docx", ".doc", ".xlsx", ".xls", ".txt", ".csv"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    
    if (!allowed.includes(ext)) {
      toast.error(`Unsupported file type. Allowed: ${allowed.join(", ")}`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/documents?action=upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Uploaded: ${data.name}`);
        fetchDocuments();
        setSelectedJobId(data.job_id);
      } else {
        toast.error(data.detail || data.error || "Upload failed");
      }
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  }, [fetchDocuments]);

  const handleDelete = useCallback(async (e: React.MouseEvent, docId: string, docName: string) => {
    e.stopPropagation();
    if (!(await confirmAction(`Delete "${docName}" and all its analysis? This cannot be undone.`))) return;
    try {
      const res = await fetch(`/api/documents?id=${docId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Document deleted");
        fetchDocuments();
      } else {
        const err = await res.json();
        toast.error(err.detail || err.error || "Delete failed");
      }
    } catch { toast.error("Delete failed"); }
  }, [fetchDocuments]);

  const filteredDocs = useMemo(() => {
    return documents.filter(d =>
      d.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      d.file_name.toLowerCase().includes(debouncedSearch.toLowerCase())
    ).slice(0, 20); // Limit to 20 for initial view performance
  }, [documents, debouncedSearch]);

  if (selectedJobId) {
    return (
      <div className="p-0">
        <PipelineProgressTracker 
          jobId={selectedJobId} 
          onComplete={() => {
            // Option 1: fetchDocuments then go back to list
            // Option 2: clear selectedJobId and it goes back to list automatically
          }} 
        />
        <button 
           onClick={() => { setSelectedJobId(null); fetchDocuments(); }}
           className="mt-6 px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors font-semibold shadow-sm text-sm"
        >
          ← Back to Queue
        </button>
      </div>
    );
  }

  if (selectedDocId) {
    return (
      <div className="p-0">
        <DocumentDetailView docId={selectedDocId} onBack={() => { setSelectedDocId(null); fetchDocuments(); }} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
        className={`relative rounded-3xl border-2 border-dashed p-12 text-center transition-all cursor-pointer ${
          dragOver
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 scale-[1.01]"
            : "border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-indigo-300 dark:hover:border-indigo-500/40"
        }`}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input id="file-input" type="file" accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.csv" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Uploading & extracting text...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl">
              <Upload className="w-8 h-8 text-indigo-500" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">
              Drop your Document here or <span className="text-indigo-600 dark:text-indigo-400">click to browse</span>
            </p>
            <p className="text-xs text-slate-400 dark:text-zinc-600">
              Files up to 50MB — Acts, Rules, Amendments, Notifications, Contracts
            </p>
          </div>
        )}
      </div>

      {/* Search */}
      {(documents.length > 0 || searchQuery) && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
          />
          {searchQuery !== debouncedSearch && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            </div>
          )}
        </div>
      )}

      {/* Document List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800">
          <FileText className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
          <p className="text-lg font-bold text-slate-400 dark:text-zinc-600">
            {documents.length === 0 ? "No documents uploaded yet" : "No matching documents"}
          </p>
          <p className="text-sm text-slate-400 dark:text-zinc-600 mt-1">Upload your first Act or legal document to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocs.map((doc: any) => (
            <IngestJobCard 
              key={doc.id}
              job={doc}
              onClick={(id, isJob) => {
                if (isJob) {
                  setSelectedJobId(id);
                } else {
                  setSelectedDocId(id);
                }
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
