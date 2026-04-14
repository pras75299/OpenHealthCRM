import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgId, assertOrgScope } from "@/lib/org";
import { getCurrentUserId, hasPermission } from "@/lib/auth";
import { patientUpdateSchema } from "@/lib/validations";

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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const orgId = await getOrgId();
    assertOrgScope(orgId);

    const patient = await prisma.patient.findFirst({
      where: { id, organizationId: orgId },
      include: { emergencyContact: true },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...mapPatientToResponse(patient),
      emergencyContact: patient.emergencyContact
        ? {
            name: patient.emergencyContact.name,
            phone: patient.emergencyContact.phone,
            relationship: patient.emergencyContact.relationship,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching patient:", error);
    return NextResponse.json(
      { error: "Failed to fetch patient" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const orgId = await getOrgId();
    assertOrgScope(orgId);
    const userId = await getCurrentUserId(orgId);
    const canWritePatients = await hasPermission(
      userId,
      orgId,
      "patients:write",
      "patients",
    );

    if (!canWritePatients) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await prisma.patient.findFirst({
      where: { id, organizationId: orgId },
      include: { emergencyContact: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = patientUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const updated = await prisma.$transaction(async (tx: any) => {
      const patient = await tx.patient.update({
        where: { id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth
            ? new Date(data.dateOfBirth)
            : existing.dateOfBirth,
          gender: data.gender ?? existing.gender,
          email: data.email ?? existing.email,
          phone: data.phone ?? existing.phone,
          phoneSecondary: data.phoneSecondary ?? existing.phoneSecondary,
          address: data.address ?? existing.address,
          city: data.city ?? existing.city,
          state: data.state ?? existing.state,
          zip: data.zip ?? existing.zip,
          country: data.country ?? existing.country,
          bloodType: data.bloodType ?? existing.bloodType,
          allergies: data.allergies ?? existing.allergies,
          primaryCareProvider:
            data.primaryCareProvider ?? existing.primaryCareProvider,
          familyHistory: data.familyHistory ?? existing.familyHistory,
          status: data.status ? (data.status as string) : existing.status,
        },
      });

      if (
        data.emergencyContactName !== undefined ||
        data.emergencyContactPhone !== undefined
      ) {
        if (existing.emergencyContact) {
          await tx.emergencyContact.update({
            where: { patientId: id },
            data: {
              name: data.emergencyContactName ?? existing.emergencyContact.name,
              phone:
                data.emergencyContactPhone ?? existing.emergencyContact.phone,
              relationship:
                data.emergencyContactRelationship ??
                existing.emergencyContact.relationship,
            },
          });
        } else if (data.emergencyContactName || data.emergencyContactPhone) {
          await tx.emergencyContact.create({
            data: {
              patientId: id,
              name: data.emergencyContactName ?? "Unknown",
              phone: data.emergencyContactPhone ?? "",
              relationship: data.emergencyContactRelationship ?? null,
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          organizationId: orgId,
          userId,
          action: "UPDATE",
          entityType: "Patient",
          entityId: id,
          beforeState: JSON.stringify(existing),
          afterState: JSON.stringify(patient),
        },
      });

      return patient;
    });

    const withContact = await prisma.patient.findUnique({
      where: { id: updated.id },
      include: { emergencyContact: true },
    });

    return NextResponse.json(
      withContact
        ? {
            ...mapPatientToResponse(withContact),
            emergencyContact: withContact.emergencyContact
              ? {
                  name: withContact.emergencyContact.name,
                  phone: withContact.emergencyContact.phone,
                  relationship: withContact.emergencyContact.relationship,
                }
              : null,
          }
        : mapPatientToResponse(updated),
    );
  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json(
      { error: "Failed to update patient" },
      { status: 500 },
    );
  }
}
