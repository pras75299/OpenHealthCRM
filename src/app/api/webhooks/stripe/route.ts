import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import stripe from "@/lib/stripe";
import { logServerError } from "@/lib/safe-logger";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") || "";

    if (!webhookSecret) {
      logServerError("STRIPE_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 },
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logServerError("Webhook signature verification failed", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle payment intent events
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;

      case "payment_intent.payment_failed":
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failedIntent);
        break;

      case "charge.refunded":
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logServerError("Webhook error", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
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

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
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

async function handleRefund(charge: Stripe.Charge) {
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
