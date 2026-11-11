"use server";

import { z } from "zod";
import { api, errorMessage, fetchMutation, serverSecret } from "@/lib/convex";
import { initializePayment, paystackEnabled } from "@/lib/paystack";
import { COUNTIES, normalizeKenyanPhone } from "@/lib/site";
import type { Id } from "../../../../convex/_generated/dataModel";

const CheckoutSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  phone: z.string().transform((v, ctx) => {
    const phone = normalizeKenyanPhone(v);
    if (!phone) ctx.addIssue({ code: "custom", message: "Enter a valid Kenyan phone number, e.g. 0712 345 678" });
    return phone ?? "";
  }),
  email: z.email("Enter a valid email for your receipt"),
  county: z.enum(COUNTIES, "Choose your county"),
  town: z.string().trim().min(2, "Enter your town or area, e.g. Westlands"),
  address: z.string().trim().min(4, "Enter your street, building or a nearby landmark"),
  notes: z.string().trim().max(500).optional(),
  paymentMethod: z.enum(["PAYSTACK", "COD"]),
  items: z
    .array(z.object({ variantId: z.string().min(1), quantity: z.number().int().min(1).max(20) }))
    .min(1, "Your bag is empty"),
});

export type CheckoutInput = z.input<typeof CheckoutSchema>;
export type CheckoutResult = { ok: true; url: string } | { ok: false; error: string };

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = CheckoutSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { items, ...details } = parsed.data;

  let order: { orderId: Id<"orders">; number: number; totalCents: number };
  try {
    order = await fetchMutation(api.orders.create, {
      ...details,
      items: items.map((i) => ({ variantId: i.variantId as Id<"variants">, quantity: i.quantity })),
    });
  } catch (e) {
    return { ok: false, error: errorMessage(e) };
  }

  const success = `/checkout/success?order=${order.orderId}`;
  if (details.paymentMethod === "COD") return { ok: true, url: success };

  // Demo mode: no Paystack key configured, so treat the payment as done.
  if (!paystackEnabled()) {
    await fetchMutation(api.orders.markPaid, { secret: serverSecret(), orderId: order.orderId });
    return { ok: true, url: success };
  }

  try {
    const reference = `VAZ-${order.number}-${Date.now().toString(36)}`;
    const payment = await initializePayment({
      email: details.email,
      amountCents: order.totalCents,
      reference,
      orderId: order.orderId,
      phone: details.phone,
    });
    await fetchMutation(api.orders.setPaymentRef, { secret: serverSecret(), orderId: order.orderId, paymentRef: reference });
    return { ok: true, url: payment.authorization_url };
  } catch (e) {
    console.error("Paystack initialize failed", e);
    return { ok: false, error: "We couldn't start the payment. Please try again or choose Pay on Delivery." };
  }
}
