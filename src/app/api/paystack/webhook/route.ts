import { NextResponse } from "next/server";
import { api, fetchMutation, fetchQuery, serverSecret } from "@/lib/convex";
import { isValidWebhook } from "@/lib/paystack";
import type { Id } from "../../../../../convex/_generated/dataModel";

// Paystack webhook. In the Paystack dashboard set the webhook URL to
// https://your-domain/api/paystack/webhook
export async function POST(req: Request) {
  const raw = await req.text();
  if (!isValidWebhook(raw, req.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(raw) as {
    event: string;
    data: { status: string; amount: number; currency: string; reference: string; metadata?: { orderId?: string } };
  };

  if (event.event === "charge.success" && event.data.status === "success") {
    const orderId = event.data.metadata?.orderId;
    const order = orderId ? await fetchQuery(api.orders.get, { orderId }) : null;
    // Only accept the payment if it covers the full order in KES.
    if (order && event.data.currency === "KES" && event.data.amount >= order.totalCents) {
      await fetchMutation(api.orders.markPaid, {
        secret: serverSecret(),
        orderId: order._id as Id<"orders">,
        paymentRef: event.data.reference,
      });
    }
  }

  return NextResponse.json({ received: true });
}
