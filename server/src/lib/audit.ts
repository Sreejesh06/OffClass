import { prisma } from "./db.js";

/**
 * Inserts an immutable record into the AuditLog.
 * This does intentionally NOT suppress exceptions. If an audit log fails to write,
 * the entire parent transaction should fail to prevent un-audited actions from executing.
 */
export const logAction = async (
  actorId: string,
  action: string,
  targetType: string,
  targetId: string,
  metadata?: Record<string, unknown>
): Promise<void> => {
  await prisma.auditLog.create({
    data: {
      actorId,
      action,
      targetType,
      targetId,
      metadata: (metadata as any) || {},
    },
  });
};
