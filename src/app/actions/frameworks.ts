/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logActivity } from "@/lib/audit";

async function checkAdmin(session: any) {
  if (!session?.user) return false;
  return session.user.role === "admin" || session.user.role === "editor";
}

export async function getLegislations() {
  try {
    const legislations = await prisma.legislation.findMany({
      include: {
        provisions: { select: { id: true } }
      }
    });
    return (legislations as any[]).map(l => ({
      id: l.id,
      frameworkId: l.framework_id,
      name: l.name,
      shortName: l.short_name,
      type: l.type,
      isRepealed: l.is_repealed,
      year: l.year,
      color: l.color,
      provisions: l.provisions
    }));
  } catch (error) {
    logger.error("Failed to fetch legislations", error);
    return [];
  }
}

export async function getFrameworks() {
  try {
    const frameworks = await prisma.framework.findMany({
      include: {
        legislations: {
          include: {
            provisions: { select: { id: true } }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    return (frameworks as any[]).map(f => ({
      id: f.id,
      name: f.name,
      shortName: f.short_name,
      description: f.description,
      legislations: (f.legislations || []).map((l: any) => ({
        id: l.id,
        frameworkId: l.framework_id,
        name: l.name,
        shortName: l.short_name,
        type: l.type,
        isRepealed: l.is_repealed,
        year: l.year,
        color: l.color,
        provisions: l.provisions
      }))
    }));
  } catch (error) {
    logger.error("Failed to fetch frameworks", error);
    return [];
  }
}

export async function createFramework(data: { name: string; shortName: string; description?: string }) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await checkAdmin(session))) return { success: false, error: "Unauthorized" };

    const framework = await prisma.framework.create({
      data: {
        name: data.name,
        short_name: data.shortName,
        description: data.description,
      }
    });

    await logActivity({
      orgId: session?.user?.orgId || "system",
      actorId: session?.user?.id || "system",
      action: "CREATE_FRAMEWORK",
      entityType: "Framework",
      entityId: framework.id
    });

    revalidatePath("/library");
    return { 
      success: true, 
      framework: {
        id: framework.id,
        name: framework.name,
        shortName: framework.short_name,
        description: framework.description
      } 
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create framework" };
  }
}

export async function updateFramework(id: string, data: { name?: string; shortName?: string; description?: string }) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await checkAdmin(session))) return { success: false, error: "Unauthorized" };

    const framework = await prisma.framework.update({
      where: { id },
      data: {
        name: data.name,
        short_name: data.shortName,
        description: data.description,
      }
    });

    await logActivity({
      orgId: session?.user?.orgId || "system",
      actorId: session?.user?.id || "system",
      action: "UPDATE_FRAMEWORK",
      entityType: "Framework",
      entityId: id
    });

    revalidatePath("/library");
    return { success: true, framework };
  } catch (error) {
    logger.error("Failed to update framework", error);
    return { success: false, error: "Failed to update framework" };
  }
}

export async function deleteFramework(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await checkAdmin(session))) return { success: false, error: "Unauthorized" };

    await prisma.framework.delete({ where: { id } });

    await logActivity({
      orgId: session?.user?.orgId || "system",
      actorId: session?.user?.id || "system",
      action: "DELETE_FRAMEWORK",
      entityType: "Framework",
      entityId: id
    });

    revalidatePath("/library");
    return { success: true };
  } catch (error) {
    logger.error("Failed to delete framework", error);
    return { success: false, error: "Failed to delete framework" };
  }
}

export async function createLegislation(data: { 
  frameworkId: string; 
  name: string; 
  shortName: string; 
  type: string; 
  isRepealed: boolean;
  year?: number;
  color?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await checkAdmin(session))) return { success: false, error: "Unauthorized" };

    const legislation = await prisma.legislation.create({
      data: {
        framework_id: data.frameworkId,
        name: data.name,
        short_name: data.shortName,
        type: data.type,
        is_repealed: data.isRepealed,
        year: data.year,
        color: data.color
      }
    });

    await logActivity({
      orgId: session?.user?.orgId || "system",
      actorId: session?.user?.id || "system",
      action: "CREATE_LEGISLATION",
      entityType: "Legislation",
      entityId: legislation.id
    });

    revalidatePath("/library");
    return { success: true, legislation };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create legislation" };
  }
}

export async function deleteLegislation(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await checkAdmin(session))) return { success: false, error: "Unauthorized" };

    await prisma.legislation.delete({ where: { id } });

    await logActivity({
      orgId: session?.user?.orgId || "system",
      actorId: session?.user?.id || "system",
      action: "DELETE_LEGISLATION",
      entityType: "Legislation",
      entityId: id
    });

    revalidatePath("/library");
    return { success: true };
  } catch (error) {
    logger.error("Failed to delete legislation", error);
    return { success: false, error: "Failed to delete legislation" };
  }
}
