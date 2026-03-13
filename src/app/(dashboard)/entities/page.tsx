import { prisma } from "@/lib/prisma";
import { EntitiesClient } from "@/components/entities/EntitiesClient";

export const dynamic = "force-dynamic";

export default async function EntitiesPage() {
  const entities = await prisma.entity.findMany({
    orderBy: { created_at: "desc" },
    include: {
      compliances: true,
      matters: true,
    }
  });

  return <EntitiesClient initialEntities={entities} />;
}
