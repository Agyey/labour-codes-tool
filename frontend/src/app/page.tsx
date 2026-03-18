'use client';

import React, { useEffect, useState } from 'react';
import { 
  Scale, 
  BookOpen, 
  ShieldCheck, 
  FileText, 
  Activity, 
  GitBranch,
  Calendar,
  Search,
  ChevronRight,
  Gavel,
  Loader2
} from 'lucide-react';
import { api, Document } from '@/lib/api';

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.documents.list();
        setDocuments(response.data);
        setBackendStatus('online');
      } catch (error) {
        console.error('Failed to fetch documents:', error);
        setBackendStatus('offline');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1115] text-white font-sans selection:bg-blue-500/30">
      {/* Background Gradient Orbs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="flex min-h-screen">
        {/* Navigation Sidebar */}
        <aside className="w-64 border-r border-white/5 bg-black/20 backdrop-blur-xl flex flex-col p-6 sticky top-0 h-screen">
          <div className="flex items-center gap-3 mb-10 group cursor-pointer">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Scale size={24} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              LexNexus
            </span>
          </div>

          <nav className="flex-1 space-y-2">
            <NavItem icon={<BookOpen size={20} />} label="Knowledge Library" active />
            <NavItem icon={<ShieldCheck size={20} />} label="Compliance Tracker" />
            <NavItem icon={<GitBranch size={20} />} label="Repeal Explorer" />
            <NavItem icon={<Activity size={20} />} label="Transaction Flows" />
            <NavItem icon={<Calendar size={20} />} label="Regulatory Calendar" />
            <NavItem icon={<Gavel size={20} />} label="Judicial Portal" />
          </nav>

          <div className="mt-auto pt-6 border-t border-white/5">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-colors cursor-pointer">
              <p className="text-sm font-medium text-blue-400 mb-1">System Status</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  backendStatus === 'online' ? 'bg-green-500' : 
                  backendStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                <span className="text-xs text-gray-400 font-mono">
                  Backend: {backendStatus === 'online' ? 'Connected' : backendStatus === 'offline' ? 'Disconnected' : 'Checking...'}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8 lg:p-12 max-w-7xl">
          {/* Header section */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2 tracking-tight">
                Legal Knowledge <span className="text-blue-500">System</span>
              </h1>
              <p className="text-gray-400 max-w-xl">
                Browse, connect, and extract value from legislation at the granular clause level.
              </p>
            </div>
            
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search Acts, Sections, or Definitions..." 
                className="bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 w-full md:w-[350px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all backdrop-blur-md text-sm"
              />
            </div>
          </header>

          {/* Quick Stats / Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard label="Active Documents" value={documents.length.toString()} trend="+0" icon={<FileText className="text-blue-400" />} />
            <StatCard label="Structural Units" value="0" trend="+0" icon={<GitBranch className="text-indigo-400" />} />
            <StatCard label="Cross-References" value="0" trend="+0" icon={<ChevronRight className="text-purple-400" />} />
          </div>

          {/* Latest Activity / Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-white/5 rounded-3xl border border-white/10 p-8 backdrop-blur-md relative overflow-hidden group hover:border-white/20 transition-all min-h-[400px]">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <BookOpen size={120} />
              </div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
                Knowledge Library
              </h2>
              
              <div className="space-y-4 relative z-10">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                    <p className="text-sm font-medium">Fetching documents...</p>
                  </div>
                ) : documents.length > 0 ? (
                  documents.map(doc => (
                    <ActItem 
                      key={doc.id} 
                      title={doc.title} 
                      tag={doc.status} 
                      date={`Updated ${new Date(doc.created_at).toLocaleDateString()}`} 
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-500 border border-dashed border-white/10 rounded-2xl bg-black/20">
                    <BookOpen size={48} className="mb-4 opacity-20" />
                    <p className="text-sm font-medium">No documents found in the library</p>
                    <p className="text-xs text-gray-600 mt-1">Start by adding a new legal instrument via the API</p>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white/5 rounded-3xl border border-white/10 p-8 backdrop-blur-md hover:border-white/20 transition-all">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-green-500 rounded-full" />
                Compliance Highlights
              </h2>
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 border border-dashed border-white/10 rounded-2xl bg-black/20">
                  <ShieldCheck size={48} className="mb-4 opacity-20" />
                  <p className="text-sm font-medium">No active obligations</p>
                  <p className="text-xs text-gray-600 mt-1">Obligations will appear here as documents are processed</p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all ${
      active ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5' : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}>
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
}

function StatCard({ label, value, trend, icon }: { label: string, value: string, trend: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-all backdrop-blur-sm shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
          {icon}
        </div>
        <span className="text-sm font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">
          {trend}
        </span>
      </div>
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function ActItem({ title, tag, date }: { title: string, tag: string, date: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:bg-black/60 transition-colors cursor-pointer group">
      <div>
        <h4 className="font-bold text-gray-200 group-hover:text-white transition-colors">{title}</h4>
        <p className="text-xs text-gray-500 mt-1">{date}</p>
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${
        tag === 'Active' ? 'text-green-400 border-green-500/20 bg-green-500/5' : 
        tag === 'Draft' ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5' : 
        'text-blue-400 border-blue-500/20 bg-blue-500/5'
      }`}>
        {tag}
      </span>
    </div>
  );
}

function ComplianceItem({ title, deadline, act, severity }: { title: string, deadline: string, act: string, severity: 'urgent' | 'high' | 'medium' }) {
  const sevColor = 
    severity === 'urgent' ? 'bg-red-500 shadow-red-500/50' : 
    severity === 'high' ? 'bg-orange-500 shadow-orange-500/50' : 
    'bg-blue-500 shadow-blue-500/50';

  return (
    <div className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/5 hover:bg-black/60 transition-colors cursor-pointer group">
      <div className={`w-3 h-3 rounded-full ${sevColor} shadow-md`} />
      <div className="flex-1">
        <h4 className="font-bold text-gray-200 group-hover:text-white transition-colors">{title}</h4>
        <p className="text-xs text-gray-400 mt-0.5">{act} • <span className="text-gray-500">{deadline}</span></p>
      </div>
      <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
    </div>
  );
}
