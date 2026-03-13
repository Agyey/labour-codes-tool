import { prisma } from "@/lib/prisma";
import { MattersClient } from "@/components/matters/MattersClient";

export const dynamic = "force-dynamic";

export default async function MattersIndex() {
  const matters = await prisma.matter.findMany({
    orderBy: { created_at: "desc" },
    include: {
      entity: true,
      tasks: true,
      members: {
        include: {
          user: true
        }
      }
    }
  });

  return <MattersClient initialMatters={matters} />;
}
