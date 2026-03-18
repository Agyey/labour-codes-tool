import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Document {
  id: string;
  title: string;
  short_title?: string;
  popular_name?: string;
  document_type: string;
  year?: number;
  jurisdiction_country: string;
  jurisdiction_state?: string;
  status: string;
  created_at: string;
}

export interface StructuralUnit {
  id: string;
  document_id: string;
  parent_id?: string;
  unit_type: string;
  number?: string;
  title?: string;
  full_text?: string;
  sort_order: number;
}

export interface StructuralUnitTree extends StructuralUnit {
  children: StructuralUnitTree[];
}

export const api = {
  documents: {
    list: (skip = 0, limit = 100) => 
      client.get<Document[]>('/documents/', { params: { skip, limit } }),
    get: (id: string) => 
      client.get<Document>(`/documents/${id}`),
    create: (data: Partial<Document>) => 
      client.post<Document>('/documents/', data),
  },
  structure: {
    getTree: (documentId: string) => 
      client.get<StructuralUnitTree[]>(`/structure/tree/${documentId}`),
    getUnit: (unitId: string) => 
      client.get<StructuralUnit>(`/structure/${unitId}`),
  },
  search: {
    provisions: (q: string, documentId?: string) => 
      client.get<StructuralUnit[]>('/search/provisions', { params: { q, document_id: documentId } }),
    documents: (q: string) => 
      client.get<Document[]>('/search/documents', { params: { q } }),
  },
  metadata: {
    getDefinitions: (documentId: string) => 
      client.get(`/metadata/definitions/document/${documentId}`),
    getReferences: (unitId: string) => 
      client.get(`/metadata/references/unit/${unitId}`),
  }
};

export default api;
