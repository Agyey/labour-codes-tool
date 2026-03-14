"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getScenarioTemplates() {
  try {
    return await prisma.scenarioTemplate.findMany({
      include: {
        rules: {
          include: {
            obligation: true
          }
        }
      },
      orderBy: { name: "asc" }
    });
  } catch (error) {
    console.error("[getScenarioTemplates] Error:", error);
    return [];
  }
}

export async function getComplianceObligations() {
  try {
    return await prisma.complianceObligation.findMany({
      include: {
        section: {
          include: {
            act: true
          }
        }
      },
      orderBy: { title: "asc" }
    });
  } catch (error) {
    console.error("[getComplianceObligations] Error:", error);
    return [];
  }
}

export async function createScenarioTemplate(data: { name: string; description?: string }) {
  try {
    const scenario = await prisma.scenarioTemplate.create({
      data: {
        name: data.name,
        description: data.description,
      }
    });
    revalidatePath("/scenarios");
    return { success: true, scenario };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addObligationToScenario(scenarioId: string, obligationId: string) {
  try {
    const rule = await prisma.scenarioRule.create({
      data: {
        scenario_id: scenarioId,
        obligation_id: obligationId,
      }
    });
    revalidatePath("/scenarios");
    return { success: true, rule };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function removeObligationFromScenario(ruleId: string) {
  try {
    await prisma.scenarioRule.delete({
      where: { id: ruleId }
    });
    revalidatePath("/scenarios");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteScenarioTemplate(id: string) {
  try {
    await prisma.scenarioTemplate.delete({
      where: { id }
    });
    revalidatePath("/scenarios");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
