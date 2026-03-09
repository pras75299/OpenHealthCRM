import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { getOrgId, assertOrgScope } from "@/lib/org";
import { createAuditLog } from "@/lib/audit";
import { sendSMS, sendEmail, sendWhatsApp } from "@/lib/communications";

export async function GET(request: NextRequest) {
  try {
    const orgId = await getOrgId();
    assertOrgScope(orgId);
    const userId = await getCurrentUserId(orgId);

    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get("patientId");
    const channel = searchParams.get("channel");
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    const communications = await prisma.communication.findMany({
      where: {
        organizationId: orgId,
        ...(patientId && { patientId }),
        ...(channel && { channel }),
        ...(type && { type }),
        ...(status && { status }),
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(communications);
  } catch (error) {
    console.error("GET /api/communications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch communications" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const orgId = await getOrgId();
    assertOrgScope(orgId);
    const userId = await getCurrentUserId(orgId);

    const body = await request.json();
    const { patientId, channel, type, content, scheduledFor } = body;

    // Validate input
    if (!patientId || !channel || !type || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!["sms", "email", "whatsapp"].includes(channel)) {
      return NextResponse.json(
        { error: "Channel must be sms, email, or whatsapp" },
        { status: 400 },
      );
    }

    // Verify patient exists in org
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient || patient.organizationId !== orgId) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Create communication record
    const communication = await prisma.communication.create({
      data: {
        organizationId: orgId,
        patientId,
        channel,
        type,
        content,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        status: scheduledFor ? "scheduled" : "pending",
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Send immediately if not scheduled
    if (!scheduledFor && channel !== "in_app") {
      try {
        if (channel === "sms" && patient.phone) {
          await sendSMS(patient.phone, content);
        } else if (channel === "email" && patient.email) {
          await sendEmail(
            patient.email,
            type === "reminder" ? "Appointment Reminder" : type,
            content,
          );
        } else if (channel === "whatsapp" && patient.phone) {
          await sendWhatsApp(patient.phone, content);
        }

        // Update status to sent
        await prisma.communication.update({
          where: { id: communication.id },
          data: {
            status: "sent",
            sentAt: new Date(),
          },
        });
      } catch (sendError) {
        console.error("Failed to send communication:", sendError);
        await prisma.communication.update({
          where: { id: communication.id },
          data: { status: "failed" },
        });
      }
    }

    // Audit log
    await createAuditLog({
      userId,
      organizationId: orgId,
      action: "CREATE",
      entityType: "Communication",
      entityId: communication.id,
      afterState: JSON.stringify({ channel, type, patientId }),
    });

    return NextResponse.json(communication, { status: 201 });
  } catch (error) {
    console.error("POST /api/communications error:", error);
    return NextResponse.json(
      { error: "Failed to create communication" },
      { status: 500 },
    );
  }
}
