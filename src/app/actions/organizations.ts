"use server"

import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { revalidatePath } from 'next/cache'

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
    // 1. Find or create user
    let user = await prisma.user.findUnique({ where: { email } })
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0], // Default name
          role: "viewer", // Default system-wide role
        }
      })
    }
    
    // 2. Link to org
    const existingLink = await prisma.organizationUser.findFirst({
      where: { org_id: orgId, user_id: user.id }
    })
    
    if (existingLink) {
      return { error: "User is already a member of this organization" }
    }
    
    await prisma.organizationUser.create({
      data: {
        org_id: orgId,
        user_id: user.id,
        role
      }
    })
    
    revalidatePath('/org-settings')
    return { success: true }
  } catch (error) {
    logger.error("Failed to invite user", error)
    return { error: "Invitation failed" }
  }
}

export async function updateMemberRole(userId: string, orgId: string, role: string) {
  try {
    const link = await prisma.organizationUser.findFirst({
      where: { org_id: orgId, user_id: userId }
    })
    
    if (!link) return { error: "Membership not found" }
    
    await prisma.organizationUser.update({
      where: { id: link.id },
      data: { role }
    })
    
    revalidatePath('/org-settings')
    return { success: true }
  } catch (error) {
    logger.error("Failed to update member role", error)
    return { error: "Update failed" }
  }
}

export async function removeMember(userId: string, orgId: string) {
  try {
    const link = await prisma.organizationUser.findFirst({
      where: { org_id: orgId, user_id: userId }
    })
    
    if (!link) return { error: "Membership not found" }
    
    await prisma.organizationUser.delete({
      where: { id: link.id }
    })
    
    revalidatePath('/org-settings')
    return { success: true }
  } catch (error) {
    logger.error("Failed to remove member", error)
    return { error: "Removal failed" }
  }
}

export async function updateOrgSettings(orgId: string, data: { name?: string }) {
  try {
    await prisma.organization.update({
      where: { id: orgId },
      data
    })
    revalidatePath('/org-settings')
    return { success: true }
  } catch (error) {
    logger.error("Failed to update organization settings", error)
    return { error: "Update failed" }
  }
}
