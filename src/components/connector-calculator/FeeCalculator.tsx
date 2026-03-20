"use client";

import { useState } from "react";
import { Receipt, Search } from "lucide-react";

interface FeeResult {
  fee_type: string;
  description: string;
  amount: string;
  payable_to: string;
}

export default function FeeCalculator() {
  const [transactionType, setTransactionType] = useState("");
  const [results, setResults] = useState<FeeResult[]>([]);

  const transactionTypes = [
    "Company Incorporation", "Annual Return Filing", "Share Transfer",
    "Change of Directors", "Property Registration", "Mortgage Registration",
    "Trademark Filing", "Patent Application", "Merger/Amalgamation",
  ];

  const lookup = () => {
    // Simulated lookup (would call API /fee-schedules in production)
    setResults([
      {
        fee_type: "Registration Fee",
        description: "MCA filing fee for Form INC-7",
        amount: "₹2,000",
        payable_to: "Registrar of Companies",
      },
      {
        fee_type: "Court Fee",
        description: "NCLT application for approval",
        amount: "₹5,000",
        payable_to: "National Company Law Tribunal",
      },
    ]);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Receipt className="w-5 h-5 text-teal-600" />
          Fee Lookup
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Find registration, court, and filing fees for any transaction type
        </p>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase text-slate-500 block mb-1.5">Transaction Type</label>
          <select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none"
          >
            <option value="">Select transaction...</option>
            {transactionTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <button
          onClick={lookup}
          disabled={!transactionType}
          className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" /> Look Up Fees
        </button>

        {results.length > 0 && (
          <div className="space-y-3 mt-4">
            {results.map((r, i) => (
              <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase">
                      {r.fee_type}
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{r.description}</p>
                    <p className="text-xs text-slate-400 mt-1">Payable to: {r.payable_to}</p>
                  </div>
                  <span className="text-lg font-bold text-slate-800 dark:text-white">{r.amount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
