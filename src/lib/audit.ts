import { prisma } from "./prisma";

/**
 * Centrally log any critical user or system activity into the AuditTrail.
 * This is essential for enterprise security and multi-tenant observability.
 */
export async function logActivity({
  orgId,
  actorId,
  action,
  entityType,
  entityId,
  metadata,
  ipAddress,
}: {
  orgId?: string;
  actorId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: any;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        org_id: orgId,
        actor_id: actorId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata: metadata || {},
        ip_address: ipAddress,
      },
    });
  } catch (error) {
    // We don't want to crash the main operation if audit logging fails,
    // but we should definitely log the error to the console for infrastructure monitoring.
    console.error(`[AUDIT_FAILURE] Failed to log action ${action}:`, error);
  }
}
