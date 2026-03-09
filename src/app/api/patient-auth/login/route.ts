import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, mrn } = body;

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

    // For demo purposes, accept any non-empty password
    // In production, hash and compare passwords properly
    if (!password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Create a session token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token in database (you might want a separate table for this)
    // For now, we'll just return the token
    const sessionData = {
      token,
      patientId: patient.id,
      organizationId: patient.organizationId,
      expiresAt: expiresAt.toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        token,
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
  } catch (error) {
    console.error("Patient auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}
