import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgId, assertOrgScope } from "@/lib/org";

export async function GET(request: Request) {
  try {
    const orgId = await getOrgId();
    assertOrgScope(orgId);

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    const comms = await prisma.communication.findMany({
      where: {
        organizationId: orgId,
        ...(patientId ? { patientId } : {}),
      },
      include: {
        patient: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(comms);
  } catch (error) {
    console.error("Error fetching communications:", error);
    return NextResponse.json(
      { error: "Failed to fetch communications" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const orgId = await getOrgId();
    assertOrgScope(orgId);

    const body = await request.json();
    const { patientId, channel, type, content, scheduledFor } = body;

    if (!patientId || !channel || !content) {
      return NextResponse.json(
        { error: "Patient ID, channel, and content are required" },
        { status: 400 }
      );
    }

    if (!["sms", "email", "whatsapp"].includes(channel)) {
      return NextResponse.json(
        { error: "Channel must be sms, email, or whatsapp" },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.findFirst({
      where: { id: patientId, organizationId: orgId },
    });
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const comm = await prisma.communication.create({
      data: {
        organizationId: orgId,
        patientId,
        channel,
        type: type || "notification",
        status: scheduledFor ? "pending" : "sent",
        content,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        sentAt: scheduledFor ? null : new Date(),
      },
    });

    return NextResponse.json(comm, { status: 201 });
  } catch (error) {
    console.error("Error creating communication:", error);
    return NextResponse.json(
      { error: "Failed to create communication" },
      { status: 500 }
    );
  }
}
