import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import stripe from "@/lib/stripe";

interface StripeEvent {
  type: string;
  data: {
    object: any;
  };
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") || "";

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 },
      );
    }

    let event: StripeEvent;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle payment intent events
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        await handlePaymentSuccess(paymentIntent);
        break;

      case "payment_intent.payment_failed":
        const failedIntent = event.data.object;
        await handlePaymentFailure(failedIntent);
        break;

      case "charge.refunded":
        const charge = event.data.object;
        await handleRefund(charge);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

async function handlePaymentSuccess(paymentIntent: any) {
  const stripePaymentId = paymentIntent.id;

  const payment = await prisma.payment.findFirst({
    where: { stripePaymentId },
  });

  if (!payment) {
    console.warn(`Payment not found for intent: ${stripePaymentId}`);
    return;
  }

  // Update payment status
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "completed" },
  });

  // Update invoice status
  await prisma.invoice.update({
    where: { id: payment.invoiceId },
    data: { status: "paid" },
  });

  console.log(
    `Payment ${payment.id} completed for invoice ${payment.invoiceId}`,
  );
}

async function handlePaymentFailure(paymentIntent: any) {
  const stripePaymentId = paymentIntent.id;

  const payment = await prisma.payment.findFirst({
    where: { stripePaymentId },
  });

  if (!payment) {
    console.warn(`Payment not found for intent: ${stripePaymentId}`);
    return;
  }

  // Update payment status
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "failed" },
  });

  console.log(`Payment ${payment.id} failed`);
}

async function handleRefund(charge: any) {
  if (!charge.payment_intent) {
    console.warn("Refund charge has no payment intent");
    return;
  }

  const payment = await prisma.payment.findFirst({
    where: { stripePaymentId: charge.payment_intent as string },
  });

  if (!payment) {
    console.warn(
      `Payment not found for refunded intent: ${charge.payment_intent}`,
    );
    return;
  }

  // Update payment status
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "refunded" },
  });

  console.log(`Payment ${payment.id} refunded`);
}
