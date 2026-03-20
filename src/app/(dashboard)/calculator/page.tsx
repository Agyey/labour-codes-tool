import StampDutyCalculator from "@/components/connector-calculator/StampDutyCalculator";
import FeeCalculator from "@/components/connector-calculator/FeeCalculator";

export default function CalculatorPage() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Connector Act Tools
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Stamp duty calculator and fee lookup for transactions
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StampDutyCalculator />
        <FeeCalculator />
      </div>
    </div>
  );
}
