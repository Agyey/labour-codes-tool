"use client";

import { useState } from "react";
import ProvisionTree from "@/components/reading-view/ProvisionTree";
import ProvisionContent from "@/components/reading-view/ProvisionContent";
import PointInTimeSlider from "@/components/reading-view/PointInTimeSlider";
import { JurisdictionSelector } from "@/components/reading-view/JurisdictionSelector";
import { StateOverlayBanner } from "@/components/reading-view/StateOverlayBanner";
import { FileText, Loader2 } from "lucide-react";
import { getUnitDetails } from "@/app/actions/reading";

import { LegalDocument } from "@prisma/client";
import { TreeNode } from "@/components/reading-view/ProvisionTree";

type TabId = "index" | "rules" | "circulars" | "cases" | "analytics";

export default function ReadingViewClient({ document, initialTreeNodes }: { document: LegalDocument, initialTreeNodes: TreeNode[] }) {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedNodeData, setSelectedNodeData] = useState<Awaited<ReturnType<typeof getUnitDetails>> | null>(null);
  const [isLoadingNode, setIsLoadingNode] = useState(false);

  const [activeTab, setActiveTab] = useState<TabId>("index");

  const handleSelectNode = async (nodeId: string) => {
    try {
      setIsLoadingNode(true);
      const data = await getUnitDetails(nodeId);
      setSelectedNodeData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingNode(false);
    }
  };

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
            {document.jurisdiction || document.state || "Central"} • {document.doc_type || "Act"}
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
                 onClick={() => setActiveTab(tab.id as TabId)}
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
                nodes={initialTreeNodes}
                onSelect={handleSelectNode}
                selectedId={selectedNodeData?.id}
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
        <div className="flex-1 bg-white dark:bg-zinc-900 overflow-y-auto relative">
          {isLoadingNode ? (
            <div className="absolute inset-0 bg-white/50 dark:bg-zinc-900/50 flex flex-col items-center justify-center z-10">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm text-slate-500 mt-2 font-medium">Loading provision...</p>
            </div>
          ) : null}

          {selectedNodeData ? (
             <ProvisionContent
                unitType={selectedNodeData.unit_type}
                number={selectedNodeData.unit_number}
                title={selectedNodeData.title}
                fullText={selectedNodeData.full_text || selectedNodeData.summary}
                status="Active"
                complianceType="None"
                definitions={selectedNodeData.definitions || []}
                crossReferences={selectedNodeData.xrefs || []}
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
