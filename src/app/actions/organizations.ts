import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { revalidatePath } from 'next/cache'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { logActivity } from "@/lib/audit"

// --- Validation Schemas ---
const InviteUserSchema = z.object({
  email: z.string().email(),
  orgId: z.string(),
  role: z.string().optional().default("Member"),
})

const UpdateMemberRoleSchema = z.object({
  userId: z.string(),
  orgId: z.string(),
  role: z.string(),
})

const RemoveMemberSchema = z.object({
  userId: z.string(),
  orgId: z.string(),
})

const UpdateOrgSettingsSchema = z.object({
  orgId: z.string(),
  name: z.string().min(2).max(100).optional(),
})

export async function getOrganizationData(orgId: string) {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        subscription: true,
      }
    })
    return org
  } catch (error) {
    logger.error("Failed to fetch organization data", error)
    return null
  }
}

export async function getOrgMembers(orgId: string) {
  try {
    const members = await prisma.organizationUser.findMany({
      where: { org_id: orgId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      },
      orderBy: {
        user: {
          name: 'asc'
        }
      }
    })
    return members
  } catch (error) {
    logger.error("Failed to fetch organization members", error)
    return []
  }
}

export async function inviteUser(email: string, orgId: string, role: string = "Member") {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return { error: "Unauthorized" }

    // Validate Input
    const validated = InviteUserSchema.parse({ email, orgId, role })

    // 1. Find or create user
    let user = await prisma.user.findUnique({ where: { email: validated.email } })
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: validated.email,
          name: validated.email.split('@')[0], 
          role: "viewer", 
        }
      })
    }
    
    // 2. Link to org
    const existingLink = await prisma.organizationUser.findFirst({
      where: { org_id: validated.orgId, user_id: user.id }
    })
    
    if (existingLink) {
      return { error: "User is already a member of this organization" }
    }
    
    await prisma.organizationUser.create({
      data: {
        org_id: validated.orgId,
        user_id: user.id,
        role: validated.role
      }
    })
    
    // 3. Audit Log
    await logActivity({
      orgId: validated.orgId,
      actorId: session.user.id,
      action: "INVITE_USER",
      entityType: "User",
      entityId: user.id,
      metadata: { invited_email: validated.email, assigned_role: validated.role }
    })

    // 4. Create Notification
    await prisma.notification.create({
      data: {
        user_id: user.id,
        org_id: validated.orgId,
        title: "Workspace Invitation",
        message: `You have been invited to join an organization.`,
        type: "INFO",
        link: "/org-settings"
      }
    })

    revalidatePath('/org-settings')
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) return { error: "Invalid input data" }
    logger.error("Failed to invite user", error)
    return { error: "Invitation failed" }
  }
}

export async function updateMemberRole(userId: string, orgId: string, role: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return { error: "Unauthorized" }

    const validated = UpdateMemberRoleSchema.parse({ userId, orgId, role })

    const link = await prisma.organizationUser.findFirst({
      where: { org_id: validated.orgId, user_id: validated.userId }
    })
    
    if (!link) return { error: "Membership not found" }
    
    await prisma.organizationUser.update({
      where: { id: link.id },
      data: { role: validated.role }
    })

    await logActivity({
      orgId: validated.orgId,
      actorId: session.user.id,
      action: "UPDATE_MEMBER_ROLE",
      entityType: "User",
      entityId: validated.userId,
      metadata: { new_role: validated.role }
    })
    
    revalidatePath('/org-settings')
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) return { error: "Invalid parameters" }
    logger.error("Failed to update member role", error)
    return { error: "Update failed" }
  }
}

export async function removeMember(userId: string, orgId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return { error: "Unauthorized" }

    const validated = RemoveMemberSchema.parse({ userId, orgId })

    const link = await prisma.organizationUser.findFirst({
      where: { org_id: validated.orgId, user_id: validated.userId }
    })
    
    if (!link) return { error: "Membership not found" }
    
    await prisma.organizationUser.delete({
      where: { id: link.id }
    })

    await logActivity({
      orgId: validated.orgId,
      actorId: session.user.id,
      action: "REMOVE_MEMBER",
      entityType: "User",
      entityId: validated.userId
    })
    
    revalidatePath('/org-settings')
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) return { error: "Invalid parameters" }
    logger.error("Failed to remove member", error)
    return { error: "Removal failed" }
  }
}

export async function updateOrgSettings(orgId: string, data: { name?: string }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return { error: "Unauthorized" }

    const validated = UpdateOrgSettingsSchema.parse({ orgId, ...data })

    await prisma.organization.update({
      where: { id: validated.orgId },
      data: { name: validated.name }
    })

    await logActivity({
      orgId: validated.orgId,
      actorId: session.user.id,
      action: "UPDATE_ORG_SETTINGS",
      entityType: "Organization",
      entityId: validated.orgId,
      metadata: { updated_fields: Object.keys(data) }
    })

    revalidatePath('/org-settings')
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) return { error: "Invalid settings" }
    logger.error("Failed to update organization settings", error)
    return { error: "Update failed" }
  }
}
