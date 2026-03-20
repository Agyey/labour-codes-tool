"use client";

import { useState } from "react";
import { Building2, Briefcase, MapPin, SearchCheck, CheckCircle2 } from "lucide-react";

export default function ApplicabilityChecker() {
  const [profile, setProfile] = useState({
    entity_type: "",
    industry: "",
    state: "",
    employee_count: "",
  });

  const [hasChecked, setHasChecked] = useState(false);

  const mockApplicableProvisions = [
    { document: "Companies Act, 2013", title: "Section 135 — Corporate Social Responsibility", matchReason: "Due to entity type (Company) and implicit financial thresholds" },
    { document: "Maharashtra Shops & Establishment Act", title: "Registration of Establishment", matchReason: "State: Maharashtra, Entity Type: Commercial" },
  ];

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setHasChecked(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Profile Form (Left Column) */}
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm h-fit">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-500" />
          Entity Profile
        </h2>

        <form onSubmit={handleCheck} className="space-y-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Entity Type</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                value={profile.entity_type}
                onChange={(e) => setProfile({...profile, entity_type: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Select entity type...</option>
                <option value="Private Limited">Private Limited Company</option>
                <option value="LLP">Limited Liability Partnership</option>
                <option value="Proprietorship">Sole Proprietorship</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Industry Sector</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={profile.industry}
                onChange={(e) => setProfile({...profile, industry: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Select industry...</option>
                <option value="IT">Information Technology</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail Trade</option>
                <option value="NBFC">Financial Services</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">State / Jurisdiction</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={profile.state}
                onChange={(e) => setProfile({...profile, state: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">Select state...</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Delhi">Delhi</option>
                <option value="Karnataka">Karnataka</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!profile.entity_type || !profile.state}
            className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <SearchCheck className="w-4 h-4" /> Analyse Applicability
          </button>
        </form>
      </div>

      {/* Results (Right Column) */}
      <div className="lg:col-span-7">
        {!hasChecked ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-3xl">
            <SearchCheck className="w-16 h-16 text-indigo-300 dark:text-indigo-800 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Applicability Engine</h3>
            <p className="text-slate-500 mt-2 max-w-sm">
              Fill out your entity profile to determine exactly which statutes, rules, and compliance obligations apply to your business.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between">
              <div>
                <h3 className="text-emerald-800 dark:text-emerald-400 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Applicability Analysis Complete
                </h3>
                <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">Found 14 applicable acts and 102 provisions.</p>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Key Applicable Provisions</h4>
              
              {mockApplicableProvisions.map((prov, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded mb-2 inline-block">
                    {prov.document}
                  </span>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{prov.title}</h4>
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700/50">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 mr-1">Match Reason:</span>
                    {prov.matchReason}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
