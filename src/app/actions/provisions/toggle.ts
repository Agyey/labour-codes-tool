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

export async function toggleVerify(id: string, verified: boolean) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await checkAdmin(session))) return { success: false, error: "Unauthorized" };

    const provision = await prisma.provision.update({
      where: { id },
      data: { verified }
    });

    await logActivity({
      orgId: session?.user?.orgId || "system",
      actorId: session?.user?.id || "system",
      action: "TOGGLE_VERIFY",
      entityType: "Provision",
      entityId: id,
      metadata: { verified }
    });

    revalidatePath("/library");
    return { success: true, provision };
  } catch {
    return { success: false, error: "Failed to toggle verify" };
  }
}

export async function togglePin(id: string, pinned: boolean) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await checkAdmin(session))) return { success: false, error: "Unauthorized" };

    const provision = await prisma.provision.update({
      where: { id },
      data: { pinned }
    });

    await logActivity({
      orgId: session?.user?.orgId || "system",
      actorId: session?.user?.id || "system",
      action: "TOGGLE_PIN",
      entityType: "Provision",
      entityId: id,
      metadata: { pinned }
    });

    revalidatePath("/library");
    return { success: true, provision };
  } catch {
    return { success: false, error: "Failed to toggle pin" };
  }
}

export async function deleteProvision(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await checkAdmin(session))) return { success: false, error: "Unauthorized" };

    await prisma.provision.delete({ where: { id } });

    await logActivity({
      orgId: session?.user?.orgId || "system",
      actorId: session?.user?.id || "system",
      action: "DELETE_PROVISION",
      entityType: "Provision",
      entityId: id
    });

    revalidatePath("/library");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete" };
  }
}

export async function deleteProvisions(ids: string[]) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await checkAdmin(session))) return { success: false, error: "Unauthorized" };

    await prisma.provision.deleteMany({
      where: { id: { in: ids } }
    });

    await logActivity({
      orgId: session?.user?.orgId || "system",
      actorId: session?.user?.id || "system",
      action: "DELETE_PROVISIONS_BULK",
      entityType: "Provision",
      entityId: "bulk",
      metadata: { count: ids.length }
    });

    revalidatePath("/library");
    return { success: true };
  } catch (error) {
    logger.error("Failed to bulk delete provisions", error);
    return { success: false, error: "Failed to delete multiple provisions" };
  }
}
