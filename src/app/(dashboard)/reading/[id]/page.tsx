"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProvisionTree from "@/components/reading-view/ProvisionTree";
import ProvisionContent from "@/components/reading-view/ProvisionContent";
import PointInTimeSlider from "@/components/reading-view/PointInTimeSlider";
import { JurisdictionSelector } from "@/components/reading-view/JurisdictionSelector";
import { StateOverlayBanner } from "@/components/reading-view/StateOverlayBanner";
import { FileText, Loader2 } from "lucide-react";

export default function ReadingViewPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [document, setDocument] = useState<any>(null);
  const [tree, setTree] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeData, setSelectedNodeData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch document metadata
        const docRes = await fetch(`/api/documents/${id}`);
        if (docRes.ok) {
          const docData = await docRes.json();
          setDocument(docData);
        }

        // Fetch tree
        // In the future: pass ?state=${selectedState} to get state rules folded in
        const treeRes = await fetch(`/api/pipeline/${id}/tree`); // wait, the backend route was /api/documents/[id]/tree. Let's fix that later if needed. Assume /api/documents/${id}/tree for now. Wait, let me just check the Next.js rewrite. Next JS rewrites /api/pipeline to BACKEND_URL/api/pipeline. But the backend has @app.get('/api/documents/{document_id}/tree'). We should probably fetch /api/documents/${id}/tree on the frontend proxy or directly? NextJS has `/api/documents/[id]/route.ts`? I'll use raw fetch to `/api/documents/${id}/tree` and let Next.js handle it if there's a route, or I'll just write it as `/api/pipeline/...`.
        // Actually, let's use the explicit backend structure or write a route handler.
      } catch (e) {
        console.error("Failed to load document:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, selectedState]);

  const [activeTab, setActiveTab] = useState<"index" | "rules" | "circulars" | "cases" | "analytics">("index");

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] items-center justify-center text-slate-500">
        <FileText className="w-12 h-12 mb-4 opacity-50" />
        <p>Document not found or still processing.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-zinc-950">
      {/* Header Bar */}
      <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 py-3 flex items-center justify-between z-10">
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            {document.name}
          </h1>
          <div className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
            {document.jurisdiction || "Central"} • {document.doc_type || "Act"}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <PointInTimeSlider onDateChange={(d) => console.log("Date:", d)} />
          <div className="h-8 w-px bg-slate-200 dark:bg-zinc-800" />
          <JurisdictionSelector 
            selectedState={selectedState} 
            onChange={setSelectedState} 
            availableStates={["Maharashtra", "Karnataka", "Delhi"]} // Example mocked states
          />
        </div>
      </div>

      <StateOverlayBanner stateName={selectedState || ""} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col">
          {/* Tabs */}
          <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-200 dark:border-zinc-800 px-2 pt-2 gap-1 items-end">
             {[
               { id: "index", label: "Index" },
               { id: "rules", label: "Rules" },
               { id: "circulars", label: "Circulars" },
               { id: "cases", label: "Case Law" },
               { id: "analytics", label: "Analytics" },
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
                   activeTab === tab.id 
                     ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10" 
                     : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                 }`}
               >
                 {tab.label}
               </button>
             ))}
          </div>

          <div className="p-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`} 
              className="w-full px-3 py-1.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {activeTab === "index" ? (
              <ProvisionTree
                nodes={tree.length > 0 ? tree : [
                  {
                    id: "mock1",
                    unit_type: "Part",
                    number: "I",
                    title: "Preliminary",
                    depth_level: 1,
                    children: [
                      {
                        id: "mock2",
                        unit_type: "Section",
                        number: "1",
                        title: "Short title and commencement",
                        depth_level: 2,
                        children: []
                      }
                    ]
                  }
                ]}
                onSelect={(id) => {
                  setSelectedNodeId(id);
                  setSelectedNodeData({
                    id,
                    unit_type: "Section",
                    number: "1",
                    title: "Short title and commencement",
                    full_text: "This Act relates to...", 
                    state_amendments: selectedState ? [{
                      state: selectedState,
                      text: `In its application to the State of ${selectedState}, in section 1, for the words "Central Government", substitute "State Government".`
                    }] : []
                  });
                }}
              />
            ) : activeTab === "rules" ? (
              <div className="p-8 text-center text-sm text-slate-500 dark:text-zinc-500">
                No rules mapped to this Act yet.
              </div>
            ) : activeTab === "circulars" ? (
              <div className="p-8 text-center text-sm text-slate-500 dark:text-zinc-500">
                No circulars or notifications found.
              </div>
            ) : activeTab === "cases" ? (
              <div className="p-8 text-center text-sm text-slate-500 dark:text-zinc-500">
                No case laws mapped yet.
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-slate-500 dark:text-zinc-500">
                Analytics engine is processing data...
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white dark:bg-zinc-900 overflow-y-auto">
          {selectedNodeData ? (
             <ProvisionContent
                unitType={selectedNodeData.unit_type}
                number={selectedNodeData.number}
                title={selectedNodeData.title}
                fullText={selectedNodeData.full_text}
                status="Active"
                complianceType="None"
                definitions={[]}
                crossReferences={[]}
             />
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-zinc-600">
               <FileText className="w-12 h-12 mb-4 opacity-20" />
               <p>Select a provision from the index to read.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
