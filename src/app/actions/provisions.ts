"use server";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { Provision, Comment } from "@/types/provision";
import { ProvisionUpdateSchema } from "@/lib/validations/provision";
import { PrismaClient } from "@prisma/client";

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

/**
 * Server action to upsert a provision with transactional integrity.
 * Uses upsert to handle both new provisions (from PDF parser/editor) and existing updates.
 * Ensures that nested updates (oldMappings, complianceItems) are atomic.
 */
export async function updateProvision(id: string, rawUpdates: Provision, userId?: string) {
  try {
    // Validate inputs via Zod
    const validatedData = ProvisionUpdateSchema.parse(rawUpdates);

    const result = await prisma.$transaction(async (tx: TransactionClient) => {
      // Basic fields mapping for Prisma
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      // 1. Build nested relation payloads
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const compItemsCreate = (validatedData.compItems as any[] || []).map((c: any) => ({
        task: c.task,
        assignee: c.assignee,
        status: 'Not Started',
        due_date: parseDateSafely(c.due),
      }));

      // Merge state data keys
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

      // 2. Clear existing relations (safe even if record is new — deleteMany returns 0)
      await tx.oldMapping.deleteMany({ where: { provision_id: id } });
      await tx.complianceItem.deleteMany({ where: { provision_id: id } });
      await tx.stateData.deleteMany({ where: { provision_id: id } });

      // 3. Build the full data payload with nested creates
      if (oldMappingsCreate.length > 0) {
        updateData.oldMappings = { create: oldMappingsCreate };
      }
      if (compItemsCreate.length > 0) {
        updateData.complianceItems = { create: compItemsCreate };
      }
      if (stateDataCreate.length > 0) {
        updateData.stateData = { create: stateDataCreate };
      }

      // 4. Upsert: creates if new, updates if existing
      const updatedProvision = await tx.provision.upsert({
        where: { id },
        update: updateData,
        create: { id, ...updateData },
      });

      // 3. Audit Trail Hook
      if (userId) {
        await tx.provisionEdit.create({
          data: {
            provision_id: id,
            user_id: userId,
            edit_type: "update",
            diff: { message: "Updated provision via transactional editor" },
          }
        });
      }

      return updatedProvision;
    });

    return { success: true, provision: result };
  } catch (error: any) {
    logger.error("Failed to upsert provision", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to save provision" 
    };
  }
}

export async function toggleVerify(id: string, verified: boolean) {
  try {
    const provision = await prisma.provision.update({
      where: { id },
      data: { verified }
    });
    return { success: true, provision };
  } catch {
    return { success: false, error: "Failed to toggle verify" };
  }
}

export async function togglePin(id: string, pinned: boolean) {
  try {
    const provision = await prisma.provision.update({
      where: { id },
      data: { pinned }
    });
    return { success: true, provision };
  } catch {
    return { success: false, error: "Failed to toggle pin" };
  }
}

export async function deleteProvision(id: string) {
  try {
    await prisma.provision.delete({ where: { id } });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete" };
  }
}

export async function deleteProvisions(ids: string[]) {
  try {
    await prisma.provision.deleteMany({
      where: {
        id: { in: ids }
      }
    });
    return { success: true };
  } catch (error) {
    logger.error("Failed to bulk delete provisions", error);
    return { success: false, error: "Failed to delete multiple provisions" };
  }
}

export async function addComment(provisionId: string, body: string) {
  // Mocking auth for now - in production use getServerSession
  const userId = "temp-user-id"; 
  
  try {
    const comment = await prisma.comment.create({
      data: {
        body,
        provision_id: provisionId,
        user_id: userId,
      },
      include: {
        user: true
      }
    });
    
    // Map to frontend type
    const formattedComment: Comment = {
      id: comment.id,
      body: comment.body,
      parentId: comment.parent_id,
      createdAt: comment.created_at.toISOString(),
      user: {
        id: comment.user.id,
        name: comment.user.name,
        email: comment.user.email,
        image: comment.user.image,
        role: comment.user.role,
      }
    };
    
    return { success: true, comment: formattedComment };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Failed to add comment" };
  }
}

export async function getLegislations() {
  try {
    const legislations = await prisma.legislation.findMany({
      include: {
        provisions: {
          select: { id: true }
        }
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            provisions: {
              select: { id: true }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

/** 
 * Hierarchical CRUD Actions 
 */

export async function createFramework(data: { name: string; shortName: string; description?: string }) {
  try {
    const framework = await prisma.framework.create({
      data: {
        name: data.name,
        short_name: data.shortName,
        description: data.description,
      }
    });
    return { success: true, framework };
  } catch (error) {
    logger.error("Failed to create framework", error);
    return { success: false, error: "Failed to create framework" };
  }
}

export async function updateFramework(id: string, data: { name?: string; shortName?: string; description?: string }) {
  try {
    const framework = await prisma.framework.update({
      where: { id },
      data: {
        name: data.name,
        short_name: data.shortName,
        description: data.description,
      }
    });
    return { success: true, framework };
  } catch (error) {
    logger.error("Failed to update framework", error);
    return { success: false, error: "Failed to update framework" };
  }
}

export async function deleteFramework(id: string) {
  try {
    await prisma.framework.delete({ where: { id } });
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
    return { success: true, legislation };
  } catch (error) {
    logger.error("Failed to create legislation", error);
    return { success: false, error: "Failed to create legislation" };
  }
}

export async function deleteLegislation(id: string) {
  try {
    await prisma.legislation.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    logger.error("Failed to delete legislation", error);
    return { success: false, error: "Failed to delete legislation" };
  }
}
