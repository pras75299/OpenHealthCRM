import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgId, assertOrgScope } from "@/lib/org";
import { getCurrentUserId } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { patientCreateSchema, patientUpdateSchema } from "@/lib/validations";

function mapPatientToResponse(p: {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  gender: string | null;
  email: string | null;
  phone: string | null;
  phoneSecondary: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  bloodType: string | null;
  allergies: string | null;
  primaryCareProvider: string | null;
  status: string;
  mrn: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    dob: p.dateOfBirth?.toISOString().split("T")[0] ?? "",
    gender: p.gender ?? "Unknown",
    email: p.email ?? "",
    phone: p.phone ?? "",
    phoneSecondary: p.phoneSecondary ?? "",
    address: p.address ?? "",
    city: p.city ?? "",
    state: p.state ?? "",
    zip: p.zip ?? "",
    country: p.country ?? "",
    bloodType: p.bloodType ?? "Unknown",
    allergies: p.allergies ?? "None",
    primaryCareProvider: p.primaryCareProvider ?? "Unassigned",
    mrn: p.mrn ?? `PT-${p.id.substring(0, 5).toUpperCase()}`,
    status: p.status ?? "Active",
    lastVisit: p.updatedAt.toISOString().split("T")[0],
    regDate: p.createdAt.toISOString().split("T")[0],
  };
}

export async function GET() {
  try {
    const orgId = await getOrgId();
    assertOrgScope(orgId);

    const patients = await prisma.patient.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(patients.map(mapPatientToResponse));
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Failed to fetch patients" },
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
    const parsed = patientCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const newPatient = await prisma.$transaction(async (tx: any) => {
      const patient = await tx.patient.create({
        data: {
          organizationId: orgId,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          gender: data.gender ?? null,
          email: data.email || null,
          phone: data.phone || null,
          phoneSecondary: data.phoneSecondary || null,
          address: data.address || null,
          city: data.city || null,
          state: data.state || null,
          zip: data.zip || null,
          country: data.country || null,
          bloodType: data.bloodType || null,
          allergies: data.allergies || null,
          primaryCareProvider: data.primaryCareProvider || null,
          familyHistory: data.familyHistory || null,
        },
      });

      if (data.emergencyContactName || data.emergencyContactPhone) {
        await tx.emergencyContact.create({
          data: {
            patientId: patient.id,
            name: data.emergencyContactName ?? "Unknown",
            phone: data.emergencyContactPhone ?? "",
            relationship: data.emergencyContactRelationship ?? null,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          organizationId: orgId,
          userId,
          action: "CREATE",
          entityType: "Patient",
          entityId: patient.id,
          afterState: JSON.stringify(patient),
        },
      });

      return patient;
    });

    return NextResponse.json(mapPatientToResponse(newPatient), { status: 201 });
  } catch (error) {
    console.error("Error creating patient:", error);
    return NextResponse.json(
      { error: "Failed to create patient" },
      { status: 500 }
    );
  }
}
