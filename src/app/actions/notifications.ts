"use server"

import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { revalidatePath } from 'next/cache'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

// --- Validation Schemas ---
const CreateNotificationSchema = z.object({
  userId: z.string(),
  orgId: z.string().optional(),
  title: z.string().min(1).max(200),
  message: z.string().min(1),
  type: z.enum(['INFO', 'WARNING', 'SUCCESS', 'URGENT']),
  link: z.string().optional(),
})

export async function createNotification(data: any) {
  try {
    const validated = CreateNotificationSchema.parse(data)

    const notification = await prisma.notification.create({
      data: {
        user_id: validated.userId,
        org_id: validated.orgId,
        title: validated.title,
        message: validated.message,
        type: validated.type,
        link: validated.link,
      }
    })
    return { success: true, notification }
  } catch (error) {
    if (error instanceof z.ZodError) return { error: "Invalid notification data" }
    logger.error("Failed to create notification", error)
    return { error: "Failed to create notification" }
  }
}

export async function getNotifications(userId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.id !== userId) return []

    const notifications = await prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 20
    })
    return notifications
  } catch (error) {
    logger.error("Failed to fetch notifications", error)
    return []
  }
}

export async function markAsRead(notificationId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return { error: "Unauthorized" }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    })

    if (!notification || notification.user_id !== session.user.id) {
      return { error: "Notification not found" }
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    })
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    logger.error("Failed to mark notification as read", error)
    return { error: "Failed to update notification" }
  }
}

export async function markAllAsRead(userId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.id !== userId) return { error: "Unauthorized" }

    await prisma.notification.updateMany({
      where: { user_id: userId, read: false },
      data: { read: true }
    })
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    logger.error("Failed to mark all notifications as read", error)
    return { error: "Failed to update notifications" }
  }
}
