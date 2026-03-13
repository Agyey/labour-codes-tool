import { useState } from "react";
import toast from "react-hot-toast";

export interface ParsedData {
  metadata: { title: string; year: string };
  chapters: { num: string; title: string }[];
  sections: { ch: string; chName: string; sec: string; title: string; text: string }[];
  penalties: string[];
  repealedActs: string[];
}

export function usePdfParser() {
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedData | null>(null);

  const uploadAndParse = async (file: File) => {
    if (!file || file.type !== "application/pdf") {
      toast.error("Please select a valid PDF file");
      return null;
    }

    setIsParsing(true);
    setParsedResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/parser", {
        method: "POST",
        body: formData,
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Parsing failed");
      }

      setParsedResult(json.data);
      toast.success(`Successfully parsed document! Extracted ${json.data.sections.length} sections.`);
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
