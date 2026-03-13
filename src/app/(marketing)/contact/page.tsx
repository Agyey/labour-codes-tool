"use client";

import { Mail, MessageSquare, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">Talk to Legal OS.</h1>
        <p className="text-lg text-slate-600 dark:text-zinc-400">Our Enterprise team is ready to assist your firm's digital transformation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        <div className="space-y-8">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Inquiry Form</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="First Name" className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border-transparent focus:ring-2 focus:ring-indigo-500 font-medium text-sm outline-none w-full" />
                <input type="text" placeholder="Last Name" className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border-transparent focus:ring-2 focus:ring-indigo-500 font-medium text-sm outline-none w-full" />
              </div>
              <input type="email" placeholder="Work Email" className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border-transparent focus:ring-2 focus:ring-indigo-500 font-medium text-sm outline-none w-full" />
              <select className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border-transparent focus:ring-2 focus:ring-indigo-500 font-medium text-sm outline-none w-full">
                <option>Select Firm Size</option>
                <option>Boutique (1-10 attorneys)</option>
                <option>Mid-Market (10-100 attorneys)</option>
                <option>Tier-1 (100+ attorneys)</option>
              </select>
              <textarea placeholder="Tell us about your firm's needs..." rows={4} className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border-transparent focus:ring-2 focus:ring-indigo-500 font-medium text-sm outline-none w-full resize-none"></textarea>
              <button className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">
                Send Request
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {[
              { label: "Sales Inquiry", val: "sales@legalos.ai", icon: Mail },
              { label: "Phone Support", val: "+1 (888) LEGAL-OS", icon: Phone },
              { label: "Live Chat", val: "Available 24/7", icon: MessageSquare },
              { label: "HQ", val: "Palo Alto, California", icon: MapPin },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-slate-100/50 dark:bg-zinc-900/30 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-indigo-600 shadow-sm">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-zinc-200">{item.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
