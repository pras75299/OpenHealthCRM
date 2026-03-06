import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgId, assertOrgScope } from "@/lib/org";
import { getCurrentUserId } from "@/lib/auth";
import { prescriptionSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const orgId = await getOrgId();
    assertOrgScope(orgId);

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    const prescriptions = await prisma.prescription.findMany({
      where: {
        organizationId: orgId,
        ...(patientId ? { patientId } : {}),
      },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        prescriber: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(prescriptions);
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch prescriptions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const orgId = await getOrgId();
    assertOrgScope(orgId);
    const userId = await getCurrentUserId(orgId);

    const body = await request.json();
    const { patientId, encounterId, ...rxData } = body;

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    const parsed = prescriptionSchema.safeParse(rxData);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.findFirst({
      where: { id: patientId, organizationId: orgId },
    });
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const data = parsed.data;

    if (data.idempotencyKey) {
      const existing = await prisma.prescription.findUnique({
        where: { idempotencyKey: data.idempotencyKey },
      });
      if (existing) {
        return NextResponse.json(existing, { status: 200 });
      }
    }

    const prescription = await prisma.$transaction(async (tx) => {
      const rx = await tx.prescription.create({
        data: {
          organizationId: orgId,
          patientId,
          encounterId: encounterId || null,
          prescribedById: userId,
          medicationName: data.medicationName,
          dosage: data.dosage ?? null,
          frequency: data.frequency ?? null,
          duration: data.duration ?? null,
          instructions: data.instructions ?? null,
          idempotencyKey: data.idempotencyKey ?? null,
        },
      });

      await tx.auditLog.create({
        data: {
          organizationId: orgId,
          userId,
          action: "CREATE",
          entityType: "Prescription",
          entityId: rx.id,
          afterState: JSON.stringify(rx),
        },
      });

      return rx;
    });

    return NextResponse.json(prescription, { status: 201 });
  } catch (error) {
    console.error("Error creating prescription:", error);
    return NextResponse.json(
      { error: "Failed to create prescription" },
      { status: 500 }
    );
  }
}
