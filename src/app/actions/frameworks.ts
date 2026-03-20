"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Framework, Legislation } from "@/types/provision";

export async function getFrameworks(): Promise<Framework[]> {
  const dbFrameworks = await prisma.framework.findMany({
    include: { legislations: true }
  });

  return dbFrameworks.map((f: any) => ({
    id: f.id,
    name: f.name,
    shortName: f.short_name || "",
    description: f.description || "",
    color: (f as any).color || undefined,
    legislations: f.legislations.map((l: any) => ({
      id: l.id,
      frameworkId: l.framework_id,
      name: l.name,
      shortName: l.short_name || "",
      type: l.type,
      isRepealed: l.is_repealed,
      year: l.year || undefined,
      color: l.color || undefined,
    }))
  }));
}

export async function getLegislations(): Promise<Legislation[]> {
  const dbLegislations = await prisma.legislation.findMany();
  return dbLegislations.map((l: any) => ({
    id: l.id,
    frameworkId: l.framework_id,
    name: l.name,
    shortName: l.short_name || "",
    type: l.type,
    isRepealed: l.is_repealed,
    year: l.year || undefined,
    color: l.color || undefined,
  }));
}

export async function createFramework(data: any) {
  try {
    const framework = await prisma.framework.create({ data });
    revalidatePath("/admin");
    return { success: true, framework };
  } catch (err) {
    return { success: false, error: "Failed to create framework" };
  }
}

export async function updateFramework(id: string, data: any) {
  try {
    const framework = await prisma.framework.update({ where: { id }, data });
    revalidatePath("/admin");
    return { success: true, framework };
  } catch (err) {
    return { success: false, error: "Failed to update framework" };
  }
}

export async function deleteFramework(id: string) {
  try {
    await prisma.framework.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to delete framework" };
  }
}

export async function createLegislation(data: any) {
  try {
    const legislation = await prisma.legislation.create({ data });
    revalidatePath("/admin");
    return { success: true, legislation };
  } catch (err) {
    return { success: false, error: "Failed to create legislation" };
  }
}

export async function deleteLegislation(id: string) {
  try {
    await prisma.legislation.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to delete legislation" };
  }
}
