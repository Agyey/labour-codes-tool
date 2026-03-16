"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Brain,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Shield,
  GitBranch,
  Loader2,
  Search,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface Document {
  id: string;
  name: string;
  file_name: string;
  file_size: number;
  page_count: number;
  status: "uploaded" | "analyzing" | "analyzed" | "error";
  uploaded_at: string | null;
  analyzed_at: string | null;
}

interface Suggestion {
  id: string;
  type: string;
  target_module: string;
  suggested_data: Record<string, any>;
  confidence: number;
  status: "pending" | "approved" | "rejected" | "edited";
  created_at: string;
}

interface Analysis {
  id: string;
  summary: string | null;
  document_type: string | null;
  structured_data: any;
  graph_nodes: number;
  graph_relationships: number;
  created_at: string;
}

interface DocumentDetail {
  document: Document;
  analysis: Analysis | null;
  suggestions: Suggestion[];
}

// ──────────────────────────────────────────────
// Status Badge Component
// ──────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { bg: string; text: string; icon: any }> = {
    uploaded: { bg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-700 dark:text-blue-400", icon: Clock },
    analyzing: { bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-700 dark:text-amber-400", icon: Loader2 },
    analyzed: { bg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-400", icon: CheckCircle2 },
    error: { bg: "bg-red-100 dark:bg-red-500/20", text: "text-red-700 dark:text-red-400", icon: AlertTriangle },
  };
  const c = configs[status] || configs.uploaded;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${c.bg} ${c.text}`}>
      <Icon className={`w-3 h-3 ${status === "analyzing" ? "animate-spin" : ""}`} />
      {status}
    </span>
  );
}

// ──────────────────────────────────────────────
// Suggestion Card
// ──────────────────────────────────────────────
function SuggestionCard({ suggestion, onApprove, onReject }: {
  suggestion: Suggestion;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const typeLabels: Record<string, { label: string; color: string; icon: any }> = {
    create_legislation: { label: "Legislation", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400", icon: FileText },
    create_provision: { label: "Provision", color: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400", icon: GitBranch },
    create_compliance_item: { label: "Compliance", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400", icon: Shield },
    create_penalty: { label: "Penalty", color: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400", icon: AlertTriangle },
    flag_repeal: { label: "Repeal", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400", icon: XCircle },
    update_provision: { label: "Update", color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400", icon: Sparkles },
  };
  const t = typeLabels[suggestion.type] || typeLabels.create_provision;
  const Icon = t.icon;

  const statusColors: Record<string, string> = {
    pending: "border-l-amber-400",
    approved: "border-l-emerald-400",
    rejected: "border-l-red-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm border-l-4 ${statusColors[suggestion.status] || "border-l-slate-300"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-2 rounded-xl ${t.color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${t.color}`}>
                {t.label}
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                {Math.round(suggestion.confidence * 100)}% confidence
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200 truncate">
              {suggestion.suggested_data.title || suggestion.suggested_data.name || suggestion.suggested_data.task || suggestion.suggested_data.repealed_act_name || "-"}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1 line-clamp-2">
              {suggestion.suggested_data.summary || suggestion.suggested_data.description || suggestion.suggested_data.due_logic || ""}
            </p>
          </div>
        </div>
        {suggestion.status === "pending" && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onApprove(suggestion.id)}
              className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
              title="Approve"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onReject(suggestion.id)}
              className="p-2 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
              title="Reject"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}
        {suggestion.status !== "pending" && (
          <StatusBadge status={suggestion.status} />
        )}
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Document Detail View
// ──────────────────────────────────────────────
function DocumentDetailView({ docId, onBack }: { docId: string; onBack: () => void }) {
  const [detail, setDetail] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "suggestions" | "structure">("summary");

  const fetchDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/documents?id=${docId}`);
      const data = await res.json();
      setDetail(data);
    } catch { toast.error("Failed to load document"); }
    finally { setLoading(false); }
  }, [docId]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/documents?id=${docId}&action=analyze`);
      const data = await res.json();
      if (res.ok) {
        toast.success(`Analysis complete! ${data.suggestion_count} suggestions generated.`);
        fetchDetail();
      } else {
        toast.error(data.detail || "Analysis failed");
      }
    } catch { toast.error("Analysis failed"); }
    finally { setAnalyzing(false); }
  };

  const handleApprove = async (suggestionId: string) => {
    try {
      const res = await fetch(`/api/documents?suggestionId=${suggestionId}&action=approve`, { method: "PATCH" });
      if (res.ok) {
        toast.success("Suggestion approved & materialized!");
        fetchDetail();
      } else { toast.error("Approval failed"); }
    } catch { toast.error("Approval failed"); }
  };

  const handleReject = async (suggestionId: string) => {
    try {
      const res = await fetch(`/api/documents?suggestionId=${suggestionId}&action=reject`, { method: "PATCH" });
      if (res.ok) {
        toast.success("Suggestion rejected.");
        fetchDetail();
      } else { toast.error("Rejection failed"); }
    } catch { toast.error("Rejection failed"); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }
  if (!detail) return null;

  const { document: doc, analysis, suggestions } = detail;
  const pendingSuggestions = suggestions.filter(s => s.status === "pending");
  const approvedSuggestions = suggestions.filter(s => s.status === "approved");
  const rejectedSuggestions = suggestions.filter(s => s.status === "rejected");
  const tabs = [
    { key: "summary", label: "Summary", count: null },
    { key: "suggestions", label: "Suggestions", count: pendingSuggestions.length },
    { key: "structure", label: "Structure", count: null },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-zinc-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{doc.name}</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-500 mt-1">
            {doc.file_name} · {doc.page_count} pages · {(doc.file_size / 1024).toFixed(0)} KB
          </p>
        </div>
        <StatusBadge status={doc.status} />
        {doc.status === "uploaded" && (
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold uppercase tracking-wider rounded-2xl hover:scale-105 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50"
          >
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            {analyzing ? "Analyzing..." : "Analyze with AI"}
          </button>
        )}
      </div>

      {/* Stats Row */}
      {analysis && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Graph Nodes", value: analysis.graph_nodes, color: "text-indigo-600 dark:text-indigo-400" },
            { label: "Relationships", value: analysis.graph_relationships, color: "text-violet-600 dark:text-violet-400" },
            { label: "Pending Review", value: pendingSuggestions.length, color: "text-amber-600 dark:text-amber-400" },
            { label: "Approved", value: approvedSuggestions.length, color: "text-emerald-600 dark:text-emerald-400" },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      {analysis && (
        <>
          <div className="flex gap-1 bg-slate-100 dark:bg-zinc-800 rounded-2xl p-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.key
                    ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-zinc-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px]">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "summary" && (
              <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-3">AI Executive Summary</h3>
                <p className="text-slate-700 dark:text-zinc-300 leading-relaxed text-sm whitespace-pre-wrap">
                  {analysis.summary || "No summary generated yet."}
                </p>
                {analysis.document_type && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-2">Type:</span>
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 capitalize">{analysis.document_type}</span>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "suggestions" && (
              <motion.div key="suggestions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {suggestions.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
                    <Sparkles className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No suggestions yet. Run AI analysis first.</p>
                  </div>
                ) : (
                  <>
                    {pendingSuggestions.length > 0 && (
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                          {pendingSuggestions.length} pending review
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => pendingSuggestions.forEach(s => handleApprove(s.id))}
                            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                          >
                            Approve All ({pendingSuggestions.length})
                          </button>
                        </div>
                      </div>
                    )}
                    {suggestions.map(s => (
                      <SuggestionCard key={s.id} suggestion={s} onApprove={handleApprove} onReject={handleReject} />
                    ))}
                  </>
                )}
              </motion.div>
            )}

            {activeTab === "structure" && (
              <motion.div key="structure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-4">Document Structure (Vectorless RAG Tree)</h3>
                {analysis.structured_data?.chapters ? (
                  <div className="space-y-3">
                    {analysis.structured_data.chapters.map((ch: any, i: number) => (
                      <details key={i} className="group">
                        <summary className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 p-3 rounded-xl transition-colors">
                          <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Ch. {ch.chapter_number}</span>
                          <span className="text-sm font-semibold text-slate-800 dark:text-zinc-200">{ch.chapter_name}</span>
                          <span className="ml-auto text-[10px] text-slate-400">{ch.sections?.length || 0} sections</span>
                        </summary>
                        <div className="ml-8 mt-1 space-y-1">
                          <p className="text-xs text-slate-500 dark:text-zinc-500 mb-2 italic">{ch.summary}</p>
                          {ch.sections?.map((sec: any, j: number) => (
                            <details key={j} className="group/sec">
                              <summary className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 p-2 rounded-lg transition-colors">
                                <ChevronRight className="w-3 h-3 text-slate-400 group-open/sec:rotate-90 transition-transform" />
                                <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400">§{sec.section_number}</span>
                                <span className="text-xs text-slate-700 dark:text-zinc-300">{sec.title}</span>
                              </summary>
                              <div className="ml-6 p-2">
                                <p className="text-xs text-slate-500 dark:text-zinc-500">{sec.summary}</p>
                              </div>
                            </details>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Structure data not available.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Show analyze button prominently if not yet analyzed */}
      {doc.status === "uploaded" && !analysis && (
        <div className="text-center py-16 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/5 dark:to-purple-500/5 rounded-3xl border-2 border-dashed border-indigo-200 dark:border-indigo-500/20">
          <Brain className="w-16 h-16 text-indigo-300 dark:text-indigo-500/50 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-zinc-300 mb-2">Document uploaded successfully</h3>
          <p className="text-sm text-slate-500 dark:text-zinc-500 mb-6 max-w-md mx-auto">
            Click below to analyze this document with AI. It will extract the full legal hierarchy, generate compliance suggestions, and build a vectorless RAG graph.
          </p>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-2xl hover:scale-105 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-3 mx-auto disabled:opacity-50"
          >
            {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {analyzing ? "Analyzing with Gemini..." : "Analyze Document"}
          </button>
        </div>
      )}

      {analyzing && (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-zinc-300 mb-2">Analyzing with Gemini 2.5 Pro...</h3>
          <p className="text-sm text-slate-500 dark:text-zinc-500">Extracting legal hierarchy, building graph, generating suggestions...</p>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Main Documents Page
// ──────────────────────────────────────────────
export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.name.endsWith(".pdf")) {
      toast.error("Only PDF files are supported.");
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
        setSelectedDocId(data.id);
      } else {
        toast.error(data.detail || data.error || "Upload failed");
      }
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  };

  const filteredDocs = documents.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedDocId) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <DocumentDetailView docId={selectedDocId} onBack={() => { setSelectedDocId(null); fetchDocuments(); }} />
      </div>
    );
  }

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
        <input id="file-input" type="file" accept=".pdf" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
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
              Drop your PDF here or <span className="text-indigo-600 dark:text-indigo-400">click to browse</span>
            </p>
            <p className="text-xs text-slate-400 dark:text-zinc-600">
              PDF files up to 50MB — Acts, Rules, Amendments, Notifications
            </p>
          </div>
        )}
      </div>

      {/* Search */}
      {documents.length > 0 && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
          />
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
          {filteredDocs.map((doc) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedDocId(doc.id)}
              className="group flex items-center gap-4 p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:shadow-lg hover:shadow-indigo-500/5 hover:border-indigo-200 dark:hover:border-indigo-500/30 cursor-pointer transition-all"
            >
              <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 truncate">{doc.name}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
                  {doc.page_count} pages · {(doc.file_size / 1024).toFixed(0)} KB
                  {doc.uploaded_at && ` · ${new Date(doc.uploaded_at).toLocaleDateString()}`}
                </p>
              </div>
              <StatusBadge status={doc.status} />
              <ChevronRight className="w-5 h-5 text-slate-300 dark:text-zinc-700 group-hover:text-indigo-500 transition-colors" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
