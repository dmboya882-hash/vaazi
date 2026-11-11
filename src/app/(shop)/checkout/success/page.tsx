import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { api, fetchMutation, fetchQuery, serverSecret } from "@/lib/convex";
import { paystackEnabled, verifyPayment } from "@/lib/paystack";
import { formatMoney, site } from "@/lib/site";
import { ClearCart } from "./clear-cart";

async function Confirmation({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  const sp = await searchParams;
  const orderId = typeof sp.order === "string" ? sp.order : null;
  let order = orderId ? await fetchQuery(api.orders.get, { orderId }) : null;
  if (!order) return <p className="text-muted">We couldn&apos;t find that order.</p>;

  // Confirm with Paystack directly, so the order is marked paid even if the
  // webhook hasn't arrived yet (or isn't set up in local development).
  if (order.status === "PENDING" && order.paymentRef && paystackEnabled()) {
    try {
      const tx = await verifyPayment(order.paymentRef);
      if (tx.status === "success" && tx.currency === "KES" && tx.amount >= order.totalCents) {
        await fetchMutation(api.orders.markPaid, { secret: serverSecret(), orderId: order._id, paymentRef: tx.reference });
        order = await fetchQuery(api.orders.get, { orderId: order._id });
      }
    } catch (e) {
      console.error("Paystack verify failed", e);
    }
  }
  if (!order) return null;

  const placed = order.status !== "PENDING" && order.status !== "CANCELLED";
  const cod = order.paymentMethod === "COD";
  const firstName = order.name.split(" ")[0];

  return (
    <>
      {placed && <ClearCart />}
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">Order #{order.number}</p>
      <h1 className="display mt-3 text-6xl">{placed ? `Asante, ${firstName}!` : "Waiting for payment"}</h1>
      <p className="mx-auto mt-4 max-w-md text-muted">
        {!placed
          ? "We haven't received your payment yet. If you completed the M-Pesa prompt, refresh this page in a moment."
          : cod
            ? `Your order is confirmed. Please have ${formatMoney(order.totalCents)} ready (M-Pesa or cash) when our rider calls ${order.phone}.`
            : `Payment received. We'll call ${order.phone} when your order is on the way.`}
      </p>

      <div className="mt-10 bg-soft p-6 text-left">
        <ul className="space-y-3 text-[15px]">
          {order.items.map((i, idx) => (
            <li key={idx} className="flex justify-between gap-3">
              <span>
                {i.productName}
                <span className="block text-sm text-muted">
                  Size {i.size} · Qty {i.quantity}
                </span>
              </span>
              <span>{formatMoney(i.priceCents * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 border-t border-line pt-4 text-[15px]">
          <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{order.shippingCents === 0 ? "Free" : formatMoney(order.shippingCents)}</dd></div>
          <div className="flex justify-between font-medium"><dt>Total</dt><dd>{formatMoney(order.totalCents)}</dd></div>
        </dl>
        <p className="mt-4 text-sm text-muted">
          Delivering to {order.address}, {order.town}, {order.county}
        </p>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="btn">
          Continue shopping
        </Link>
        <a
          href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hi! Question about order #${order.number}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline"
        >
          Questions? WhatsApp us
        </a>
      </div>
    </>
  );
}

export default function SuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-16 text-center sm:px-8">
      <Suspense fallback={<p className="text-muted">Confirming your order…</p>}>
        <Confirmation searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
