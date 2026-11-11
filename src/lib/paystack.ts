import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Paystack hosted checkout: customers pay with M-Pesa or card on Paystack's
// page, then come back to /checkout/success. Without PAYSTACK_SECRET_KEY the
// store runs in demo mode and online orders are marked paid immediately.

const API = "https://api.paystack.co";

export const paystackEnabled = () => !!process.env.PAYSTACK_SECRET_KEY;

export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok || !json.status) throw new Error(json.message ?? `Paystack error ${res.status}`);
  return json.data as T;
}

export function initializePayment(opts: {
  email: string;
  amountCents: number;
  reference: string;
  orderId: string;
  phone: string;
}) {
  return call<{ authorization_url: string; reference: string }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: opts.email,
      amount: opts.amountCents, // Paystack wants the amount in cents
      currency: "KES",
      reference: opts.reference,
      channels: ["mobile_money", "card"], // M-Pesa + card
      callback_url: `${siteUrl()}/checkout/success?order=${opts.orderId}`,
      metadata: { orderId: opts.orderId, phone: opts.phone },
    }),
  });
}

export function verifyPayment(reference: string) {
  return call<{ status: string; amount: number; currency: string; reference: string; metadata?: { orderId?: string } }>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
}

// Paystack signs webhook bodies with HMAC-SHA512 of your secret key.
export function isValidWebhook(rawBody: string, signature: string | null) {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key || !signature) return false;
  const expected = Buffer.from(createHmac("sha512", key).update(rawBody).digest("hex"));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
