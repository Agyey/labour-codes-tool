"use server"

import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { revalidatePath } from 'next/cache'

export async function createNotification(data: {
  userId: string;
  orgId?: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'URGENT';
  link?: string;
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        user_id: data.userId,
        org_id: data.orgId,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link,
      }
    })
    return { success: true, notification }
  } catch (error) {
    logger.error("Failed to create notification", error)
    return { error: "Failed to create notification" }
  }
}

export async function getNotifications(userId: string) {
  try {
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
