/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";
import { MOCK_PRIVATE_PLACEMENT } from "@/lib/mockData";
import type { Provision, Comment } from "@/types/provision";
import { ProvisionUpdateSchema } from "@/lib/validations/provision";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logActivity } from "@/lib/audit";

export async function injectSampleData(frameworkId: string, activeCode: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const legislation = await prisma.legislation.findFirst({
      where: { framework_id: frameworkId }
    });

    if (!legislation) return { success: false, error: "No legislation found in this framework" };

    const provision = await prisma.provision.create({
      data: {
        code: activeCode,
        framework_id: frameworkId,
        legislation_id: legislation.id,
        chapter: MOCK_PRIVATE_PLACEMENT.ch,
        chapter_name: MOCK_PRIVATE_PLACEMENT.chName,
        section: MOCK_PRIVATE_PLACEMENT.sec,
        sub_section: MOCK_PRIVATE_PLACEMENT.sub,
        title: MOCK_PRIVATE_PLACEMENT.title,
        provision_type: "section",
        summary: MOCK_PRIVATE_PLACEMENT.summary,
        full_text: MOCK_PRIVATE_PLACEMENT.fullText,
        impact: MOCK_PRIVATE_PLACEMENT.impact,
        rule_authority: "Central Government",
        verified: true,
        pinned: true,
        change_tags: MOCK_PRIVATE_PLACEMENT.changeTags,
        workflow_tags: MOCK_PRIVATE_PLACEMENT.workflowTags,
        penalty_old: MOCK_PRIVATE_PLACEMENT.penaltyOld,
        penalty_new: MOCK_PRIVATE_PLACEMENT.penaltyNew,
        notes: MOCK_PRIVATE_PLACEMENT.notes,
        created_at: new Date(),
        updated_at: new Date(),
      }
    });

    await logActivity({
      orgId: session.user.orgId || "system",
      actorId: session.user.id,
      action: "INJECT_MOCK",
      entityType: "Provision",
      entityId: provision.id,
      metadata: { frameworkId, activeCode }
    });

    revalidatePath("/library");
    return { success: true, provisionId: provision.id };
  } catch (err) {
    logger.error("Failed to inject sample data", err);
    return { success: false, error: "Internal server error" };
  }
}

// Local helper for Prisma transaction client type if Prisma.TransactionClient is missing or causing issues
type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * Fetches all provisions with nested relations and maps them to the frontend type.
 */
