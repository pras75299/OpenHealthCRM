import { NextResponse } from "next/server";
import { getPatientSessionFromRequest } from "@/lib/patient-auth";

export async function GET(request: Request) {
  try {
    const session = await getPatientSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      patient: {
        id: session.patient.id,
        firstName: session.patient.firstName,
        lastName: session.patient.lastName,
        email: session.patient.email,
        mrn: session.patient.mrn,
      },
      expiresAt: session.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Patient session lookup error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
