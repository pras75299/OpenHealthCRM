import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { getOrgId, assertOrgScope } from "@/lib/org";
import { createAuditLog } from "@/lib/audit";
import {
  sendSMS,
  sendEmail,
  sendWhatsApp,
  renderAppointmentReminder,
} from "@/lib/communications";

/**
 * CRON endpoint: Processes scheduled communications
 * Call this periodically (e.g., every minute) to send scheduled messages
 * Should be protected by a CRON secret in production
 */
export async function POST(request: NextRequest) {
  try {
    // Verify CRON secret
    const secret = request.headers.get("x-cron-secret");
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all scheduled communications that are due
    const now = new Date();
    const scheduledComms = await prisma.communication.findMany({
      where: {
        status: "scheduled",
        scheduledFor: {
          lte: now,
        },
      },
      include: {
        patient: true,
      },
      take: 100, // Process up to 100 at a time
    });

    let sent = 0;
    let failed = 0;

    for (const comm of scheduledComms) {
      try {
        const patient = comm.patient as any;

        // Send based on channel
        if (comm.channel === "sms" && patient.phone) {
          await sendSMS(patient.phone, comm.content);
        } else if (comm.channel === "email" && patient.email) {
          await sendEmail(patient.email, comm.type, comm.content);
        } else if (comm.channel === "whatsapp" && patient.phone) {
          await sendWhatsApp(patient.phone, comm.content);
        }

        // Mark as sent
        await prisma.communication.update({
          where: { id: comm.id },
          data: {
            status: "sent",
            sentAt: now,
          },
        });

        sent++;
      } catch (error) {
        console.error(`Failed to send communication ${comm.id}:`, error);

        // Mark as failed
        await prisma.communication.update({
          where: { id: comm.id },
          data: { status: "failed" },
        });

        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: scheduledComms.length,
      sent,
      failed,
      message: `Processed ${scheduledComms.length} scheduled communications`,
    });
  } catch (error) {
    console.error("CRON error:", error);
    return NextResponse.json(
      { error: "Failed to process scheduled communications" },
      { status: 500 },
    );
  }
}
