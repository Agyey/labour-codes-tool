"use client";

import { useState } from "react";
import { TemplateUpload } from "@/components/drafting/TemplateUpload";
import { VariableForm } from "@/components/drafting/VariableForm";
import { DocumentPreview } from "@/components/drafting/DocumentPreview";

export function AgreementsProductView() {
  const [step, setStep] = useState<"upload" | "draft">("upload");
  const [variables, setVariables] = useState<string[]>([]);
  const [rawHtml, setRawHtml] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const handleTemplateProcessed = (extractedVars: string[], html: string, name: string) => {
    setVariables(extractedVars);
    setRawHtml(html);
    setFileName(name);
    setStep("draft");
  };

  const handleReset = () => {
    setStep("upload");
    setVariables([]);
    setRawHtml("");
    setFileName("");
    setFormValues({});
  };

  if (step === "upload") {
    return <TemplateUpload onTemplateProcessed={handleTemplateProcessed} />;
  }

  return (
    <div className="h-[calc(100vh-130px)] flex border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm m-4 bg-slate-100 dark:bg-zinc-950">
      {/* Left Sidebar - Variable Form */}
      <div className="w-80 flex-shrink-0">
        <VariableForm 
          variables={variables} 
          fileName={fileName}
          onSubmit={setFormValues} 
        />
      </div>

      {/* Main Area - Live Document Preview */}
      <div className="flex-1 relative">
        <DocumentPreview 
          rawHtml={rawHtml} 
          values={formValues} 
          onReset={handleReset}
        />
      </div>
    </div>
  );
}
