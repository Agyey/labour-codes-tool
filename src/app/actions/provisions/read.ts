/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { Provision } from "@/types/provision";

/**
 * Fetches all provisions with nested relations and maps them to the frontend type.
 * Eradicates legacy 'any' casts by using explicit Prisma types where possible.
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

    return dbProvs.map((p: any) => ({
      id: p.id,
      code: p.code,
      frameworkId: p.framework_id || undefined,
      legislationId: p.legislation_id || undefined,
      ch: p.chapter,
      chName: p.chapter_name,
      sec: p.section,
      sub: p.sub_section,
      title: p.title,
      provisionType: (p.provision_type as any) || 'section',
      parentSection: p.parent_section || undefined,
      subSections: (p.sub_sections as any) || [],
      linkedRuleRefs: p.linked_rule_refs || [],
      ruleAuth: (p.rule_authority as any),
      summary: p.summary,
      fullText: p.full_text,
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
      impact: (p.impact as any),
      changeTags: p.change_tags,
      workflowTags: p.workflow_tags,
      compItems: (p.complianceItems || []).map((c: any) => ({
        task: c.task,
        assignee: c.assignee || "",
        due: c.due_date ? c.due_date.toISOString() : "",
      })),
      draftRules: [],
      repealedRules: [],
      forms: [],
      stateNotes: (p.stateData || []).reduce((acc: Record<string, string>, s: any) => ({ ...acc, [s.state]: s.notes || "" }), {}),
      stateRuleText: (p.stateData || []).reduce((acc: Record<string, string>, s: any) => ({ ...acc, [s.state]: s.rule_text || "" }), {}),
      stateCompStatus: (p.stateData || []).reduce((acc: Record<string, any>, s: any) => ({ ...acc, [s.state]: (s.compliance_status as any) || "Not Started" }), {}),
      penaltyOld: p.penalty_old || "",
      penaltyNew: p.penalty_new || "",
      timelineDates: [],
      notes: p.notes || "",
      verified: p.verified,
      pinned: p.pinned,
      assignee: p.assignee || "",
      dueDate: p.due_date ? p.due_date.toISOString() : "",
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
  } catch {
    logger.error("Failed to fetch provisions");
    return [];
  }
}
