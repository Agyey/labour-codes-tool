import { getCases } from "@/app/actions/litigation";
import { LitigationClient } from "@/components/litigation/LitigationClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LitigationPage() {
  const cases = await getCases();
  const matters = await prisma.matter.findMany({
    select: { id: true, name: true }
  });

  return <LitigationClient initialCases={cases} matters={matters} />;
}
