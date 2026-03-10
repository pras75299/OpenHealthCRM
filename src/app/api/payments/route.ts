import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgId, assertOrgScope } from "@/lib/org";
import { getCurrentUserId } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import stripe from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const orgId = await getOrgId();
    assertOrgScope(orgId);
    const userId = await getCurrentUserId(orgId);

    const body = await request.json();
    const { invoiceId, amount, currency = "usd", description } = body;

    if (!invoiceId || !amount) {
      return NextResponse.json(
        { error: "invoiceId and amount are required" },
        { status: 400 },
      );
    }

    // Verify invoice exists and belongs to org
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, organizationId: orgId },
      include: { patient: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      description: description || `Invoice ${invoice.invoiceNumber}`,
      metadata: {
        invoiceId,
        organizationId: orgId,
        patientId: invoice.patientId,
      },
    });

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount,
        paymentMethod: "card",
        status: "pending",
        stripePaymentId: paymentIntent.id,
      },
    });

    await createAuditLog({
      organizationId: orgId,
      userId,
      action: "CREATE",
      entityType: "Payment",
      entityId: payment.id,
      afterState: JSON.stringify({
        invoiceId,
        amount,
        status: "pending",
        stripePaymentIntentId: paymentIntent.id,
      }),
    });

    return NextResponse.json(
      {
        id: payment.id,
        clientSecret: paymentIntent.client_secret,
        amount,
        currency,
        status: payment.status,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const orgId = await getOrgId();
    assertOrgScope(orgId);

    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get("invoiceId");

    const payments = await prisma.payment.findMany({
      where: {
        invoice: { organizationId: orgId },
        ...(invoiceId ? { invoiceId } : {}),
      },
      include: {
        invoice: {
          select: {
            invoiceNumber: true,
            currency: true,
            patient: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      payments.map((p: any) => ({
        id: p.id,
        invoiceId: p.invoiceId,
        invoiceNumber: p.invoice.invoiceNumber,
        patientName: `${p.invoice.patient.firstName} ${p.invoice.patient.lastName}`,
        amount: p.amount,
        currency: p.invoice.currency,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
      })),
    );
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 },
    );
  }
}
