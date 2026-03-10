import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrgId, assertOrgScope } from "@/lib/org";
import { getCurrentUserId } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const orgId = await getOrgId();
    assertOrgScope(orgId);

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    const encounters = await prisma.encounter.findMany({
      where: {
        organizationId: orgId,
        ...(patientId ? { patientId } : {}),
      },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        appointment: true,
        notes: true,
      },
      orderBy: { startTime: "desc" },
    });

    return NextResponse.json(encounters);
  } catch (error) {
    console.error("Error fetching encounters:", error);
    return NextResponse.json(
      { error: "Failed to fetch encounters" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const orgId = await getOrgId();
    assertOrgScope(orgId);
    const userId = await getCurrentUserId(orgId);

    const body = await request.json();
    const { patientId, appointmentId, encounterType } = body;

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 },
      );
    }

    const patient = await prisma.patient.findFirst({
      where: { id: patientId, organizationId: orgId },
    });
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const encounter = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const enc = await tx.encounter.create({
          data: {
            organizationId: orgId,
            patientId,
            appointmentId: appointmentId || null,
            startTime: new Date(),
            status: "in_progress",
            encounterType: encounterType || "office_visit",
          },
        });

        await tx.auditLog.create({
          data: {
            organizationId: orgId,
            userId,
            action: "CREATE",
            entityType: "Encounter",
            entityId: enc.id,
            afterState: JSON.stringify(enc),
          },
        });

        return enc;
      },
    );

    return NextResponse.json(encounter, { status: 201 });
  } catch (error) {
    console.error("Error creating encounter:", error);
    return NextResponse.json(
      { error: "Failed to create encounter" },
      { status: 500 },
    );
  }
}
