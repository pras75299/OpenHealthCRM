import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPasswordHash } from "@/lib/password";
import { createPatientSession } from "@/lib/patient-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const mrn = typeof body.mrn === "string" ? body.mrn.trim() : "";

    if (!email || !password || !mrn) {
      return NextResponse.json(
        { error: "Email, password, and MRN are required" },
        { status: 400 },
      );
    }

    // Find patient by email and MRN
    const patient = await prisma.patient.findFirst({
      where: { email, mrn },
      include: { organization: true },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    if (!verifyPasswordHash(patient.passwordHash, password)) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const { rawToken, expiresAt } = await createPatientSession({
      patientId: patient.id,
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    const response = NextResponse.json(
      {
        success: true,
        patient: {
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          mrn: patient.mrn,
          organizationId: patient.organizationId,
        },
      },
      { status: 200 },
    );

    response.cookies.set("patient_session", rawToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: expiresAt,
    });

    return response;
  } catch (error) {
    console.error("Patient auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}
