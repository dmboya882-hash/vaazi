"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useCart } from "@/components/cart-provider";
import { ProductImage } from "@/components/product-image";
import { COUNTIES, deliveryFor, formatMoney } from "@/lib/site";
import { placeOrder } from "./actions";

type Method = "PAYSTACK" | "COD";

export default function CheckoutPage() {
  const { items, ready, subtotalCents } = useCart();
  const [county, setCounty] = useState("Nairobi");
  const [method, setMethod] = useState<Method>("PAYSTACK");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const delivery = deliveryFor(subtotalCents, county);
  const total = subtotalCents + delivery.cents;

  if (!ready) return <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-8">Loading…</div>;
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 pt-20 text-center sm:px-8">
        <h1 className="display text-5xl">Your bag is empty</h1>
        <Link href="/shop" className="btn mt-8">
          Continue shopping
        </Link>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "");
    setError(null);
    startTransition(async () => {
      const result = await placeOrder({
        name: get("name"),
        phone: get("phone"),
        email: get("email"),
        county: county as (typeof COUNTIES)[number],
        town: get("town"),
        address: get("address"),
        notes: get("notes") || undefined,
        paymentMethod: method,
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      });
      if (result.ok) window.location.assign(result.url);
      else {
        setError(result.error);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-8">
      <h1 className="display text-5xl">Checkout</h1>
      {error && (
        <p className="mt-6 border border-sale/30 bg-sale/5 p-4 text-sm text-sale" role="alert">
          {error}
        </p>
      )}
      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_380px]">
        <form id="checkout" onSubmit={onSubmit} className="space-y-10">
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-4 text-xl font-medium">1. Your details</legend>
            <div className="sm:col-span-2">
              <label htmlFor="name" className="label">Full name</label>
              <input id="name" name="name" autoComplete="name" required className="input" />
            </div>
            <div>
              <label htmlFor="phone" className="label">Phone (M-Pesa number)</label>
              <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0712 345 678" required className="input" />
            </div>
            <div>
              <label htmlFor="email" className="label">Email (for your receipt)</label>
              <input id="email" name="email" type="email" autoComplete="email" required className="input" />
            </div>
          </fieldset>

          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-4 text-xl font-medium">2. Delivery</legend>
            <div>
              <label htmlFor="county" className="label">County</label>
              <select id="county" value={county} onChange={(e) => setCounty(e.target.value)} className="input">
                {COUNTIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="town" className="label">Town / area</label>
              <input id="town" name="town" placeholder="e.g. Westlands, Kilimani, Nyali" required className="input" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="address" className="label">Street, building &amp; house no. or landmark</label>
              <input id="address" name="address" placeholder="e.g. Ring Rd, Apex Apartments, Hse B4, next to Sarit Centre" required className="input" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="notes" className="label">Notes for the rider (optional)</label>
              <textarea id="notes" name="notes" rows={2} placeholder="Gate code, best time to call…" className="input" />
            </div>
            <p className="rounded-lg bg-soft p-3 text-sm sm:col-span-2">
              Delivery to <strong>{county}</strong>: {delivery.cents === 0 ? "Free" : formatMoney(delivery.cents)} · {delivery.eta}
            </p>
          </fieldset>

          <fieldset>
            <legend className="mb-4 text-xl font-medium">3. Payment</legend>
            <div className="space-y-3">
              {[
                { id: "PAYSTACK" as const, title: "M-Pesa or card", sub: "Pay now securely via Paystack. You'll get an M-Pesa prompt or can pay with Visa/Mastercard." },
                { id: "COD" as const, title: "Pay on delivery", sub: "Pay the rider by M-Pesa or cash when your order arrives." },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer gap-4 border p-4 transition ${method === m.id ? "border-foreground ring-1 ring-foreground" : "border-line hover:border-foreground/50"}`}
                >
                  <input type="radio" name="method" checked={method === m.id} onChange={() => setMethod(m.id)} className="mt-1 accent-black" />
                  <span>
                    <span className="flex items-center gap-2 font-medium">
                      {m.title}
                      {m.id === "PAYSTACK" && <span className="rounded bg-[#00a651] px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">M-Pesa</span>}
                    </span>
                    <span className="mt-1 block text-sm text-muted">{m.sub}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <button type="submit" disabled={pending} className="btn w-full py-5 text-base lg:hidden">
            {pending ? "Placing order…" : method === "COD" ? `Place order · ${formatMoney(total)}` : `Pay ${formatMoney(total)}`}
          </button>
        </form>

        <aside className="h-fit lg:sticky lg:top-24">
          <h2 className="text-xl font-medium">In your bag</h2>
          <ul className="mt-4 space-y-4">
            {items.map((i) => (
              <li key={i.variantId} className="flex gap-3 text-sm">
                <div className="w-16 shrink-0 bg-soft">
                  <ProductImage imageUrl={i.imageUrl} tint={i.tint} category={i.category} name={i.name} />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{i.name}</div>
                  <div className="text-muted">
                    Size {i.size} · Qty {i.quantity}
                  </div>
                </div>
                <div>{formatMoney(i.priceCents * i.quantity)}</div>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-2 border-t border-line pt-4 text-[15px]">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatMoney(subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd>{delivery.cents === 0 ? "Free" : formatMoney(delivery.cents)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-lg font-medium">
              <dt>Total</dt>
              <dd>{formatMoney(total)}</dd>
            </div>
          </dl>
          <button type="submit" form="checkout" disabled={pending} className="btn mt-6 hidden w-full py-5 text-base lg:flex">
            {pending ? "Placing order…" : method === "COD" ? `Place order · ${formatMoney(total)}` : `Pay ${formatMoney(total)}`}
          </button>
          <p className="mt-3 text-center text-xs text-muted">Secure payments by Paystack</p>
        </aside>
      </div>
    </div>
  );
}
