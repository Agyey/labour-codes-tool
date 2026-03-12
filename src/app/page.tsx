"use client";

import { useApp } from "@/context/AppContext";
import { AnimatePresence, motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { MappingView } from "@/components/views/MappingView";
import { DashboardView } from "@/components/views/DashboardView";
import { StateTrackerView } from "@/components/views/StateTrackerView";
import { TimelineView } from "@/components/views/TimelineView";
import { PenaltiesView } from "@/components/views/PenaltiesView";
import { CompareView } from "@/components/views/CompareView";
import { EditorModal } from "@/components/provisions/EditorModal";

function ViewRouter() {
  const { activeView, editingProvision } = useApp();

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
  const { loading } = useApp();

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
