import ProvisionTree from "@/components/reading-view/ProvisionTree";
import ProvisionContent from "@/components/reading-view/ProvisionContent";
import PointInTimeSlider from "@/components/reading-view/PointInTimeSlider";

// This page would receive SSR data from a server action or RSC fetch
// For now, providing the component structure and placeholder data

const mockTree = [
  {
    id: "ch1",
    unit_type: "Chapter",
    number: "I",
    title: "PRELIMINARY",
    depth_level: 1,
    children: [
      {
        id: "s1",
        unit_type: "Section",
        number: "1",
        title: "Short title, extent and commencement",
        depth_level: 2,
        children: [],
      },
      {
        id: "s2",
        unit_type: "Section",
        number: "2",
        title: "Definitions",
        depth_level: 2,
        children: [],
      },
    ],
  },
];

export default function ReadingViewPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <PointInTimeSlider onDateChange={(d) => console.log("Date:", d)} />
      <div className="flex flex-1 overflow-hidden">
        <ProvisionTree
          nodes={mockTree}
          onSelect={(id) => console.log("Selected:", id)}
        />
        <ProvisionContent
          unitType="Section"
          number="1"
          title="Short title, extent and commencement"
          fullText="This Act may be called the Companies Act, 2013. It extends to the whole of India."
          status="Active"
          complianceType="None"
          definitions={[
            {
              term: "Company",
              definition_text: 'A company formed and registered under this Act or an existing company as defined in clause (ii) of sub-section (1) of section 3.',
              is_inclusive: true,
            },
          ]}
          crossReferences={[
            { reference_type: "Read With", reference_text: "Companies (Amendment) Act, 2015" },
          ]}
        />
      </div>
    </div>
  );
}
