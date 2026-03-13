import { useState } from "react";
import toast from "react-hot-toast";

export interface ParsedSubSection {
  marker: string;
  text: string;
}

export interface ParsedSection {
  ch: string;
  chName: string;
  sec: string;
  title: string;
  text: string;
  type: 'section' | 'rule';
  parentSection?: string;
  subSections: ParsedSubSection[];
}

export interface ParsedData {
  metadata: { title: string; year: string; documentType: 'act' | 'rules' | 'unknown' };
  chapters: { num: string; title: string }[];
  sections: ParsedSection[];
  penalties: string[];
  repealedActs: string[];
  stats: { duplicatesRemoved: number; totalRawMatches: number };
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
      const stats = json.data.stats;
      const statsMsg = stats.duplicatesRemoved > 0 
        ? ` (${stats.duplicatesRemoved} index duplicates removed)` 
        : '';
      toast.success(`Parsed ${json.data.sections.length} ${json.data.metadata.documentType === 'rules' ? 'rules' : 'sections'}${statsMsg}`);
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
