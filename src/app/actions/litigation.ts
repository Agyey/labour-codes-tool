"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logActivity } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function getCases() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return [];

    return await prisma.legalCase.findMany({
      include: {
        matter: true,
        hearings: {
          orderBy: { date: 'asc' },
          take: 1
        },
        counsels: true
      },
      orderBy: { updated_at: 'desc' }
    });
  } catch (err) {
    console.error("Failed to fetch cases", err);
    return [];
  }
}

export async function getCounsels() {
  try {
    return await prisma.counsel.findMany({
      orderBy: { rating: 'desc' }
    });
  } catch (err) {
    console.error("Failed to fetch counsels", err);
    return [];
  }
}

export async function createCase(data: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const legalCase = await prisma.legalCase.create({
      data: {
        name: data.name,
        case_number: data.caseNumber,
        court: data.court,
        bench: data.bench,
        status: data.status || "Active",
        stage: data.stage || "Notice",
        description: data.description,
        opposition: data.opposition,
        matter_id: data.matterId,
      }
    });

    await logActivity({
      orgId: session.user.orgId || "system",
      actorId: session.user.id,
      action: "CREATE_CASE",
      entityType: "LegalCase",
      entityId: legalCase.id,
      metadata: { name: legalCase.name }
    });

    revalidatePath("/litigation");
    return { success: true, case: legalCase };
  } catch (err) {
    console.error("Failed to create case", err);
    return { success: false, error: "Internal server error" };
  }
}
