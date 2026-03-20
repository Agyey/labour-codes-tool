/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";
import { MOCK_PRIVATE_PLACEMENT } from "@/lib/mockData";
import { ProvisionUpdateSchema } from "@/lib/validations/provision";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logActivity } from "@/lib/audit";
import type { Provision } from "@/types/provision";
import { PrismaClient } from "@prisma/client";

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

const parseDateSafely = (d: string | null | undefined) => {
  if (!d) return null;
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return null;
  return parsed;
};

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
  } catch {
    logger.error("Failed to inject sample data");
    return { success: false, error: "Internal server error" };
  }
}

export async function updateProvision(id: string, rawUpdates: Provision) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: "Unauthorized" };

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

      const oldMappingsCreate = (validatedData.oldMappings || []).map((m) => ({
        act_name: m.act,
        section: m.sec,
        sub_section: m.subSec || null,
        target_sub_section: m.targetSubSec || null,
        summary: m.summary,
        full_text: m.fullText,
        change_description: m.change,
        change_tags: m.changeTags || [],
      }));

      const compItemsCreate = (validatedData.compItems || []).map((c) => ({
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
  } catch (error) {
    logger.error("Failed to upsert provision", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to save provision" };
  }
}
