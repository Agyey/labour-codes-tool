"use server";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getEntities() {
  try {
    return await prisma.entity.findMany({
      orderBy: { name: "asc" },
      include: {
        matters: true,
      }
    });
  } catch (error) {
    logger.error("Failed to fetch entities", error);
    return [];
  }
}

export async function createEntity(data: {
  name: string;
  type?: string;
  industry?: string;
  status?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  try {
    const entity = await prisma.entity.create({
      data: {
        name: data.name,
        type: data.type,
        industry: data.industry,
        status: data.status || "Healthy",
      },
    });
    return { success: true, entity };
  } catch (error) {
    logger.error("Failed to create entity", error);
    return { success: false, error: "Database error" };
  }
}

export async function updateEntity(id: string, data: {
  name?: string;
  type?: string;
  industry?: string;
  status?: string;
  health_score?: number;
  compliance_score?: string;
}) {
  try {
    const entity = await prisma.entity.update({
      where: { id },
      data,
    });
    return { success: true, entity };
  } catch (error) {
    logger.error("Failed to update entity", error);
    return { success: false, error: "Failed to update entity" };
  }
}

export async function deleteEntity(id: string) {
  try {
    await prisma.entity.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    logger.error("Failed to delete entity", error);
    return { success: false, error: "Failed to delete entity" };
  }
}
