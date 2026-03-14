"use client";

import { useState, useEffect } from "react";
import { 
  Briefcase, 
  BarChart3, 
  AlertCircle, 
  Plus, 
  Search, 
  ChevronRight, 
  Filter, 
  LayoutGrid, 
  ListChecks, 
  FileText, 
  AlertTriangle, 
  FileBarChart,
  Clock,
  ShieldCheck,
  Building2,
  Globe,
  MoreVertical,
  X,
  FileUp,
  ExternalLink,
  ChevronDown,
  BookOpen,
  Library
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  createDiligenceProject, 
  getDiligenceProjects, 
  getDiligenceProjectDetails,
  updateRequisitionStatus,
  addFinding,
  seedRequisitionsFromScenario,
  generateDiligenceReport,
  initializeMatrix,
  getMatrix,
  addMatrixRow,
  updateMatrixCell
} from "@/app/actions/diligence";
import { getMatters } from "@/app/actions/matters"; // Scenarios might be fetched differently, checking for getScenarioTemplates
import toast from "react-hot-toast";

// --- Types ---
interface Project {
  id: string;
  name: string;
  client_name: string;
  target_company: string;
  type: string;
  status: string;
  created_at: Date;
  _count: { requisitions: number };
}

export function DiligenceProductView() {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    const data = await getDiligenceProjects();
    setProjects(data as any);
    setLoading(false);
  }

  if (activeProjectId) {
    return <DiligenceProjectDetail id={activeProjectId} onBack={() => setActiveProjectId(null)} />;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Due Diligence</h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-1">Manage target company audits and requisition workflows.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Projects", value: projects.length, icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "High Risk Flags", value: 12, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20" },
          { label: "Documents Reviewed", value: "2.4k", icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Average Completion", value: "68%", icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
        ].map((stat, i) => (
          <div key={i} className="p-5 bg-white dark:bg-zinc-900/50 rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 shadow-sm transition-hover hover:border-slate-300 dark:hover:border-zinc-700">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</div>
            <div className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Project Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No diligence projects yet</h3>
          <p className="text-slate-500 dark:text-zinc-500 mb-6">Create your first project to start tracking requisitions.</p>
          <button onClick={() => setShowCreateModal(true)} className="text-indigo-600 font-bold hover:underline">Launch New Project</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <motion.div 
              layoutId={project.id}
              key={project.id}
              onClick={() => setActiveProjectId(project.id)}
              className="group relative p-6 bg-white dark:bg-zinc-900/50 rounded-3xl border border-slate-200/60 dark:border-zinc-800/60 hover:border-indigo-500/50 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-indigo-500/5"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                  <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                  project.status === "Closed" ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {project.status}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{project.name}</h3>
              <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-1">{project.client_name}</p>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-zinc-400">
                  <Globe className="w-4 h-4 opacity-50" />
                  <span>Target: {project.target_company}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-zinc-400">
                  <ListChecks className="w-4 h-4 opacity-50" />
                  <span>{project._count.requisitions} Requisitions</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-7 h-7 rounded-full bg-slate-200 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] font-bold">U{i}</div>
                  ))}
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-all group-hover:translate-x-1" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
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

