import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgId, assertOrgScope } from "@/lib/org";
import { vitalSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const orgId = await getOrgId();
    assertOrgScope(orgId);

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const encounterId = searchParams.get("encounterId");

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    const vitals = await prisma.vital.findMany({
      where: {
        patientId,
        ...(encounterId ? { encounterId } : {}),
      },
      orderBy: { recordedAt: "desc" },
    });

    return NextResponse.json(vitals);
  } catch (error) {
    console.error("Error fetching vitals:", error);
    return NextResponse.json(
      { error: "Failed to fetch vitals" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const orgId = await getOrgId();
    assertOrgScope(orgId);

    const body = await request.json();
    const { patientId, encounterId, ...vitalData } = body;

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    const parsed = vitalSchema.safeParse(vitalData);
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
    let bmi = data.bmi;
    if (data.weightKg && data.heightCm && !bmi) {
      const heightM = data.heightCm / 100;
      bmi = Math.round((data.weightKg / (heightM * heightM)) * 10) / 10;
    }

    const vital = await prisma.vital.create({
      data: {
        patientId,
        encounterId: encounterId || null,
        weightKg: data.weightKg ?? null,
        heightCm: data.heightCm ?? null,
        bloodPressureSystolic: data.bloodPressureSystolic ?? null,
        bloodPressureDiastolic: data.bloodPressureDiastolic ?? null,
        heartRate: data.heartRate ?? null,
        bmi: bmi ?? null,
        spO2: data.spO2 ?? null,
        temperature: data.temperature ?? null,
      },
    });

    return NextResponse.json(vital, { status: 201 });
  } catch (error) {
    console.error("Error creating vital:", error);
    return NextResponse.json(
      { error: "Failed to create vital" },
      { status: 500 }
    );
  }
}
