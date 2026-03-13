"use client";

import { 
  Building2, 
  Users, 
  CreditCard, 
  Settings,
  Mail,
  Shield,
  Trash2,
  ExternalLink
} from "lucide-react";
import { useState } from "react";

export default function OrganizationSettings() {
  const [activeTab, setActiveTab] = useState<"users" | "billing" | "security">("users");

  const team = [
    { id: 1, name: "Shivani Kappal", email: "shivani@alpha.law", role: "Firm Admin", lastActive: "2 mins ago" },
    { id: 2, name: "Aarav Mehta", email: "aarav@alpha.law", role: "Partner", lastActive: "1 hr ago" },
    { id: 3, name: "Jia Sharma", email: "jia@alpha.law", role: "Associate", lastActive: "Today" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-indigo-500" />
            Organization Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Manage users, billing, and firm-wide security configurations for Alpha & Partners.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <nav className="flex flex-col space-y-1">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                activeTab === "users" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400" : "text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              <Users className="w-4 h-4" /> Team Members
            </button>
            <button
              onClick={() => setActiveTab("billing")}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                activeTab === "billing" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400" : "text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              <CreditCard className="w-4 h-4" /> Subscription & Billing
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                activeTab === "security" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400" : "text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              <Shield className="w-4 h-4" /> Security & Access Control
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          
          {activeTab === "users" && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Active Users (3/10)</h2>
                  <p className="text-sm text-slate-500">Invite colleagues to collaborate in your dedicated workspace.</p>
                </div>
                <button className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2.5 rounded-xl font-bold hover:scale-105 transition-transform shadow-md whitespace-nowrap">
                  <Mail className="w-4 h-4" /> Invite Member
                </button>
              </div>

              <div className="space-y-4">
                {team.map((user) => (
                  <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-slate-100 dark:border-zinc-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold uppercase tracking-wider">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                        <div className="text-xs font-semibold text-slate-500">{user.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t border-slate-100 dark:border-zinc-800 sm:border-0 justify-between sm:justify-start">
                      <select className="bg-transparent text-sm font-semibold text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="admin" selected={user.role === 'Firm Admin'}>Firm Admin</option>
                        <option value="partner" selected={user.role === 'Partner'}>Partner</option>
                        <option value="associate" selected={user.role === 'Associate'}>Associate</option>
                      </select>
                      <button className="text-rose-400 hover:text-rose-600 p-2 transition-colors" title="Revoke Access">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-6">
              <div className="bg-indigo-600 dark:bg-indigo-900 rounded-3xl p-8 relative overflow-hidden shadow-xl text-white">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Building2 className="w-48 h-48" />
                </div>
                <div className="relative z-10 max-w-lg">
                  <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-white/20 border border-white/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                   Enterprise Tier
                  </div>
                  <h2 className="text-3xl font-black mb-2">Alpha & Partners Workspace</h2>
                  <p className="text-indigo-100 mb-8 max-w-sm">You are currently on the Enterprise plan billed at $4,500/month. Your next invoice is scheduled for April 1st.</p>
                  
                  <button className="bg-white text-indigo-900 hover:bg-slate-10 px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
                    Open Stripe Customer Portal <ExternalLink className="w-4 h-4 mt-0.5" />
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Plan Limits & Usage</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">
                      <span>Internal Users (3 / 10 included)</span>
                      <span>30%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[30%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">
                      <span>Active Client Entities (18 / Unlimited)</span>
                      <span>Unlimited</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full w-full opacity-30" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
