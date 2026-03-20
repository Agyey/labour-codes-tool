"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Save, FileText, CheckCircle2, ChevronDown, 
  ChevronUp, Loader2, Landmark, Scale, FileSignature 
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// ──────────────────────────────────────────────
// HumanReviewEditor
// ──────────────────────────────────────────────

export default function HumanReviewEditor({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [doc, setDoc] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [activePane, setActivePane] = useState<"metadata" | "chapters" | "definitions">("metadata");

  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  const toggleChapter = (idx: number) => {
    setExpandedChapters(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const fetchDocument = useCallback(async () => {
    try {
      const res = await fetch(`/api/documents?id=${documentId}`);
      if (!res.ok) throw new Error("Failed to load document");
      const data = await res.json();
      setDoc(data);

      const latestAnalysis = data.analyses?.[0];
      if (latestAnalysis?.structured_data) {
        setFormData(JSON.parse(JSON.stringify(latestAnalysis.structured_data)));
      } else {
        toast.error("No extracted data found. Ensure the document is analyzed first.");
      }
    } catch (err) {
      toast.error("Failed to load editor.");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  const handleMetadataChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      // Typically, you'd send formData back to an endpoint to bulk-create Provisions.
      // For now we will mock the save to simulate the interaction.
      await new Promise(r => setTimeout(r, 1500)); 
      toast.success("Legislation & Provisions Published Successfully!");
      router.push("/library");
    } catch (err) {
      toast.error("Failed to publish document.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-200">No Structured Data Found</h2>
        <p className="text-slate-500 dark:text-zinc-500 mt-2 hover:underline cursor-pointer" onClick={() => router.back()}>
          Go back and run analysis first
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-100px)] overflow-hidden bg-white dark:bg-zinc-950 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl">
      
      {/* ────────────────────────────────────────────── */}
      {/* LEFT PANE: Source Material / Raw Text Context */}
      {/* ────────────────────────────────────────────── */}
      <div className="w-1/2 flex flex-col border-r border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex flex-col justify-center bg-white dark:bg-zinc-900">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-500 mb-2 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Ingestion Queue
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 dark:text-zinc-200 truncate pr-4">{doc?.name}</h2>
              <p className="text-xs text-slate-400 dark:text-zinc-500">Source Context</p>
            </div>
          </div>
        </div>

        {/* Content viewer */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-slate-600 dark:text-zinc-400 font-serif leading-relaxed whitespace-pre-wrap select-text">
          {doc?.raw_text || "No raw text available. Please ensure the document was parsed successfully."}
        </div>
      </div>

      {/* ────────────────────────────────────────────── */}
      {/* RIGHT PANE: Human Review Editor Forms */}
      {/* ────────────────────────────────────────────── */}
      <div className="w-1/2 flex flex-col bg-white dark:bg-zinc-900 relative">
        
        {/* Editor Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800/50 p-1 rounded-xl">
            {[
              { id: "metadata", label: "Metadata", icon: Landmark },
              { id: "chapters", label: "Chapters & Sections", icon: Scale },
              { id: "definitions", label: "Definitions", icon: FileSignature },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePane(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activePane === tab.id
                    ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={handlePublish}
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Publish Law
          </button>
        </div>

        {/* Editor Content Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/50 dark:bg-zinc-950/20">
          <AnimatePresence mode="wait">
            
            {activePane === "metadata" && (
              <motion.div
                key="metadata"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6 max-w-xl"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-200 mb-4">Core Metadata</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500 mb-1.5">
                        Full Name
                      </label>
                      <input 
                        type="text"
                        value={formData.name || ""}
                        onChange={(e) => handleMetadataChange("name", e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500 mb-1.5">
                        Short Name / Alias
                      </label>
                      <input 
                        type="text"
                        value={formData.short_name || ""}
                        onChange={(e) => handleMetadataChange("short_name", e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:outline-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500 mb-1.5">
                          Year
                        </label>
                        <input 
                          type="number"
                          value={formData.year || ""}
                          onChange={(e) => handleMetadataChange("year", e.target.value)}
                          className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500 mb-1.5">
                          Type
                        </label>
                        <select 
                          value={formData.document_type || "act"}
                          onChange={(e) => handleMetadataChange("document_type", e.target.value)}
                          className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:outline-none transition-all appearance-none"
                        >
                          <option value="act">Central Act</option>
                          <option value="rules">Rules & Regulations</option>
                          <option value="circular">Circular / Notification</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-200 mb-4 mt-8">Summary</h3>
                  <textarea 
                    value={formData.summary || ""}
                    onChange={(e) => handleMetadataChange("summary", e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-zinc-200 h-32 resize-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:outline-none transition-all"
                  />
                </div>
              </motion.div>
            )}

            {activePane === "chapters" && (
              <motion.div
                key="chapters"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-4"
              >
                {formData.chapters?.map((chapter: any, chapIdx: number) => {
                  const isExpanded = expandedChapters[chapIdx] ?? true;
                  return (
                    <div key={chapIdx} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                      <div 
                        onClick={() => toggleChapter(chapIdx)}
                        className="px-5 py-4 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400">Chapter {chapter.chapter_number}</span>
                          <span className="font-bold text-slate-800 dark:text-zinc-200">{chapter.chapter_name}</span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                      </div>

                      {isExpanded && (
                        <div className="p-5 space-y-6">
                          {chapter.sections?.map((section: any, secIdx: number) => (
                            <div key={secIdx} className="relative pl-6 border-l-2 border-indigo-100 dark:border-indigo-900/50">
                              <span className="absolute -left-2.5 top-0 w-5 h-5 bg-white dark:bg-zinc-900 border-2 border-indigo-200 dark:border-indigo-700 rounded-full flex items-center justify-center">
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                              </span>
                              
                              <div className="flex items-center gap-2 mb-2">
                                <input 
                                  className="w-16 bg-transparent border-b border-slate-200 dark:border-zinc-800 text-sm font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:border-indigo-500 px-1"
                                  value={section.section_number}
                                  onChange={(e) => {
                                    const newData = { ...formData };
                                    newData.chapters[chapIdx].sections[secIdx].section_number = e.target.value;
                                    setFormData(newData);
                                  }}
                                />
                                <input 
                                  className="flex-1 bg-transparent border-b border-slate-200 dark:border-zinc-800 text-sm font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 px-1"
                                  value={section.title}
                                  onChange={(e) => {
                                    const newData = { ...formData };
                                    newData.chapters[chapIdx].sections[secIdx].title = e.target.value;
                                    setFormData(newData);
                                  }}
                                />
                              </div>

                              <textarea 
                                className="w-full bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-slate-600 dark:text-zinc-400 h-24 resize-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:outline-none transition-all mt-2"
                                value={section.summary}
                                placeholder="Section Summary..."
                                onChange={(e) => {
                                  const newData = { ...formData };
                                  newData.chapters[chapIdx].sections[secIdx].summary = e.target.value;
                                  setFormData(newData);
                                }}
                              />

                              {section.compliance_tasks?.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {section.compliance_tasks.map((t: any, idx: number) => (
                                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-md text-xs font-semibold border border-rose-200 dark:border-rose-900/30">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Compliance: {t.task}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}

            {activePane === "definitions" && (
              <motion.div
                key="definitions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-4"
              >
                {formData.definitions?.length === 0 && (
                  <p className="text-slate-500 italic text-sm">No definitions found in this document.</p>
                )}
                {formData.definitions?.map((def: any, defIdx: number) => (
                  <div key={defIdx} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <input 
                        className="font-bold text-indigo-600 dark:text-indigo-400 bg-transparent border-b border-slate-200 dark:border-zinc-800 px-1 py-0.5 focus:outline-none focus:border-indigo-500"
                        value={def.term}
                        onChange={(e) => {
                          const newData = { ...formData };
                          newData.definitions[defIdx].term = e.target.value;
                          setFormData(newData);
                        }}
                      />
                      {def.section_ref && (
                        <span className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-500 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                          Section {def.section_ref}
                        </span>
                      )}
                    </div>
                    <textarea 
                      className="w-full bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-zinc-300 h-24 resize-none transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                      value={def.definition}
                      onChange={(e) => {
                        const newData = { ...formData };
                        newData.definitions[defIdx].definition = e.target.value;
                        setFormData(newData);
                      }}
                    />
                  </div>
                ))}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
