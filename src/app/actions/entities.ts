"use server"

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { logActivity } from "@/lib/audit";
import { revalidatePath } from "next/cache";

// --- Validation Schemas ---
const CreateEntitySchema = z.object({
  name: z.string().min(2).max(200),
  type: z.string().optional(),
  industry: z.string().optional(),
  status: z.string().optional().default("Healthy"),
});

const UpdateEntitySchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(200).optional(),
  type: z.string().optional(),
  industry: z.string().optional(),
  status: z.string().optional(),
  health_score: z.number().min(0).max(100).optional(),
  compliance_score: z.string().optional(),
});

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

export async function getEntityDetails(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;

    const entity = await prisma.entity.findUnique({
      where: { id },
      include: {
        compliances: true,
        matters: {
          take: 5,
          orderBy: { created_at: 'desc' }
        },
        hygieneLogs: {
          orderBy: { due_date: 'desc' },
          take: 10
        },
        licenses: true
      }
    });
    return entity;
  } catch (error) {
    logger.error(`Failed to fetch entity details for ${id}`, error);
    return null;
  }
}

export async function createEntity(data: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    const validated = CreateEntitySchema.parse(data);

    const entity = await prisma.entity.create({
      data: {
        name: validated.name,
        type: validated.type,
        industry: validated.industry,
        status: validated.status,
      },
    });

    await logActivity({
      orgId: entity.org_id || undefined,
      actorId: session.user.id,
      action: "CREATE_ENTITY",
      entityType: "Entity",
      entityId: entity.id,
      metadata: { name: validated.name }
    });

    revalidatePath('/entities');
    return { success: true, entity };
  } catch (error) {
    if (error instanceof z.ZodError) return { error: "Invalid entity data" };
    logger.error("Failed to create entity", error);
    return { error: "Database error" };
  }
}

export async function updateEntity(id: string, data: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    const validated = UpdateEntitySchema.parse({ id, ...data });

    const entity = await prisma.entity.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
        type: validated.type,
        industry: validated.industry,
        status: validated.status,
        health_score: validated.health_score,
        compliance_score: validated.compliance_score
      },
    });

    await logActivity({
      orgId: entity.org_id || undefined,
      actorId: session.user.id,
      action: "UPDATE_ENTITY",
      entityType: "Entity",
      entityId: validated.id,
      metadata: { updated_fields: Object.keys(data) }
    });

    revalidatePath(`/entities/${validated.id}`);
    revalidatePath('/entities');
    return { success: true, entity };
  } catch (error) {
    if (error instanceof z.ZodError) return { error: "Invalid update data" };
    logger.error("Failed to update entity", error);
    return { error: "Failed to update entity" };
  }
}

export async function deleteEntity(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    const entity = await prisma.entity.findUnique({ where: { id } });
    if (!entity) return { error: "Entity not found" };

    await prisma.entity.delete({ where: { id } });

    await logActivity({
      orgId: entity.org_id || undefined,
      actorId: session.user.id,
      action: "DELETE_ENTITY",
      entityType: "Entity",
      entityId: id,
      metadata: { name: entity.name }
    });

    revalidatePath('/entities');
    return { success: true };
  } catch (error) {
    logger.error("Failed to delete entity", error);
    return { error: "Failed to delete entity" };
  }
}
