"use client";
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */

import { 
  Building2, 
  Users, 
  CreditCard, 
  Shield,
  ExternalLink,
  Lock,
  Smartphone,
  Globe
} from "lucide-react";
import { useState } from "react";
import { TeamManager } from "@/components/shared/TeamManager";

interface OrgSettingsClientProps {
  initialMembers: any[];
  orgId: string;
  orgName: string;
  planTier: string;
}

export function OrgSettingsClient({ initialMembers, orgId, orgName, planTier }: OrgSettingsClientProps) {
  const [activeTab, setActiveTab] = useState<"users" | "billing" | "security">("users");

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Navigation Sidebar */}
      <div className="w-full lg:w-64 flex-shrink-0">
        <nav className="flex flex-col space-y-2">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-3 px-5 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all ${
              activeTab === "users" 
                ? "bg-slate-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl shadow-slate-900/10" 
                : "text-slate-500 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            <Users className="w-4 h-4" /> Team Members
          </button>
          <button
            onClick={() => setActiveTab("billing")}
            className={`flex items-center gap-3 px-5 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all ${
              activeTab === "billing" 
                ? "bg-slate-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl shadow-slate-900/10" 
                : "text-slate-500 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            <CreditCard className="w-4 h-4" /> Billing
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-3 px-5 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all ${
              activeTab === "security" 
                ? "bg-slate-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl shadow-slate-900/10" 
                : "text-slate-500 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            <Shield className="w-4 h-4" /> Security
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0">
        {activeTab === "users" && (
          <TeamManager members={initialMembers} orgId={orgId} maxUsers={10} />
        )}

        {activeTab === "billing" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-indigo-600 rounded-[40px] p-10 relative overflow-hidden shadow-2xl shadow-indigo-600/20 text-white">
              <div className="absolute -top-10 -right-10 p-8 opacity-10 pointer-events-none rotate-12">
                <CreditCard className="w-64 h-64" />
              </div>
              <div className="relative z-10 max-w-lg">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-white/20 border border-white/30 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                 {planTier} Tier
                </div>
                <h2 className="text-4xl font-black mb-4 tracking-tight">{orgName}</h2>
                <p className="text-indigo-100 font-medium mb-10 leading-relaxed">
                  Your organization is currently on the <span className="text-white font-black underline decoration-indigo-400 underline-offset-4">{planTier} Plan</span>. 
                  Manage subscriptions, invoices, and payment methods via our secure billing portal.
                </p>
                
                <button className="bg-white text-indigo-600 hover:bg-slate-50 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                  Open Customer Portal <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[32px] p-8">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" /> Usage Limits
                </h3>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
                      <span>Team Members</span>
                      <span className="text-slate-900 dark:text-white">{initialMembers.length} / 10</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${(initialMembers.length / 10) * 100}%` }} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
                      <span>Storage Usage</span>
                      <span className="text-slate-900 dark:text-white">1.2 GB / 50 GB</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-slate-300 dark:bg-zinc-600 rounded-full w-[2.4%]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[32px] p-8">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Recent Invoices</h3>
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center border border-slate-200 dark:border-zinc-700">
                          <CreditCard className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 dark:text-white">INV-2024-{100 - i}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">March {i}, 2024</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white">$450.00</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[40px] p-10">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tight flex items-center gap-3">
                <Shield className="w-7 h-7 text-indigo-500" /> Security Controls
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-6 bg-slate-50 dark:bg-zinc-800/50 rounded-3xl border border-slate-100 dark:border-zinc-800 hover:border-indigo-200 transition-all cursor-pointer group">
                    <div className="p-3 bg-white dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 shadow-sm group-hover:bg-indigo-50 transition-colors">
                      <Lock className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">SSO & SAML</h4>
                      <p className="text-[11px] font-medium text-slate-500 leading-relaxed">Configure single sign-on via Okta, Azure AD, or Google Workspace.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-6 bg-slate-50 dark:bg-zinc-800/50 rounded-3xl border border-slate-100 dark:border-zinc-800 hover:border-indigo-200 transition-all cursor-pointer group">
                    <div className="p-3 bg-white dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 shadow-sm group-hover:bg-indigo-50 transition-colors">
                      <Smartphone className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">2FA Enforcement</h4>
                      <p className="text-[11px] font-medium text-slate-500 leading-relaxed">Require all members to use two-factor authentication.</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-zinc-900 dark:bg-black rounded-[32px] text-white flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500 mb-6">IP Access Restriction</h4>
                    <p className="text-xs font-medium text-zinc-400 leading-relaxed mb-6">
                      Restrict workspace access to specific office IP ranges. Enterprise-only feature.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest">
                        <Globe className="w-3 h-3 text-indigo-400" /> 192.168.1.1 (HQ Office)
                      </div>
                    </div>
                  </div>
                  <button className="mt-8 w-full py-4 bg-white text-zinc-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
                    Upgrade to Enterprise
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
