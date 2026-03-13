"use client";

import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { AppShell } from "@/components/layout/AppShell";
import { MappingView } from "@/components/views/MappingView";

const DashboardView = dynamic(() => import("@/components/views/DashboardView").then(m => m.DashboardView), { ssr: false });
const StateTrackerView = dynamic(() => import("@/components/views/StateTrackerView").then(m => m.StateTrackerView), { ssr: false });
const TimelineView = dynamic(() => import("@/components/views/TimelineView").then(m => m.TimelineView), { ssr: false });
const PenaltiesView = dynamic(() => import("@/components/views/PenaltiesView").then(m => m.PenaltiesView), { ssr: false });
const CompareView = dynamic(() => import("@/components/views/CompareView").then(m => m.CompareView), { ssr: false });
const EditorModal = dynamic(() => import("@/components/provisions/EditorModal").then(m => m.EditorModal), { ssr: false });

function ViewRouter() {
  const { activeView, editingProvision } = useUI();

  return (
    <>
      {editingProvision && <EditorModal />}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15, position: "absolute", width: "100%" }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative h-full"
        >
          {activeView === "mapping" && <MappingView />}
          {activeView === "dashboard" && <DashboardView />}
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
    <AppShell>
      <ViewRouter />
    </AppShell>
  );
}
