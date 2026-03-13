"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { logActivity } from "@/lib/audit";

// --- Validation Schemas ---
const CreateMatterSchema = z.object({
  orgId: z.string(),
  matterName: z.string().min(3).max(200),
  clientName: z.string().min(2).max(200),
  tasks: z.array(z.object({
    title: z.string(),
    type: z.string(),
    priority: z.string(),
    due: z.string(),
  })),
});

const UpdateMatterSchema = z.object({
  id: z.string(),
  name: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  client_id: z.string().optional(),
});

export async function createMatterFromScenario(data: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    const validated = CreateMatterSchema.parse(data);

    // 1. Create the Matter (Deal Room)
    const matter = await prisma.matter.create({
      data: {
        org_id: validated.orgId,
        name: validated.matterName,
        description: `Client: ${validated.clientName}`, 
        status: "Active",
      },
    });

    // 2. Add current user as the Owner/Editor
    await prisma.matterMember.create({
      data: {
        matter_id: matter.id,
        user_id: session.user.id,
        role: "Owner",
      },
    });

    // 3. Instantiate the Tasks
    const taskPromises = validated.tasks.map((task) => {
      let due = new Date();
      if (task.due.includes("Tomorrow")) due.setDate(due.getDate() + 1);
      else if (task.due.includes("2 days")) due.setDate(due.getDate() + 2);
      else if (task.due.includes("Week")) due.setDate(due.getDate() + 7);
      else if (task.due.includes("Month")) due.setDate(due.getDate() + 30);

      return prisma.task.create({
        data: {
          matter_id: matter.id,
          name: task.title,
          description: `Priority: ${task.priority}`,
          due_date: due,
        },
      });
    });

    await Promise.all(taskPromises);

    // 4. Audit Log
    await logActivity({
      orgId: validated.orgId,
      actorId: session.user.id,
      action: "CREATE_MATTER",
      entityType: "Matter",
      entityId: matter.id,
      metadata: { matter_name: validated.matterName, task_count: validated.tasks.length }
    })

    // 5. Create Notification
    await prisma.notification.create({
      data: {
        user_id: session.user.id,
        org_id: validated.orgId,
        title: "New Matter Created",
        message: `Successfully generated matter "${validated.matterName}" with ${validated.tasks.length} tasks and deadlines.`,
        type: "SUCCESS",
        link: `/matters/${matter.id}`
      }
    });

    return { success: true, matterId: matter.id };
  } catch (error: any) {
    if (error instanceof z.ZodError) return { success: false, error: "Invalid matter data" }
    console.error("[createMatterFromScenario] Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getMatters() {
  try {
    return await prisma.matter.findMany({
      orderBy: { created_at: "desc" },
      include: {
        entity: true,
        members: {
          include: {
            user: true
          }
        },
        tasks: true
      }
    });
  } catch (error) {
    console.error("Failed to fetch matters", error);
    return [];
  }
}

export async function getMatterDetails(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;

    const matter = await prisma.matter.findUnique({
      where: { id },
      include: {
        entity: true,
        members: {
          include: {
            user: true
          }
        },
        tasks: {
          orderBy: { created_at: "asc" }
        },
        auditLogs: {
          orderBy: { created_at: "desc" },
          take: 20
        }
      }
    });

    return matter;
  } catch (error) {
    console.error(`Failed to fetch matter details for ${id}`, error);
    return null;
  }
}

export async function updateMatter(id: string, data: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    const validated = UpdateMatterSchema.parse({ id, ...data });

    const matter = await prisma.matter.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
        description: validated.description,
        status: validated.status,
        client_id: validated.client_id
      },
    });

    await logActivity({
      orgId: matter.org_id || undefined,
      actorId: session.user.id,
      action: "UPDATE_MATTER",
      entityType: "Matter",
      entityId: validated.id,
      metadata: { updated_fields: Object.keys(data) }
    })

    return { success: true, matter };
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, error: "Invalid update parameters" }
    console.error("Failed to update matter", error);
    return { success: false, error: "Failed to update matter" };
  }
}

export async function deleteMatter(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };

    const matter = await prisma.matter.findUnique({ where: { id } });
    if (!matter) return { error: "Matter not found" };

    await prisma.matter.delete({ where: { id } });

    await logActivity({
      orgId: matter.org_id || undefined,
      actorId: session.user.id,
      action: "DELETE_MATTER",
      entityType: "Matter",
      entityId: id,
      metadata: { deleted_matter_name: matter.name }
    })

    return { success: true };
  } catch (error) {
    console.error("Failed to delete matter", error);
    return { success: false, error: "Failed to delete matter" };
  }
}
