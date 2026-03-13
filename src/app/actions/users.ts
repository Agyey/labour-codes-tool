"use server"

import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    return users
  } catch (error) {
    logger.error("Failed to fetch users", error);
    return []
  }
}
