"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logActivity } from "@/lib/audit";

// --- Schemas ---
const CreateDiligenceSchema = z.object({
  name: z.string().min(3),
  clientName: z.string().min(2),
  targetCompany: z.string().min(2),
  type: z.string(),
  jurisdiction: z.string().optional(),
});

// --- Actions ---

export async function createDiligenceProject(data: z.infer<typeof CreateDiligenceSchema>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const validated = CreateDiligenceSchema.parse(data);
    const orgId = (session.user as any).orgId;

    // 1. Create the base Matter
    const matter = await prisma.matter.create({
      data: {
        name: `DD: ${validated.targetCompany} (${validated.type})`,
        description: `Due Diligence for ${validated.clientName} on ${validated.targetCompany}`,
        org_id: orgId,
        status: "Active",
      },
    });

    // 2. Add owner
    await prisma.matterMember.create({
      data: {
        matter_id: matter.id,
        user_id: session.user.id,
        role: "Owner",
      },
    });

    // 3. Create the Diligence Project
    const diligenceProject = await prisma.diligenceProject.create({
      data: {
        matter_id: matter.id,
        name: validated.name,
        client_name: validated.clientName,
        target_company: validated.targetCompany,
        type: validated.type,
        jurisdiction: validated.jurisdiction,
        status: "Setup",
      },
    });

    await logActivity({
      orgId,
      actorId: session.user.id,
      action: "CREATE_DILIGENCE_PROJECT",
      entityType: "DiligenceProject",
      entityId: diligenceProject.id,
      metadata: { matter_id: matter.id }
    });

    revalidatePath("/matters");
    revalidatePath("/diligence");
    
    return { success: true, projectId: diligenceProject.id };
  } catch (error: any) {
    console.error("[createDiligenceProject] Error:", error);
    return { success: false, error: error.message || "Failed to create project" };
  }
}

export async function getDiligenceProjects() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return [];

    return await prisma.diligenceProject.findMany({
      include: {
        matter: true,
        _count: {
          select: { requisitions: true }
        }
      },
      orderBy: { created_at: "desc" }
    });
  } catch (error) {
    console.error("[getDiligenceProjects] Error:", error);
    return [];
  }
}

export async function getDiligenceProjectDetails(id: string) {
  try {
    return await prisma.diligenceProject.findUnique({
      where: { id },
      include: {
        matter: {
          include: {
            members: { include: { user: true } },
            documents: true,
          }
        },
        buckets: {
          include: { items: { include: { documents: true, findings: true } } }
        },
        requisitions: {
          include: { documents: true, findings: true, provision: true }
        }
      }
    });
  } catch (error) {
    console.error("[getDiligenceProjectDetails] Error:", error);
    return null;
  }
}

export async function updateRequisitionStatus(id: string, status: string) {
  try {
    const requisition = await prisma.diligenceRequisition.update({
      where: { id },
      data: { status }
    });
    revalidatePath(`/diligence/${requisition.project_id}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update status" };
  }
}

export async function addFinding(requisitionId: string, data: { severity: string; description: string; analysis?: string; recommendation?: string }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const finding = await prisma.diligenceFinding.create({
      data: {
        requisition_id: requisitionId,
        severity: data.severity,
        description: data.description,
        analysis: data.analysis,
        recommendation: data.recommendation,
      }
    });

    // If severity is high, update requisition flag
    if (["Moderate", "High", "Deal Breaker"].includes(data.severity)) {
      await prisma.diligenceRequisition.update({
        where: { id: requisitionId },
        data: { risk_flag: true }
      });
    }

    return { success: true, finding };
  } catch (error) {
    return { success: false, error: "Failed to add finding" };
  }
}

export async function seedRequisitionsFromScenario(projectId: string, scenarioId: string) {
  try {
    const scenario = await prisma.scenarioTemplate.findUnique({
      where: { id: scenarioId },
      include: {
        rules: {
          include: {
            obligation: true
          }
        }
      }
    });

    if (!scenario) return { success: false, error: "Scenario not found" };

    const project = await prisma.diligenceProject.findUnique({ where: { id: projectId } });
    if (!project) return { success: false, error: "Project not found" };

    // Create a default bucket for the scenario
    const bucket = await prisma.diligenceBucket.create({
      data: {
        project_id: projectId,
        name: scenario.name,
      }
    });

    const requisitionPromises = scenario.rules.map((rule) => {
      const ob = rule.obligation;
      return prisma.diligenceRequisition.create({
        data: {
          project_id: projectId,
          bucket_id: bucket.id,
          title: ob.title,
          description: ob.description,
          applicable_law: ob.authority || undefined,
          required_docs: ob.required_form || undefined,
          status: "Requested",
          legal_relevance: ob.trigger_event || undefined,
          entity_type: ob.applicable_entity || undefined,
        }
      });
    });

    await Promise.all(requisitionPromises);
    
    revalidatePath(`/diligence/${projectId}`);
    return { success: true, count: scenario.rules.length };
  } catch (error) {
    console.error("[seedRequisitionsFromScenario] Error:", error);
    return { success: false, error: "Failed to seed requisitions" };
  }
}

export async function generateDiligenceReport(projectId: string) {
  try {
    const project = await prisma.diligenceProject.findUnique({
      where: { id: projectId },
      include: {
        requisitions: {
          where: { risk_flag: true },
          include: {
            findings: true,
            bucket: true,
            documents: true
          }
        }
      }
    });

    if (!project) return { error: "Project not found" };

    // Structure findings by severity
    const findings = project.requisitions.flatMap((r: any) => r.findings.map((f: any) => ({
      ...f,
      requisitionTitle: r.title,
      bucketName: r.bucket?.name || "General",
      docs: r.documents.map((d: any) => d.name)
    })));

    const reportData = {
      executiveSummary: `Due Diligence Report for ${project.target_company}. Transaction Type: ${project.type}.`,
      findings: {
        critical: findings.filter((f: any) => ["Deal Breaker", "High"].includes(f.severity)),
        moderate: findings.filter((f: any) => f.severity === "Moderate"),
        minor: findings.filter((f: any) => f.severity === "Minor"),
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        project: project.name,
        target: project.target_company,
        client: project.client_name
      }
    };

    return { success: true, report: reportData };
  } catch (error) {
    console.error("[generateDiligenceReport] Error:", error);
    return { success: false, error: "Failed to generate report" };
  }
}

export async function exportToExcel(projectId: string) {
  // Mock export for now
  return { success: true, message: "Exporting to Excel... This feature will be available in the next update." };
}
