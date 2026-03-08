import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgId, assertOrgScope } from "@/lib/org";
import { getCurrentUserId } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const orgId = await getOrgId();
        assertOrgScope(orgId);
        const userId = await getCurrentUserId(orgId);

        const { id } = await params;
        const body = await request.json();
        const { consentType, isGranted, signedAt, documentUrl } = body;

        const existing = await prisma.consent.findFirst({
            where: { id, organizationId: orgId },
        });
        if (!existing) {
            return NextResponse.json({ error: "Consent not found" }, { status: 404 });
        }

        const updated = await prisma.consent.update({
            where: { id },
            data: {
                ...(consentType ? { consentType } : {}),
                ...(isGranted !== undefined ? { isGranted } : {}),
                ...(signedAt ? { signedAt: new Date(signedAt) } : {}),
                ...(documentUrl !== undefined ? { documentUrl } : {}),
            },
            include: { patient: { select: { firstName: true, lastName: true } } },
        });

        await createAuditLog({
            organizationId: orgId,
            userId,
            action: "UPDATE",
            entityType: "Consent",
            entityId: id,
            beforeState: JSON.stringify({ isGranted: existing.isGranted }),
            afterState: JSON.stringify({ isGranted: updated.isGranted }),
        });

        return NextResponse.json({
            id: updated.id,
            patientId: updated.patientId,
            patientName: `${updated.patient.firstName} ${updated.patient.lastName}`,
            consentType: updated.consentType,
            isGranted: updated.isGranted,
            signedAt: updated.signedAt?.toISOString() ?? null,
        });
    } catch (error) {
        console.error("Error updating consent:", error);
        return NextResponse.json({ error: "Failed to update consent" }, { status: 500 });
    }
}
