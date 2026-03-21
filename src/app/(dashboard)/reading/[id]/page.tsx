import { prisma } from "@/lib/prisma";
import ReadingViewClient from "./ReadingViewClient";
import { FileText } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

// Formats the Prisma tree into ProvisionTree generic generic schemas
function formatDetailedTree(units: any[], depth: number = 1): any[] {
  if (!units || !units.length) return [];
  
  return units.map(unit => ({
    id: unit.id,
    unit_type: unit.unit_type,
    number: unit.unit_number,
    title: unit.title,
    depth_level: depth,
    children: formatDetailedTree(unit.child_units, depth + 1)
  }));
}

export default async function ReadingViewPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  // Fetch standard document top level data
  const document = await prisma.legalDocument.findUnique({
    where: { id: params.id }
  });

  if (!document) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] items-center justify-center text-slate-500 bg-slate-50 dark:bg-zinc-950">
        <FileText className="w-12 h-12 mb-4 opacity-50" />
        <p>Document not found or still processing.</p>
      </div>
    );
  }

  // Fetch nested component tree directly natively via Prisma
  const rawUnits = await prisma.structuralUnit.findMany({
    where: { 
      legal_doc_id: params.id, 
      parent_unit_id: null 
    },
    include: {
      child_units: {
        orderBy: { sort_order: "asc" },
        include: {
          child_units: {
            orderBy: { sort_order: "asc" },
            include: {
              child_units: {
                orderBy: { sort_order: "asc" },
                include: {
                  child_units: {
                    orderBy: { sort_order: "asc" }
                  }
                }
              }
            }
          }
        }
      }
    },
    orderBy: { sort_order: "asc" }
  });

  const treeNodes = formatDetailedTree(rawUnits);

  return <ReadingViewClient document={document} initialTreeNodes={treeNodes} />;
}

