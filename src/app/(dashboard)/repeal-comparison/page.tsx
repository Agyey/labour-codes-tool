import RepealDiffView from "@/components/repeal-comparison/RepealDiffView";

const mockMappings = [
  {
    id: "1",
    mapping_type: "Direct Replacement",
    repealed_unit_type: "Section",
    repealed_number: "3",
    repealed_title: "Formation of Companies",
    repealed_text: "Any seven or more persons associated for any lawful purpose may subscribe...",
    replacing_unit_type: "Section",
    replacing_number: "3",
    replacing_title: "Formation of Company",
    replacing_text: "A company may be formed for any lawful purpose by seven or more persons...",
    mapping_notes: "Threshold reduced for private companies.",
  },
  {
    id: "2",
    mapping_type: "No Equivalent",
    repealed_unit_type: "Section",
    repealed_number: "25",
    repealed_title: "Licence for associations",
    repealed_text: "The Central Government may license certain associations...",
    replacing_unit_type: "Section",
    replacing_number: "8",
    replacing_title: "Formation of companies with charitable objects",
    replacing_text: "Expanded to allow formation with broader charitable and social objectives.",
    savings_clause_ref: "Section 465(1) — existing licences saved.",
  },
];

export default function RepealComparisonPage() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Repeal Comparison View
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Side-by-side comparison of repealed vs replacing provisions
        </p>
      </header>

      <RepealDiffView
        oldActTitle="Companies Act, 1956"
        newActTitle="Companies Act, 2013"
        mappings={mockMappings}
      />
    </div>
  );
}
