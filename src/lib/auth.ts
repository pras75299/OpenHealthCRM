import { prisma } from "./prisma";

export type RoleName =
  | "Super Admin"
  | "Doctor"
  | "Nurse"
  | "Receptionist"
  | "Patient"
  | "Biller"
  | "Pharmacist";

/**
 * Get current user ID. In production: from session/JWT.
 * For dev: returns first user in org.
 */
export async function getCurrentUserId(orgId: string): Promise<string> {
  const user = await prisma.user.findFirst({
    where: { organizationId: orgId },
  });
  if (!user) {
    throw new Error("No user found for organization.");
  }
  return user.id;
}

/**
 * Check if user has required permission.
 * In production: integrate with RolePermission.
 */
export async function hasPermission(
  userId: string,
  orgId: string,
  action: string,
  resource?: string,
): Promise<boolean> {
  const userRole = await prisma.userRole.findFirst({
    where: { userId },
    include: {
      role: {
        include: { permissions: true },
      },
    },
  });
  if (!userRole) return false;
  const permissions = userRole.role.permissions;
  const hasAction = permissions.some(
    (p: any) =>
      p.action === action && (resource ? p.resource === resource : true),
  );
  return hasAction;
}
