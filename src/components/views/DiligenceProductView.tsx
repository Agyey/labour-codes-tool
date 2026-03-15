"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { 
  getDiligenceProjects, 
  getDiligenceProjectDetails 
} from "@/app/actions/diligence";
import { DiligenceHeader } from "@/components/diligence/DiligenceHeader";
import { ProjectGrid } from "@/components/diligence/ProjectGrid";
import { ProjectDetail } from "@/components/diligence/ProjectDetail";
import { RequisitionTable } from "@/components/diligence/RequisitionTable";
import { MatrixView } from "@/components/diligence/MatrixView";
import { AddRequisitionModal } from "@/components/diligence/AddRequisitionModal";
import { SeedScenarioModal } from "@/components/diligence/SeedScenarioModal";
import { DocumentView, RiskLog, ReportPreview } from "@/components/diligence/TabViews";
import { CreateProjectModal } from "@/components/diligence/CreateProjectModal";
import { Skeleton, CardSkeleton } from "@/components/shared/SkeletonLoader";

export function DiligenceProductView() {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projectDetail, setProjectDetail] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (activeProjectId) {
      fetchDetail(activeProjectId);
    } else {
      setProjectDetail(null);
    }
  }, [activeProjectId]);

  async function fetchProjects() {
    setLoading(true);
    const data = await getDiligenceProjects();
    setProjects(data as any);
    setLoading(false);
  }

  async function fetchDetail(id: string) {
    setDetailLoading(true);
    const data = await getDiligenceProjectDetails(id);
    setProjectDetail(data);
    setDetailLoading(false);
  }

  if (activeProjectId && projectDetail) {
    return (
      <ProjectDetail 
        project={projectDetail}
        onBack={() => setActiveProjectId(null)}
        requisitionTable={
          <RequisitionTable 
            project={projectDetail}
            items={projectDetail.requisitions}
            onUpdate={() => fetchDetail(activeProjectId)}
            setSelectedRequisitionId={() => {}} // Handled inside ProjectDetail
            addRequisitionModal={
              <AddRequisitionModal 
                isOpen={false} 
                onClose={() => {}} 
                projectId={activeProjectId} 
                onSuccess={() => {}} 
                buckets={projectDetail.buckets} 
              />
            }
            seedScenarioModal={(onSeed) => (
              <SeedScenarioModal onSeed={onSeed} onClose={() => {}} />
            )}
          />
        }
        matrixView={(req) => (
          <MatrixView 
            requisition={req} 
            project={projectDetail} 
            onBack={() => {}} // Handled by ProjectDetail
            onUpdate={() => fetchDetail(activeProjectId)} 
          />
        )}
        documentView={<DocumentView project={projectDetail} />}
        riskLog={<RiskLog project={projectDetail} />}
        reportPreview={<ReportPreview project={projectDetail} />}
      />
    );
  }

  if (activeProjectId && detailLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <Skeleton className="h-12 w-1/3" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <DiligenceHeader onCreateNew={() => setShowCreateModal(true)} />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No diligence projects yet</h3>
          <p className="text-slate-500 dark:text-zinc-500 mb-6">Create your first project to start tracking requisitions.</p>
          <button onClick={() => setShowCreateModal(true)} className="text-indigo-600 font-bold hover:underline">Launch New Project</button>
        </div>
      ) : (
        <ProjectGrid projects={projects} onProjectClick={setActiveProjectId} />
      )}

      <AnimatePresence>
        {showCreateModal && (
          <CreateProjectModal 
            onClose={() => setShowCreateModal(false)} 
            onCreated={() => { fetchProjects(); setShowCreateModal(false); }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
