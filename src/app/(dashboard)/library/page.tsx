"use client";

import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
import { useLegalOS } from "@/context/LegalOSContext";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { AppShell } from "@/components/layout/AppShell";
import { ComplianceProductView } from "@/components/views/ComplianceProductView";
import { AgreementsProductView } from "@/components/views/AgreementsProductView";
import { DiligenceProductView } from "@/components/views/DiligenceProductView";
import { WorkflowDashboardView } from "@/components/views/WorkflowDashboardView";
import { WorkspaceView } from "@/components/views/WorkspaceView";

const DashboardView = dynamic(() => import("@/components/dashboard/FrameworkDashboard").then(m => m.FrameworkDashboard), { ssr: false });
const BucketExplorer = dynamic(() => import("@/components/dashboard/BucketExplorer").then(m => m.BucketExplorer), { ssr: false });
const MappingView = dynamic(() => import("@/components/views/MappingView").then(m => m.MappingView), { ssr: false });
const StateTrackerView = dynamic(() => import("@/components/views/StateTrackerView").then(m => m.StateTrackerView), { ssr: false });
const TimelineView = dynamic(() => import("@/components/views/TimelineView").then(m => m.TimelineView), { ssr: false });
const PenaltiesView = dynamic(() => import("@/components/views/PenaltiesView").then(m => m.PenaltiesView), { ssr: false });
const CompareView = dynamic(() => import("@/components/views/CompareView").then(m => m.CompareView), { ssr: false });
const EditorModal = dynamic(() => import("@/components/provisions/EditorModal").then(m => m.EditorModal), { ssr: false });
const PDFPreviewModal = dynamic(() => import("@/components/shared/PDFPreviewModal").then(m => m.PDFPreviewModal), { ssr: false });

function ViewRouter() {
  const { activeView, editingProvision } = useUI();

  return (
    <>
      {editingProvision && <EditorModal />}
      <PDFPreviewModal />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02, position: "absolute", width: "100%" }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="relative h-full"
        >
          {activeView === "dashboard" && <DashboardView />}
          {activeView === "bucket" && <BucketExplorer />}
          {activeView === "mapping" && <MappingView />}
          {activeView === "stateTracker" && <StateTrackerView />}
          {activeView === "timeline" && <TimelineView />}
          {activeView === "penalties" && <PenaltiesView />}
          {activeView === "compare" && <CompareView />}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default function Home() {
  const { loading } = useData();
  const { activeProduct, setActiveProduct } = useLegalOS();
  const { setActiveView } = useUI();

  useEffect(() => {
    setActiveProduct("MAPPING");
    setActiveView("dashboard");
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Loading platform...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {activeProduct === "MAPPING" && <ViewRouter />}
      {activeProduct === "COMPLIANCE" && <ComplianceProductView />}
      {activeProduct === "AGREEMENTS" && <AgreementsProductView />}
      {activeProduct === "DILIGENCE" && <DiligenceProductView />}
      {activeProduct === "WORKFLOW_DASH" && <WorkflowDashboardView />}
      {activeProduct === "WORKSPACE" && <WorkspaceView />}
    </>
  );
}
