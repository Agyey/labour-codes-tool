"use client";

import { useMemo } from "react";
import { Download, RefreshCcw } from "lucide-react";
import DOMPurify from "dompurify";

interface DocumentPreviewProps {
  rawHtml: string;
  values: Record<string, string>;
  onReset: () => void;
}

/**
 * Allowed tags for DOMPurify — supports legal document formatting
 * but blocks all script/event-handler attack vectors.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PURIFY_CONFIG: any = {
  ALLOWED_TAGS: [
    "p", "br", "strong", "em", "u", "s", "mark", "span", "div",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li", "table", "thead", "tbody", "tr", "th", "td",
    "blockquote", "pre", "code", "sub", "sup", "hr",
  ],
  ALLOWED_ATTR: ["class", "style"],
};

export function DocumentPreview({ rawHtml, values, onReset }: DocumentPreviewProps) {
  
  // Replace the mustache variables in the massive HTML string with typed values
  const compiledHtml = useMemo(() => {
    let html = rawHtml;
    // For every key typed into the form, string replace the {{key}} with the <mark> styled live value
    Object.entries(values).forEach(([key, val]) => {
      if (!val) return;
      
      const target = `{{${key}}}`;
      // Split and join to replace all instances globally without dealing with Regex escaping complexities
      html = html.split(target).join(
        `<mark class="bg-purple-100 dark:bg-purple-900/40 text-purple-900 dark:text-purple-100 px-1 rounded font-semibold whitespace-pre-wrap">${val}</mark>`
      );
    });
    
    // Highlight unfilled variables in red
    html = html.replace(
      /{{([\w\s]+)}}/g, 
      `<span class="text-rose-500 font-bold underline decoration-wavy decoration-rose-300">$&</span>`
    );

    // 🛡️ Sanitize to prevent XSS — strip scripts, event handlers, iframes, etc.
    return DOMPurify.sanitize(html, PURIFY_CONFIG);
  }, [rawHtml, values]);

  return (
    <div className="w-full h-full flex flex-col bg-slate-50/50 dark:bg-zinc-950/50">
      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm z-10 sticky top-0">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Live Preview</h3>
          <p className="text-[11px] text-slate-500">Review generated changes before PDF export.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> Start Over
          </button>
          
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg shadow-md shadow-slate-900/10 hover:bg-slate-800 dark:hover:bg-white transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex justify-center">
        {/* The rich-text Document output zone styling */}
        <div 
          className="bg-white dark:bg-zinc-900 w-full max-w-[850px] min-h-[1100px] shadow-sm border border-slate-200 dark:border-zinc-800 p-12 lg:p-16 prose prose-sm sm:prose-base dark:prose-invert prose-headings:font-bold prose-p:leading-relaxed prose-purple focus:outline-none"
          dangerouslySetInnerHTML={{ __html: compiledHtml }}
        />
      </div>
    </div>
  );
}
