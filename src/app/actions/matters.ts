"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createMatterFromScenario(data: {
  orgId: string;
  matterName: string;
  clientName: string;
  tasks: Array<{ title: string; type: string; priority: string; due: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  try {
    // 1. Create the Matter (Deal Room)
    const matter = await prisma.matter.create({
      data: {
        org_id: data.orgId,
        name: data.matterName,
        description: `Client: ${data.clientName}`, // Schema uses description instead of dedicated client_name
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

    // 3. Instantiate the Tasks from the Scenario checklist
    const taskPromises = data.tasks.map((task) => {
      // Very basic date logic based on the string 'Today', 'Tomorrow', etc.
      let due = new Date();
      if (task.due.includes("Tomorrow")) due.setDate(due.getDate() + 1);
      else if (task.due.includes("2 days")) due.setDate(due.getDate() + 2);
      else if (task.due.includes("Week")) due.setDate(due.getDate() + 7);
      else if (task.due.includes("Month")) due.setDate(due.getDate() + 30);

      // Determine starting column based on priority
      const status = task.type === "Docs" ? "todo" : "in_progress";

      return prisma.task.create({
        data: {
          matter_id: matter.id,
          name: task.title, // Schema uses 'name' instead of 'title'
          description: `Priority: ${task.priority}`,
          due_date: due,
        },
      });
    });

    await Promise.all(taskPromises);

    // 4. Create Notification
    await prisma.notification.create({
      data: {
        user_id: session.user.id,
        org_id: data.orgId,
        title: "New Matter Created",
        message: `Successfully generated matter "${data.matterName}" with ${data.tasks.length} tasks and deadlines.`,
        type: "SUCCESS",
        link: `/matters/${matter.id}`
      }
    });

    return { success: true, matterId: matter.id };
  } catch (error: any) {
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

export async function updateMatter(id: string, data: {
  name?: string;
  description?: string;
  status?: string;
  client_id?: string;
}) {
  try {
    const matter = await prisma.matter.update({
      where: { id },
      data,
    });
    return { success: true, matter };
  } catch (error) {
    console.error("Failed to update matter", error);
    return { success: false, error: "Failed to update matter" };
  }
}

export async function deleteMatter(id: string) {
  try {
    await prisma.matter.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error("Failed to delete matter", error);
    return { success: false, error: "Failed to delete matter" };
  }
}