export async function getProvisions(): Promise<Provision[]> {
  try {
    logger.info("Fetching provisions from database");
    const dbProvs = await prisma.provision.findMany({
      include: {
        oldMappings: true,
        complianceItems: true,
        framework: true,
        legislation: true,
        comments: {
          include: {
            user: true
          },
          orderBy: {
            created_at: 'desc'
          }
        },
        stateData: true
      }
    });

    logger.info(`Successfully fetched ${dbProvs.length} provisions`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (dbProvs as any[]).map((p: any) => ({
      id: p.id,
      code: p.code,
      frameworkId: p.framework_id,
      legislationId: p.legislation_id,
      ch: p.chapter,
      chName: p.chapter_name,
      sec: p.section,
      sub: p.sub_section,
      title: p.title,
      provisionType: p.provision_type || 'section',
      parentSection: p.parent_section || undefined,
      subSections: (p.sub_sections as any) || [],
      linkedRuleRefs: p.linked_rule_refs || [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ruleAuth: p.rule_authority as any,
      summary: p.summary,
      fullText: p.full_text,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      oldMappings: (p.oldMappings || []).map((m: any) => ({
        act: m.act_name,
        sec: m.section,
        subSec: m.sub_section || undefined,
        targetSubSec: m.target_sub_section || undefined,
        summary: m.summary,
        fullText: m.full_text,
        change: m.change_description,
        changeTags: m.change_tags,
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      impact: p.impact as any,
      changeTags: p.change_tags,
      workflowTags: p.workflow_tags,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      compItems: (p.complianceItems || []).map((c: any) => ({
        task: c.task,
        assignee: c.assignee || "",
        due: c.due_date ? c.due_date.toISOString() : "",
      })),
      draftRules: [],
      repealedRules: [],
      forms: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stateNotes: (p.stateData || []).reduce((acc: any, s: any) => ({ ...acc, [s.state]: s.notes || "" }), {}),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stateRuleText: (p.stateData || []).reduce((acc: any, s: any) => ({ ...acc, [s.state]: s.rule_text || "" }), {}),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stateCompStatus: (p.stateData || []).reduce((acc: any, s: any) => ({ ...acc, [s.state]: s.compliance_status || "Not Started" }), {}),
      penaltyOld: p.penalty_old || "",
      penaltyNew: p.penalty_new || "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      timelineDates: [],
      notes: p.notes || "",
      verified: p.verified,
      pinned: p.pinned,
      assignee: p.assignee || "",
      dueDate: p.due_date ? p.due_date.toISOString() : "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      comments: (p.comments || []).map((c: any) => ({
        id: c.id,
        body: c.body,
        parentId: c.parent_id,
        createdAt: c.created_at.toISOString(),
        user: {
          id: c.user?.id || "unknown",
          name: c.user?.name || "Deleted User",
          email: c.user?.email,
          image: c.user?.image,
          role: c.user?.role || "viewer",
        },
      })),
    }));
  } catch (error) {
    logger.error("Failed to fetch provisions", error);
    return [];
  }
}

/** Helper to prevent Prisma crashes from invalid date strings like "" or "Pre-Meeting" */
const parseDateSafely = (d: string | null | undefined) => {
  if (!d) return null;
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return null;
  return parsed;
};

async function checkAdmin(session: any) {
  if (!session?.user) return false;
  return session.user.role === "admin" || session.user.role === "editor";
}

/**
 * Server action to upsert a provision with transactional integrity.
 */
export async function updateProvision(id: string, rawUpdates: Provision, userId?: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: "Unauthorized" };

    // Validate inputs via Zod
    const validatedData = ProvisionUpdateSchema.parse(rawUpdates);

    const result = await prisma.$transaction(async (tx: TransactionClient) => {
      const updateData: any = {
        code: validatedData.code,
        framework_id: validatedData.frameworkId || null,
        legislation_id: validatedData.legislationId || null,
        chapter: validatedData.ch,
        chapter_name: validatedData.chName,
        section: validatedData.sec,
        sub_section: validatedData.sub,
        title: validatedData.title,
        provision_type: validatedData.provisionType || 'section',
        parent_section: validatedData.parentSection || null,
        sub_sections: validatedData.subSections || [],
        linked_rule_refs: validatedData.linkedRuleRefs || [],
        summary: validatedData.summary,
        full_text: validatedData.fullText,
        impact: validatedData.impact,
        rule_authority: validatedData.ruleAuth,
        change_tags: validatedData.changeTags,
        workflow_tags: validatedData.workflowTags,
        penalty_old: validatedData.penaltyOld,
        penalty_new: validatedData.penaltyNew,
        notes: validatedData.notes,
        assignee: validatedData.assignee,
        due_date: parseDateSafely(validatedData.dueDate),
        verified: validatedData.verified,
        pinned: validatedData.pinned,
      };

      const oldMappingsCreate = (validatedData.oldMappings as any[] || []).map((m: any) => ({
        act_name: m.act,
        section: m.sec,
        sub_section: m.subSec || null,
        target_sub_section: m.targetSubSec || null,
        summary: m.summary,
        full_text: m.fullText,
        change_description: m.change,
        change_tags: m.change_tags || [],
      }));

      const compItemsCreate = (validatedData.compItems as any[] || []).map((c: any) => ({
        task: c.task,
        assignee: c.assignee,
        status: 'Not Started',
        due_date: parseDateSafely(c.due),
      }));

      const stateKeys = Array.from(new Set([
        ...Object.keys(validatedData.stateNotes || {}),
        ...Object.keys(validatedData.stateRuleText || {}),
        ...Object.keys(validatedData.stateCompStatus || {})
      ]));
      const stateDataCreate = stateKeys.map(s => ({
        state: s,
        notes: validatedData.stateNotes?.[s] || "",
        rule_text: validatedData.stateRuleText?.[s] || "",
        compliance_status: validatedData.stateCompStatus?.[s] || "Not Started"
      }));

      await tx.oldMapping.deleteMany({ where: { provision_id: id } });
      await tx.complianceItem.deleteMany({ where: { provision_id: id } });
      await tx.stateData.deleteMany({ where: { provision_id: id } });

      if (oldMappingsCreate.length > 0) updateData.oldMappings = { create: oldMappingsCreate };
      if (compItemsCreate.length > 0) updateData.complianceItems = { create: compItemsCreate };
      if (stateDataCreate.length > 0) updateData.stateData = { create: stateDataCreate };

      const updatedProvision = await tx.provision.upsert({
        where: { id },
        update: updateData,
        create: { id, ...updateData },
      });

      await tx.provisionEdit.create({
        data: {
          provision_id: id,
          user_id: session.user.id,
          edit_type: "update",
          diff: { message: "Updated provision via transactional editor" },
        }
      });

      return updatedProvision;
    });

    revalidatePath("/library");
    return { success: true, provision: result };
  } catch (error: any) {
    logger.error("Failed to upsert provision", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to save provision" };
  }
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

