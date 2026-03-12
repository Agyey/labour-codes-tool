"use server"

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

// Fetch all provisions with relations
export async function getProvisions() {
  try {
    const provisions = await prisma.provision.findMany({
      include: {
        oldMappings: true,
        complianceItems: true,
        stateData: true,
      },
      orderBy: {
        code: 'asc',
      }
    })
    
    // Transform Prisma output back to the client expected shapes
    return provisions.map((p: any) => ({
      ...p,
      ch: p.chapter,
      chName: p.chapter_name,
      sec: p.section,
      sub: p.sub_section,
      fullText: p.full_text,
      ruleAuth: p.rule_authority,
      changeTags: p.change_tags,
      workflowTags: p.workflow_tags || [],
      penaltyOld: p.penalty_old || "",
      penaltyNew: p.penalty_new || "",
      dueDate: p.due_date ? p.due_date.toISOString() : "",
      oldMappings: p.oldMappings.map((m: any) => ({
        ...m,
        act: m.act_name,
        sec: m.section,
        fullText: m.full_text,
        change: m.change_description,
        changeTags: m.change_tags || [],
      })),
      compItems: p.complianceItems.map((c: any) => ({
        ...c,
        due: c.due_date ? c.due_date.toISOString() : "",
      })),
      stateNotes: p.stateData.reduce((acc: any, curr: any) => {
        if (curr.state && curr.notes) acc[curr.state] = curr.notes;
        return acc;
      }, {} as Record<string, string>),
      stateRuleText: p.stateData.reduce((acc: any, curr: any) => {
        if (curr.state && curr.rule_text) acc[curr.state] = curr.rule_text;
        return acc;
      }, {} as Record<string, string>),
      stateCompStatus: p.stateData.reduce((acc: any, curr: any) => {
        if (curr.state && curr.compliance_status) acc[curr.state] = curr.compliance_status;
        return acc;
      }, {} as Record<string, string>),
    }))
  } catch (error) {
    console.error("Error fetching provisions:", error)
    return []
  }
}

// Update an existing provision
export async function updateProvision(id: string, updates: any, userId?: string) {
  try {
    // Basic fields
    const data: any = {
      code: updates.code,
      chapter: updates.ch,
      chapter_name: updates.chName,
      section: updates.sec,
      sub_section: updates.sub,
      title: updates.title,
      summary: updates.summary,
      full_text: updates.fullText,
      impact: updates.impact,
      rule_authority: updates.ruleAuth,
      change_tags: updates.changeTags,
      workflow_tags: updates.workflowTags,
      penalty_old: updates.penaltyOld,
      penalty_new: updates.penaltyNew,
      notes: updates.notes,
      assignee: updates.assignee,
      due_date: updates.dueDate ? new Date(updates.dueDate) : null,
      verified: updates.verified,
      pinned: updates.pinned,
    };
    
    // We update the core provision. For nested arrays like oldMappings, 
    // a full enterprise implementation would diff them. For now, we clear and recreate, 
    // or just handle the top-level fields for simplicity in this phase.
    
    if (updates.oldMappings) {
      await prisma.oldMapping.deleteMany({ where: { provision_id: id } });
      data.oldMappings = {
        create: updates.oldMappings.map((m: any) => ({
          act_name: m.act,
          section: m.sec,
          summary: m.summary,
          full_text: m.fullText,
          change_description: m.change,
          change_tags: m.changeTags || [],
        }))
      }
    }
    
    if (updates.compItems) {
      await prisma.complianceItem.deleteMany({ where: { provision_id: id } });
      data.complianceItems = {
        create: updates.compItems.map((c: any) => ({
          task: c.task,
          assignee: c.assignee,
          status: c.status || 'Not Started',
          due_date: c.due ? new Date(c.due) : null,
        }))
      }
    }

    const provision = await prisma.provision.update({
      where: { id },
      data
    })
    
    // Audit Trail Hook: Record the edit if a user is provided
    if (userId) {
      await prisma.provisionEdit.create({
        data: {
          provision_id: id,
          user_id: userId,
          diff: JSON.parse(JSON.stringify(updates)), // Store the raw updates as diff
          edit_type: "MANUAL_EDIT",
        }
      });
    }
    
    revalidatePath('/')
    return { success: true, provision }
  } catch (error) {
    console.error("Error updating provision:", error)
    return { success: false, error: "Failed to update record" }
  }
}
