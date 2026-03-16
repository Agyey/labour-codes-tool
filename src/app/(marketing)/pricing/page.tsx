import Link from "next/link";
import { Check } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">Simple, transparent pricing.</h1>
        <p className="text-lg text-slate-600 dark:text-zinc-400">Start for free. Upgrade when your firm scales.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* BOUTIQUE FIRM */}
        <div className="bg-white dark:bg-zinc-900/50 p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 relative">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Boutique Firm</h3>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 border-b border-slate-100 dark:border-zinc-800 pb-6">For solo practitioners and small teams.</p>
          <div className="mb-8">
            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">$49</span>
            <span className="text-slate-500 dark:text-zinc-400">/mo per user</span>
          </div>
          <ul className="space-y-4 mb-8">
            {["Full Knowledge Graph Access", "Scenario Engine (Up to 5 Templates)", "5 Active Matters", "Standard Client Portal"].map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-slate-700 dark:text-zinc-300">
                <Check className="w-5 h-5 text-indigo-500" /> {feature}
              </li>
            ))}
          </ul>
          <Link href="/login" className="block text-center w-full py-3 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 font-bold text-slate-900 dark:text-white transition-colors">
            Start Free 14-Day Trial
          </Link>
        </div>

        {/* ENTERPRISE (MOST POPULAR) */}
        <div className="bg-slate-900 dark:bg-zinc-900 p-8 rounded-3xl border-[2px] border-indigo-500 relative shadow-2xl shadow-indigo-500/20 transform md:-translate-y-4">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Most Popular</div>
          <h3 className="text-xl font-bold text-white mb-2">Growth Partner</h3>
          <p className="text-sm text-slate-400 mb-6 border-b border-slate-800 pb-6">For scaling teams and mid-size firms.</p>
          <div className="mb-8">
            <span className="text-4xl font-black text-white tracking-tighter">$149</span>
            <span className="text-slate-400">/mo per user</span>
          </div>
          <ul className="space-y-4 mb-8">
            {["Everything in Boutique", "Unlimited Scenario Templates", "Unlimited Active Matters", "Custom Branding Client Portal", "AI PDF Parsing Engine"].map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-slate-200">
                <Check className="w-5 h-5 text-indigo-400" /> {feature}
              </li>
            ))}
          </ul>
          <Link href="/login" className="block text-center w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 font-bold text-white transition-colors">
            Start Free 14-Day Trial
          </Link>
        </div>

        {/* CUSTOM */}
        <div className="bg-white dark:bg-zinc-900/50 p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 relative">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Enterprise GC</h3>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 border-b border-slate-100 dark:border-zinc-800 pb-6">For global corporate legal teams.</p>
          <div className="mb-8">
            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Custom</span>
          </div>
          <ul className="space-y-4 mb-8">
            {["Everything in Growth", "Dedicated Success Manager", "SSO & Advanced Security", "On-Premise Deployment Options", "Custom Internal APIs"].map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-slate-700 dark:text-zinc-300">
                <Check className="w-5 h-5 text-indigo-500" /> {feature}
              </li>
            ))}
          </ul>
          <Link href="/contact" className="block text-center w-full py-3 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 font-bold text-slate-900 dark:text-white transition-colors">
            Contact Sales
          </Link>
        </div>
      </div>
    </div>
  );
}
