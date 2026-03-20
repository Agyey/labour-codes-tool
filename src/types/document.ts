/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Document {
  id: string;
  name: string;
  file_name: string;
  file_size: number;
  page_count: number;
  raw_text: string | null;
  status: "uploaded" | "analyzing" | "analyzed" | "error";
  uploaded_at: string | null;
  analyzed_at: string | null;
}

export interface Suggestion {
  id: string;
  type: string;
  target_module: string;
  suggested_data: Record<string, any>;
  confidence: number;
  status: "pending" | "approved" | "rejected" | "edited";
  created_at: string;
}

export interface Analysis {
  id: string;
  summary: string | null;
  document_type: string | null;
  structured_data: any;
  graph_nodes: number;
  graph_relationships: number;
  created_at: string;
}

export interface DocumentDetail {
  document: Document;
  analysis: Analysis | null;
  suggestions: Suggestion[];
}
