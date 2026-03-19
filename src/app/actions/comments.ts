/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logActivity } from "@/lib/audit";

export async function addComment(provisionId: string, body: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const comment = await prisma.comment.create({
      data: {
        provision_id: provisionId,
        user_id: session.user.id,
        body
      },
      include: {
        user: true
      }
    });

    const formattedComment = {
      id: comment.id,
      body: comment.body,
      parentId: comment.parent_id,
      createdAt: comment.created_at.toISOString(),
      user: {
        id: comment.user?.id || "unknown",
        name: comment.user?.name || "Deleted User",
        email: comment.user?.email,
        image: comment.user?.image,
        role: comment.user?.role || "viewer",
      },
    };
    
    await logActivity({
      orgId: session?.user?.orgId || "system",
      actorId: session?.user?.id || "system",
      action: "ADD_COMMENT",
      entityType: "Provision",
      entityId: provisionId,
      metadata: { comment_id: comment.id }
    });

    return { success: true, comment: formattedComment };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Failed to add comment" };
  }
}
