import { prisma } from "./prisma";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE";

export interface CreateAuditParams {
  organizationId: string;
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  beforeState?: string;
  afterState?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Append-only audit log. Every Create, Update, Delete must call this.
 */
export async function createAuditLog(params: CreateAuditParams) {
  return prisma.auditLog.create({
    data: {
      organizationId: params.organizationId,
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      beforeState: params.beforeState ?? null,
      afterState: params.afterState ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    },
  });
}
