"use client";

import { useState } from "react";
import { Calculator, IndianRupee, ArrowRight } from "lucide-react";

interface CalculatorResult {
  dutyAmount: number;
  surcharge: number;
  cess: number;
  totalPayable: number;
  articleRef: string;
  formula: string;
}

export default function StampDutyCalculator() {
  const [state, setState] = useState("Maharashtra");
  const [instrumentType, setInstrumentType] = useState("");
  const [propertyValue, setPropertyValue] = useState<number>(0);
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const instrumentTypes = [
    "Sale Deed", "Gift Deed", "Lease Deed", "Mortgage Deed",
    "Power of Attorney", "Partnership Deed", "Agreement to Sell",
    "Conveyance", "Exchange", "Settlement",
  ];

  const states = [
    "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu",
    "Gujarat", "Rajasthan", "Uttar Pradesh", "West Bengal",
  ];

  const calculate = () => {
    // Simulated calculation (would call API /stamp-duty/calculate in production)
    let rate = 0;
    let surchargeRate = 0;
    let cessRate = 0;

    if (state === "Maharashtra" && instrumentType === "Sale Deed") {
      rate = 0.05; // 5%
      surchargeRate = 0.01; // 1% metro surcharge
      cessRate = 0.01; // LBT cess
    } else {
      rate = 0.06;
      surchargeRate = 0;
      cessRate = 0;
    }

    const duty = propertyValue * rate;
    const surcharge = propertyValue * surchargeRate;
    const cess = propertyValue * cessRate;

    setResult({
      dutyAmount: duty,
      surcharge,
      cess,
      totalPayable: duty + surcharge + cess,
      articleRef: "Article 25 — Conveyance",
      formula: `${(rate * 100).toFixed(1)}% of market value`,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-950/30 dark:to-fuchsia-950/30 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Calculator className="w-5 h-5 text-violet-600" />
          Stamp Duty Calculator
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Calculate applicable stamp duty based on state, instrument, and value
        </p>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500 block mb-1.5">State</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-violet-400 focus:outline-none"
            >
              {states.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500 block mb-1.5">Instrument Type</label>
            <select
              value={instrumentType}
              onChange={(e) => setInstrumentType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-violet-400 focus:outline-none"
            >
              <option value="">Select instrument...</option>
              {instrumentTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase text-slate-500 block mb-1.5">
            Property / Transaction Value (₹)
          </label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="number"
              value={propertyValue || ""}
              onChange={(e) => setPropertyValue(Number(e.target.value))}
              placeholder="Enter value..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-violet-400 focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={calculate}
          disabled={!instrumentType || !propertyValue}
          className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          Calculate
          <ArrowRight className="w-4 h-4" />
        </button>

        {result && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-3">
            <div className="text-xs text-slate-500">{result.articleRef}</div>
            <div className="text-xs text-slate-400">Formula: {result.formula}</div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Stamp Duty</span>
                <span className="font-medium">₹{result.dutyAmount.toLocaleString("en-IN")}</span>
              </div>
              {result.surcharge > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Surcharge</span>
                  <span>₹{result.surcharge.toLocaleString("en-IN")}</span>
                </div>
              )}
              {result.cess > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Cess</span>
                  <span>₹{result.cess.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Total Payable</span>
                <span className="text-violet-600 dark:text-violet-400">₹{result.totalPayable.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
