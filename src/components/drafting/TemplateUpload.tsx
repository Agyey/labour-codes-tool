"use client";

import { useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";
import mammoth from "mammoth";
import { motion, AnimatePresence } from "framer-motion";

interface TemplateUploadProps {
  onTemplateProcessed: (variables: string[], rawHtml: string, fileName: string) => void;
}

export function TemplateUpload({ onTemplateProcessed }: TemplateUploadProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const processFile = async (file: File) => {
    if (!file.name.endsWith(".docx")) {
      setError("Please upload a valid Microsoft Word (.docx) document.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const rawHtml = result.value;

      // Extract {{Variables}} from the raw HTML text using Regex
      const variableRegex = /{{([\w\s]+)}}/g;
      const matches = Array.from(rawHtml.matchAll(variableRegex));
      
      // Deduplicate the matched variables
      const uniqueVariables = Array.from(new Set(matches.map(m => m[1].trim())));

      onTemplateProcessed(uniqueVariables, rawHtml, file.name);
    } catch (err) {
      console.error("Failed to parse docx", err);
      setError("Failed to read the document. Ensure it is a valid .docx file without password protection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 mb-3 tracking-tight">
          Upload Master Template
        </h2>
        <p className="text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
          Drag and drop your firm&apos;s standard <code className="bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-purple-600 dark:text-purple-400">.docx</code> template containing bracketed <code className="bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-purple-600 dark:text-purple-400">{"{{Variables}}"}</code>.
        </p>
      </div>

      <div 
        onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
        onDragLeave={() => setIsHovering(false)}
        onDrop={handleDrop}
        className={`relative overflow-hidden border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-300 ${
          isHovering 
            ? "border-purple-500 bg-purple-50/50 dark:bg-purple-900/10 scale-[1.02] shadow-xl shadow-purple-900/5" 
            : "border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-slate-400 dark:hover:border-zinc-600 shadow-sm"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 transition-opacity hover:opacity-100" />
        
        <input 
          type="file" 
          accept=".docx"
          onChange={(e) => e.target.files && processFile(e.target.files[0])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
        />
        
        <div className="relative z-20 flex flex-col items-center pointer-events-none">
          {isLoading ? (
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" />
          ) : (
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${isHovering ? "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400" : "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500"}`}>
              <UploadCloud className="w-10 h-10" />
            </div>
          )}
          
          <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-200 mb-2">
            {isLoading ? "Extracing Variables..." : "Click or drag your DOCX here"}
          </h3>
          <p className="text-sm text-slate-500 dark:text-zinc-500 font-medium">
            Maximum file size 10MB.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-900/50"
          >
            <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-semibold">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guide */}
      <div className="mt-12 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-6 border border-slate-100 dark:border-zinc-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4" /> Document Rules
        </h4>
        <ul className="text-sm text-slate-600 dark:text-zinc-400 space-y-2 list-disc pl-4 marker:text-slate-300">
          <li>For dynamic text, use double curly braces: <span className="font-mono bg-white dark:bg-zinc-900 px-1 border border-slate-200 dark:border-zinc-700 rounded text-purple-600">{"{{Effective_Date}}"}</span></li>
          <li>Spaces in variables are allowed but underscores are recommended.</li>
          <li>Formatting like bold or italics applied to variables handles perfectly.</li>
        </ul>
      </div>
    </div>
  );
}
