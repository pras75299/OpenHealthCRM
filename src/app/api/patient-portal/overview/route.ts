import { NextResponse } from "next/server";
import { getPatientSessionFromRequest } from "@/lib/patient-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getPatientSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patientId = session.patient.id;

    const [appointments, labResults] = await Promise.all([
      prisma.appointment.findMany({
        where: { patientId },
        include: {
          provider: { select: { name: true } },
        },
        orderBy: { startTime: "asc" },
        take: 3,
      }),
      prisma.labResult.findMany({
        where: { patientId },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);

    return NextResponse.json({
      patient: {
        id: session.patient.id,
        firstName: session.patient.firstName,
        lastName: session.patient.lastName,
        email: session.patient.email,
        mrn: session.patient.mrn,
      },
      appointments: appointments.map((appointment: {
        id: string;
        appointmentType: string | null;
        notes: string | null;
        status: string;
        startTime: Date;
        provider: { name: string | null } | null;
      }) => ({
        id: appointment.id,
        type: appointment.appointmentType ?? appointment.notes ?? "General Checkup",
        provider: appointment.provider?.name ?? "Unknown Provider",
        status: appointment.status,
        startTime: appointment.startTime.toISOString(),
      })),
      labResults: labResults.map((lab: {
        id: string;
        testName: string;
        resultValue: string | null;
        unit: string | null;
        status: string | null;
      }) => ({
        id: lab.id,
        testName: lab.testName,
        resultValue: lab.resultValue,
        unit: lab.unit,
        status: lab.status,
      })),
    });
  } catch (error) {
    console.error("Patient portal overview error:", error);
    return NextResponse.json({ error: "Failed to fetch patient portal data" }, { status: 500 });
  }
}
