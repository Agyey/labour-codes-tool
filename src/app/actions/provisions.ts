import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod';

const prisma = new PrismaClient()

// Zod Validation Schema for Provision Updates
const ProvisionUpdateSchema = z.object({
  code: z.string(),
  ch: z.string().optional().nullable(),
  chName: z.string().optional().nullable(),
  sec: z.string(),
  sub: z.string().optional().nullable(),
  title: z.string(),
  summary: z.string(),
  fullText: z.string().optional().nullable(),
  impact: z.string().optional().nullable(),
  ruleAuth: z.string().optional().nullable(),
  changeTags: z.array(z.string()).optional(),
  workflowTags: z.array(z.string()).optional(),
  penaltyOld: z.string().optional().nullable(),
  penaltyNew: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  assignee: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  verified: z.boolean().optional(),
  pinned: z.boolean().optional(),
  
  oldMappings: z.array(z.object({
    act: z.string(),
    sec: z.string(),
    summary: z.string(),
    fullText: z.string().optional().nullable(),
    change: z.string().optional().nullable(),
    changeTags: z.array(z.string()).optional()
  })).optional(),
  
  compItems: z.array(z.object({
    task: z.string(),
    assignee: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    due: z.string().optional().nullable()
  })).optional()
}).passthrough();

// Fetch all provisions with relations
export async function getProvisions() {
  try {
    const provisions = await prisma.provision.findMany({
      include: {
        oldMappings: true,
        complianceItems: true,
        stateData: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                role: true,
              }
            }
          },
          orderBy: {
            created_at: 'asc'
          }
        }
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
      comments: p.comments.map((c: any) => ({
        id: c.id,
        body: c.body,
        parentId: c.parent_id,
        createdAt: c.created_at.toISOString(),
        user: c.user,
      })),
    }))
  } catch (error) {
    console.error("Error fetching provisions:", error)
    return []
  }
}

// Update an existing provision
export async function updateProvision(id: string, rawUpdates: any, userId?: string) {
  try {
    // Validate inputs via Zod
    const validatedData = ProvisionUpdateSchema.parse(rawUpdates);

    // Basic fields mapping for Prisma
    const data: any = {
      code: validatedData.code,
      chapter: validatedData.ch,
      chapter_name: validatedData.chName,
      section: validatedData.sec,
      sub_section: validatedData.sub,
      title: validatedData.title,
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
      due_date: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
      verified: validatedData.verified,
      pinned: validatedData.pinned,
    };
    
    // We update the core provision. For nested arrays like oldMappings, 
    // a full enterprise implementation would diff them. For now, we clear and recreate, 
    // or just handle the top-level fields for simplicity in this phase.
    
    if (validatedData.oldMappings) {
      await prisma.oldMapping.deleteMany({ where: { provision_id: id } });
      data.oldMappings = {
        create: validatedData.oldMappings.map((m: any) => ({
          act_name: m.act,
          section: m.sec,
          summary: m.summary,
          full_text: m.fullText,
          change_description: m.change,
          change_tags: m.changeTags || [],
        }))
      }
    }
    
    if (validatedData.compItems) {
      await prisma.complianceItem.deleteMany({ where: { provision_id: id } });
      data.complianceItems = {
        create: validatedData.compItems.map((c: any) => ({
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
          diff: JSON.parse(JSON.stringify(validatedData)), // Store the raw updates as diff
          edit_type: "MANUAL_EDIT",
        }
      });
    }
    
    revalidatePath('/')
    return { success: true, provision }
  } catch (error) {
    console.error("Error updating provision:", error)
    throw new Error('Failed to update provision')
  }
}

// Add a comment to a provision
export async function addComment(provisionId: string, body: string, parentId?: string) {
  try {
    const { getServerSession } = await import("next-auth/next")
    const { authOptions } = await import("@/lib/auth")
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !(session.user as any).id) {
      throw new Error("Unauthorized to comment")
    }
    
    const comment = await prisma.comment.create({
      data: {
        provision_id: provisionId,
        user_id: (session.user as any).id,
        body,
        parent_id: parentId || null,
      }
    })
    
    revalidatePath('/')
    return { success: true, comment }
  } catch (error) {
    console.error("Error adding comment:", error)
    throw new Error('Failed to add comment')
  }
}