function CreateProjectModal({ onClose, onCreated }: { onClose: () => void, onCreated: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    clientName: "",
    targetCompany: "",
    type: "M&A",
    jurisdiction: "India"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await createDiligenceProject(formData);
    if (res.success) {
      toast.success("Diligence project initialized");
      onCreated();
    } else {
      toast.error(res.error || "Failed to create project");
    }
    setIsSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-200/50 dark:border-zinc-800/50"
      >
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">New Project</h2>
              <p className="text-slate-500 text-sm mt-1">Configure your diligence scope.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Project Name</label>
              <input 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="e.g. Project Phoenix"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Client</label>
                <input 
                  required
                  value={formData.clientName}
                  onChange={e => setFormData({...formData, clientName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Sequoia"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target</label>
                <input 
                  required
                  value={formData.targetCompany}
                  onChange={e => setFormData({...formData, targetCompany: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Swiggy"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deal Type</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                <option value="VC">Venture Capital</option>
                <option value="PE">Private Equity</option>
                <option value="M&A">Mergers & Acquisitions</option>
                <option value="IPO">Initial Public Offering</option>
              </select>
            </div>

            <button 
              disabled={isSubmitting}
              className="w-full py-4 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50"
            >
              {isSubmitting ? "Initializing..." : "Create Project"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

function DiligenceProjectDetail({ id, onBack }: { id: string, onBack: () => void }) {
  const [project, setProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("requisitions");
  const [selectedRequisitionId, setSelectedRequisitionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  async function fetchDetail() {
    setLoading(true);
    const data = await getDiligenceProjectDetails(id);
    setProject(data);
    setLoading(false);
  }

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (selectedRequisitionId) {
    const req = project.requisitions.find((r: any) => r.id === selectedRequisitionId);
    return <DiligenceMatrixView requisition={req} project={project} onBack={() => setSelectedRequisitionId(null)} onUpdate={fetchDetail} />;
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Top Navigation */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{project.name}</h2>
          <div className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-lg border border-indigo-100 dark:border-indigo-800/50 uppercase">
            {project.type}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 mb-8 overflow-x-auto no-scrollbar">
        {[
          { id: "overview", label: "Overview", icon: LayoutGrid },
          { id: "requisitions", label: "Requisitions", icon: ListChecks },
          { id: "documents", label: "Documents", icon: FileText },
          { id: "risks", label: "Risk Log", icon: AlertTriangle },
          { id: "report", label: "Report Builder", icon: FileBarChart },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all relative whitespace-nowrap ${
              activeTab === tab.id 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'opacity-100' : 'opacity-40'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-8">
        {activeTab === "overview" && <DiligenceOverview project={project} />}
        {activeTab === "requisitions" && (
          <RequisitionTable 
            project={project}
            items={project.requisitions} 
            onUpdate={fetchDetail} 
            setSelectedRequisitionId={setSelectedRequisitionId}
          />
        )}
        {activeTab === "documents" && <DocumentView project={project} />}
        {activeTab === "risks" && <RiskLog project={project} />}
        {activeTab === "report" && <ReportPreview project={project} />}
      </div>
    </div>
  );
}

// --- Sub-components for Project Detail ---

function DiligenceOverview({ project }: { project: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="p-8 bg-white dark:bg-zinc-900/50 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Discovery Pulse</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-100 dark:border-zinc-800">
               <div className="text-3xl font-black text-indigo-600 mb-1">24%</div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Project<br/>Completion</div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-100 dark:border-zinc-800">
               <div className="text-3xl font-black text-emerald-600 mb-1">12</div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Documents<br/>Approved</div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-100 dark:border-zinc-800">
               <div className="text-3xl font-black text-rose-600 mb-1">3</div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Critical<br/>Findings</div>
            </div>
          </div>
        </div>
        
        <div className="p-8 bg-white dark:bg-zinc-900/50 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Project Team</h3>
            <button className="text-indigo-600 text-xs font-bold hover:underline">+ Invite Member</button>
          </div>
          <div className="space-y-4">
            {project.matter.members.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold font-mono">
                    {m.user.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <div className="text-sm font-bold">{m.user.name}</div>
                    <div className="text-[10px] text-slate-400">{m.user.email}</div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 rounded-lg text-[10px] font-bold uppercase">{m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="p-8 bg-white dark:bg-zinc-900/50 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Metadata</h3>
          <div className="space-y-4">
            <MetaItem label="Client" value={project.client_name} icon={ShieldCheck} />
            <MetaItem label="Target" value={project.target_company} icon={Building2} />
            <MetaItem label="Type" value={project.type} icon={Briefcase} />
            <MetaItem label="Jurisdiction" value={project.jurisdiction || "N/A"} icon={Globe} />
            <MetaItem label="Created" value={new Date(project.created_at).toLocaleDateString()} icon={Clock} />
          </div>
        </div>
        
        <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-sm mb-2">
            <AlertTriangle className="w-4 h-4" />
            Quick Suggestion
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-400/80 leading-relaxed">
            The target company has multiple subsidiaries in Gujarat. Consider adding "Inter-state Transfer" requisitions.
          </p>
        </div>
      </div>
    </div>
  );
}

function MetaItem({ label, value, icon: Icon }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-slate-50 dark:bg-zinc-800 rounded-lg text-slate-400">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
        <div className="text-sm font-bold text-slate-900 dark:text-white">{value}</div>
      </div>
    </div>
  );
}

interface RequisitionTableProps {
  project: any; // Keep project for seeding
  items: any[];
  onUpdate: () => void;
  setSelectedRequisitionId: (id: string) => void;
}

function RequisitionTable({ project, items, onUpdate, setSelectedRequisitionId }: RequisitionTableProps) {
  const [filter, setFilter] = useState("");
  const [isSeeding, setIsSeeding] = useState(false);

  async function handleSeedStatus() {
     if (items.length > 0) return;
     setIsSeeding(true);
     // Try to seed from a default M&A scenario if possible, or direct seed
     const res = await seedRequisitionsFromScenario(project.id, "M&A_DEFAULT"); // Placeholder ID
     if (res.success) {
       toast.success(`Seeded ${res.count} items`);
       onUpdate();
     } else {
       toast.error("Manual seeding failed. Please add items manually.");
     }
     setIsSeeding(false);
  }

  const filteredItems = project.requisitions.filter((r: any) => 
    r.title.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-zinc-900/50 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search requisitions..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSeedStatus}
            disabled={isSeeding || project.requisitions.length > 0}
            className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
          >
            {isSeeding ? "Seeding..." : "Auto-Seed"}
          </button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/10">
            <Plus className="w-4 h-4" />
            Add Custom
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-zinc-800/20">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Requisition Item</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Risk</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Docs</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
            {filteredItems.map((item: any) => (
              <tr 
                key={item.id} 
                onClick={() => setSelectedRequisitionId(item.id)}
                className="group hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <StatusBadge status={item.status} id={item.id} onUpdate={onUpdate} />
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{item.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {item.risk_flag ? (
                    <div className="flex items-center gap-1.5 text-rose-600 font-bold text-[10px] px-2 py-0.5 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-100 dark:border-rose-900/40 w-fit">
                      <AlertTriangle className="w-3 h-3" />
                      RISK
                    </div>
                  ) : (
                    <div className="text-[10px] font-bold text-slate-300">NONE</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                      <FileUp className="w-3 h-3" />
                      {item.documents.length}
                    </div>
                    {item.provision_id && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); toast.success("Opening Library Reference..."); }}
                        className="p-1.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-100 dark:border-indigo-800/50 hover:bg-indigo-100 transition-all"
                        title="View Library Reference"
                      >
                        <Library className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredItems.length === 0 && (
          <div className="py-20 text-center text-slate-400 text-sm">No items found matching your filters.</div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status, id, onUpdate }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const statuses = ["Requested", "Received", "Under Review", "Complete"];
  const colors: any = {
    "Requested": "bg-slate-100 text-slate-600",
    "Received": "bg-blue-100 text-blue-700",
    "Under Review": "bg-amber-100 text-amber-700",
    "Complete": "bg-emerald-100 text-emerald-700"
  };

  async function handleStatusChange(s: string) {
    const res = await updateRequisitionStatus(id, s);
    if (res.success) {
      onUpdate();
      setIsOpen(false);
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight flex items-center gap-1.5 transition-all ${colors[status] || 'bg-slate-100'}`}
      >
        <div className={`w-1.5 h-1.5 rounded-full ${status === 'Complete' ? 'bg-emerald-500' : 'bg-current opacity-60'}`} />
        {status}
        <ChevronDown className="w-2.5 h-2.5 opacity-50" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
              className="absolute left-0 top-full mt-2 w-40 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden"
            >
              {statuses.map(s => (
                <button 
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`w-full px-4 py-2 text-left text-[10px] font-bold hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors ${s === status ? 'text-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'text-slate-500'}`}
                >
                  {s}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function DiligenceMatrixView({ requisition, project, onBack, onUpdate }: { requisition: any, project: any, onBack: () => void, onUpdate: () => void }) {
  const [matrix, setMatrix] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddRow, setShowAddRow] = useState(false);
  const [newRowData, setNewRowData] = useState<any>({});

  useEffect(() => {
    fetchMatrix();
  }, [requisition.id]);

  async function fetchMatrix() {
    setLoading(true);
    const data = await getMatrix(requisition.id);
    setMatrix(data);
    setLoading(false);
  }

  async function handleInitialize() {
    const defaultCols = [
      { key: "item", label: "Compliance Step", type: "text" },
      { key: "status", label: "Status", type: "text" },
      { key: "comment", label: "Verification Notes", type: "text" },
    ];
    const res = await initializeMatrix(requisition.id, defaultCols);
    if (res.success) {
      toast.success("Verification matrix initialized");
      fetchMatrix();
    }
  }

  async function handleAddRow(e: React.FormEvent) {
    e.preventDefault();
    if (!matrix) return;
    const res = await addMatrixRow(matrix.id, newRowData);
    if (res.success) {
      toast.success("Row added");
      setNewRowData({});
      setShowAddRow(false);
      fetchMatrix();
    }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!matrix) {
    return (
      <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-[32px] border border-dashed border-slate-200 dark:border-zinc-800 max-w-2xl mx-auto mt-20">
        <div className="flex items-center justify-center gap-4 mb-4">
           <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight className="rotate-180 w-4 h-4" /></button>
           <h3 className="text-xl font-bold">Initialize Verification Matrix</h3>
        </div>
        <p className="text-slate-500 mb-8">This requisition requires a granular verification matrix to track multiple entities or complex compliance steps.</p>
        <button 
          onClick={handleInitialize}
          className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20"
        >
          Initialize Matrix
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-slate-900 dark:text-white">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl">
             <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div className="min-w-0">
            <h2 className="text-xl font-black truncate">{requisition.title}</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{requisition.bucket?.name || "Checklist"} • Verification Matrix</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAddRow(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Row
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900/50 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-zinc-800/20">
                {matrix.columns.map((col: any) => (
                  <th key={col.key} className="px-6 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
              {matrix.rows.map((row: any) => (
                <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  {matrix.columns.map((col: any) => (
                    <td key={col.key} className="px-6 py-4">
                      <MatrixCell 
                        rowId={row.id} 
                        columnKey={col.key} 
                        initialValue={row.data[col.key]} 
                        cell={row.cells.find((c: any) => c.column_key === col.key)}
                        projectDocuments={project.requisitions.flatMap((r: any) => r.documents)}
                        onUpdate={fetchMatrix}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {matrix.rows.length === 0 && (
            <div className="py-20 text-center text-slate-400 text-sm">No verification steps added yet.</div>
          )}
        </div>
      </div>

      {/* Add Row Modal */}
      <AnimatePresence>
        {showAddRow && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddRow(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[32px] p-8 shadow-2xl">
              <h3 className="text-xl font-bold mb-6">Add Verification Step</h3>
              <form onSubmit={handleAddRow} className="space-y-4">
                {matrix.columns.map((col: any) => (
                  <div key={col.key} className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{col.label}</label>
                    <input 
                      value={newRowData[col.key] || ""}
                      onChange={e => setNewRowData({...newRowData, [col.key]: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-800"
                      placeholder={`Enter ${col.label.toLowerCase()}...`}
                    />
                  </div>
                ))}
                <button className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 mt-4">Save Row</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MatrixCell({ rowId, columnKey, initialValue, cell, projectDocuments, onUpdate }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState(cell?.comment || "");
  const [docId, setDocId] = useState(cell?.document_id || "");

  async function handleSave() {
    const res = await updateMatrixCell(rowId, columnKey, comment, docId || undefined);
    if (res.success) {
      toast.success("Updated");
      setIsEditing(false);
      onUpdate();
    }
  }

  return (
    <div className="relative group min-w-[120px]">
      <div 
        onClick={() => setIsEditing(true)}
        className="min-h-[20px] text-sm font-medium cursor-pointer"
      >
        <div className="text-slate-900 dark:text-zinc-100">{initialValue || <span className="text-slate-300 italic text-xs">Empty</span>}</div>
        {(cell?.comment || cell?.document) && (
          <div className="mt-1 flex flex-wrap gap-1">
            {cell.comment && (
              <div className="px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-500 text-[8px] font-bold rounded flex items-center gap-1">
                <FileText className="w-2.5 h-2.5" />
                NOTE
              </div>
            )}
            {cell.document && (
              <div className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[8px] font-bold rounded flex items-center gap-1">
                <BookOpen className="w-2.5 h-2.5" />
                DOC
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isEditing && (
          <div className="absolute z-50 left-0 top-full mt-2 w-64 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800">
             <div className="space-y-3">
               <div>
                  <label className="text-[10px] uppercase font-black text-slate-400">Notes / Comments</label>
                  <textarea 
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-lg text-xs"
                    rows={2}
                  />
               </div>
               <div>
                  <label className="text-[10px] uppercase font-black text-slate-400">Link Document</label>
                  <select 
                    value={docId}
                    onChange={e => setDocId(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-lg text-xs"
                  >
                    <option value="">No Document</option>
                    {projectDocuments?.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
               </div>
               <div className="flex justify-end gap-2 pt-2">
                 <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs text-slate-500">Cancel</button>
                 <button onClick={handleSave} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-500/10">Save</button>
               </div>
             </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Placeholder views for other tabs
function DocumentView({ project }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {project.requisitions.flatMap((r: any) => r.documents).map((doc: any) => (
         <div key={doc.id} className="p-4 bg-white dark:bg-zinc-900/50 rounded-2xl border border-slate-200 dark:border-zinc-800 flex flex-col items-center text-center group cursor-pointer hover:border-indigo-500 transition-all">
            <div className="w-16 h-20 bg-slate-50 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-all">
               <FileText className="w-8 h-8 text-slate-300 group-hover:text-indigo-400 transition-all" />
               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <ExternalLink className="w-5 h-5 text-indigo-600" />
               </div>
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1 truncate w-full px-2">{doc.name}</div>
            <div className="text-[10px] text-slate-400 mt-1 uppercase">v{doc.version} • {new Date(doc.uploaded_at).toLocaleDateString()}</div>
         </div>
      ))}
      {project.requisitions.flatMap((r: any) => r.documents).length === 0 && (
        <div className="col-span-full py-20 text-center bg-slate-50/50 dark:bg-zinc-800/20 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800">
          <FileUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold">No documents uploaded</h3>
          <p className="text-sm text-slate-500">Wait for the target company to upload requested files.</p>
        </div>
      )}
    </div>
  );
}

function RiskLog({ project }: any) {
  const findings = project.requisitions.flatMap((r: any) => r.findings.map((f: any) => ({...f, reqTitle: r.title, bucket: r.bucket?.name})));
  
  return (
    <div className="space-y-6">
      {findings.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-zinc-900/50 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <ShieldCheck className="w-12 h-12 text-emerald-500/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold">Safe Horizon</h3>
          <p className="text-sm text-slate-500">No high-risk issues flagged in the review process yet.</p>
        </div>
      ) : (
        findings.map((finding: any) => (
          <div key={finding.id} className="p-6 bg-white dark:bg-zinc-900/50 rounded-2xl border border-slate-200 dark:border-zinc-800 flex gap-6 items-start">
            <div className={`p-3 rounded-xl ${
              finding.severity === 'Deal Breaker' ? 'bg-rose-100 text-rose-600' : 
              finding.severity === 'High' ? 'bg-orange-100 text-orange-600' : 'bg-amber-100 text-amber-600'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{finding.bucket || "General"} • {finding.reqTitle}</div>
                   <h4 className="text-lg font-bold text-slate-900 dark:text-white">{finding.description}</h4>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                  finding.severity === 'Deal Breaker' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {finding.severity}
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">{finding.analysis}</p>
              <div className="mt-4 p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800">
                 <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Recommendation</div>
                 <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">{finding.recommendation}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function ReportPreview({ project }: { project: any }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<any>(null);

  async function handleGenerate() {
    setIsGenerating(true);
    const res = await generateDiligenceReport(project.id);
    if (res.success) {
      setReport(res.report);
      toast.success("Draft report generated");
    }
    setIsGenerating(false);
  }

  return (
    <div className="p-12 bg-white dark:bg-zinc-900/50 rounded-[40px] border border-slate-200 dark:border-zinc-800 shadow-xl max-w-4xl mx-auto min-h-[600px] flex flex-col relative overflow-hidden">
      {!report && (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
           <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
              <FileBarChart className="w-10 h-10 text-indigo-600" />
           </div>
           <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Generate Final Report</h3>
           <p className="text-slate-500 mb-8 max-w-md">Our engine will aggregate all flagged findings, risk analysis, and supporting evidence into a structured draft.</p>
           <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50"
          >
            {isGenerating ? "Processing Finds..." : "Initialize Draft Generation"}
          </button>
        </div>
      )}

      {report && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
           <div className="border-b-4 border-indigo-600 pb-8 flex justify-between items-end">
             <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase leading-none mb-2">DD Report</h1>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-[4px]">{project.target_company}</div>
             </div>
             <div className="text-right text-[10px] font-bold text-slate-400">
               GEN-ID: {project.id.slice(-8)}<br/>
               DATE: {new Date().toLocaleDateString().toUpperCase()}
             </div>
           </div>

           <section className="space-y-4">
             <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">I. Executive Summary</h3>
             <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
               This report provides a comprehensive legal due diligence review of {project.target_company} ("Target") in connection with the proposed {project.type} transaction by {project.client_name} ("Client"). The review focused on corporate hygiene, material contracts, and regulatory compliance.
             </p>
           </section>

           <section className="space-y-6">
              <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">II. Critical Findings</h3>
              {report.findings.critical.length === 0 ? (
                <div className="text-xs text-slate-500 italic">No Deal-Breaker or High-Risk issues identified.</div>
              ) : (
                report.findings.critical.map((f: any, i: number) => (
                  <div key={i} className="p-6 bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl border-l-[6px] border-rose-600">
                     <div className="text-[10px] font-black text-rose-600 uppercase mb-1">{f.severity}</div>
                     <h4 className="text-base font-black text-slate-900 dark:text-white mb-2">{f.description}</h4>
                     <p className="text-sm text-slate-600 dark:text-zinc-400">{f.analysis}</p>
                  </div>
                ))
              )}
           </section>

           <div className="pt-10 flex justify-end gap-3 no-print">
              <button onClick={() => setReport(null)} className="px-5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800">Clear</button>
              <button className="px-6 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black rounded-xl text-xs flex items-center gap-2">
                <FileUp className="w-4 h-4" />
                Export to DOCX
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
