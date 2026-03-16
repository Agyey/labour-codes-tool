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

      // If backend returns analyzing, start polling
      if (json.status === "analyzing" && json.documentId) {
        toast.success("Document uploaded, analyzing in background...");
        
        let pollCount = 0;
        const maxPolls = 60; // 3 minutes total (60 * 3s)
        
        const pollInterval = setInterval(async () => {
          pollCount++;
          try {
            const pollRes = await fetch(`/api/parser?id=${json.documentId}`);
            const pollData = await pollRes.json();
            
            const status = pollData?.document?.status;
            
            if (status === "analyzed" || status === "error" || pollCount >= maxPolls) {
              clearInterval(pollInterval);
              setIsParsing(false);
              
              if (status === "error" || pollCount >= maxPolls) {
                  toast.error("Analysis failed or timed out.");
              } else if (pollData.analysis?.structured_data) {
                  setParsedResult(pollData.analysis.structured_data);
                  toast.success("Parsed and Auto-Populated Success!");
              }
            }
          } catch (pollErr) {
            console.error("Polling error:", pollErr);
          }
        }, 3000); // Poll every 3 seconds

        return; // Return early, don't set isParsing to false yet
      }

      setParsedResult(json.data);
      toast.success(json.message || `Parsed and Auto-Populated Success!`);
      setIsParsing(false);
      return json.data;
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to parse document");
      setIsParsing(false);
      return null;
    }
  };

  return {
    isParsing,
    parsedResult,
    uploadAndParse,
    resetParser: () => setParsedResult(null)
  };
}
