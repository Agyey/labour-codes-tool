/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import toast from "react-hot-toast";
import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";

export function usePdfParser() {
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);
  const { activeCode } = useUI();
  const { frameworks } = useData();

  const uploadAndParse = async (file: File) => {
    if (!file || file.type !== "application/pdf") {
      toast.error("Please select a valid PDF file");
      return null;
    }

    setIsParsing(true);
    setParsedResult(null);

    const formData = new FormData();
    formData.append("file", file);
    
    // Pass active code or framework
    const currentFramework = frameworks.find(f => f.shortName === activeCode || f.id === activeCode);
    const frameworkId = currentFramework ? currentFramework.id : activeCode;
    formData.append("framework_id", frameworkId);

    try {
      // Hits the Next.js proxy -> Python Backend
      const response = await fetch("/api/parser", {
        method: "POST",
        body: formData,
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Parsing failed");
      }

      setParsedResult(json.data);
      toast.success(json.message || `Parsed and Auto-Populated Success!`);
      return json.data;
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to parse document");
      return null;
    } finally {
      setIsParsing(false);
    }
  };

  return {
    isParsing,
    parsedResult,
    uploadAndParse,
    resetParser: () => setParsedResult(null)
  };
}
