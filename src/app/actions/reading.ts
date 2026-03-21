"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getUnitDetails(unitId: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const unit = await prisma.structuralUnit.findUnique({
    where: { id: unitId },
    include: {
      definitions: true,
      xrefs: true,
      penalties: true,
      obligations: true
    }
  });

  if (!unit) {
    throw new Error("Unit not found");
  }

  return unit;
}
