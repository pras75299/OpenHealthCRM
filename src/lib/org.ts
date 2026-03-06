import { prisma } from "./prisma";

/**
 * Get the current organization ID for multi-tenant scoping.
 * In production: resolve from authenticated user/session.
 * For now: returns first organization (dev seed).
 */
export async function getOrgId(): Promise<string> {
  const org = await prisma.organization.findFirst();
  if (!org) {
    throw new Error("No organization found. Please seed the database.");
  }
  return org.id;
}

/**
 * Assert org scoping - NEVER bypass in production.
 */
export function assertOrgScope(orgId: string | null | undefined): asserts orgId is string {
  if (!orgId || typeof orgId !== "string") {
    throw new Error("Organization scope (orgId) is required for this operation.");
  }
}
