import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { api, fetchQuery, serverSecret } from "@/lib/convex";
import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/orders";
import { formatMoney } from "@/lib/site";
import { StatusBadge, formatDate } from "@/components/admin-ui";
import { updateOrderStatus } from "../../actions";

export default async function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const order = await fetchQuery(api.admin.order, { secret: serverSecret(), id });
  if (!order) notFound();

  const waPhone = order.phone.replace(/^\+/, "");
  const waText = encodeURIComponent(`Hi ${order.name.split(" ")[0]}, this is Vaazi about your order #${order.number}.`);

  return (
    <div className="max-w-4xl">
      <Link href="/admin/orders" className="text-sm text-muted">← Orders</Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-medium">Order #{order.number}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm text-muted">
        Placed {formatDate(order._creationTime)}
        {order.paidAt && ` · Paid ${formatDate(order.paidAt)}`}
        {" · "}
        {order.paymentMethod === "COD" ? "Pay on delivery" : `M-Pesa/card${order.paymentRef ? ` (ref ${order.paymentRef})` : ""}`}
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_300px]">
        <section className="rounded-xl border border-line bg-card p-5">
          <h2 className="font-medium">Items</h2>
          <ul className="mt-3 divide-y divide-line text-sm">
            {order.items.map((i, idx) => (
              <li key={idx} className="flex justify-between gap-3 py-3">
                <span>
                  {i.productId ? (
                    <Link href={`/admin/products/${i.productId}`} className="underline-offset-4 hover:underline">
                      {i.productName}
                    </Link>
                  ) : (
                    i.productName
                  )}
                  <span className="block text-xs text-muted">
                    Size {i.size} · {i.quantity} × {formatMoney(i.priceCents)}
                  </span>
                </span>
                <span>{formatMoney(i.priceCents * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatMoney(order.subtotalCents)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{formatMoney(order.shippingCents)}</dd></div>
            <div className="flex justify-between font-medium"><dt>Total</dt><dd>{formatMoney(order.totalCents)}</dd></div>
          </dl>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border border-line bg-card p-5 text-sm">
            <h2 className="font-medium">Customer</h2>
            <p className="mt-2">{order.name}</p>
            <a href={`tel:${order.phone}`} className="block text-muted underline">{order.phone}</a>
            <a href={`mailto:${order.email}`} className="block text-muted underline">{order.email}</a>
            <a
              href={`https://wa.me/${waPhone}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block rounded-full bg-[#25D366] px-4 py-2 text-xs font-medium text-white"
            >
              WhatsApp customer
            </a>
            <h3 className="mt-5 font-medium">Deliver to</h3>
            <p className="mt-1 text-muted">
              {order.address}<br />
              {order.town}, {order.county}
            </p>
            {order.notes && (
              <>
                <h3 className="mt-4 font-medium">Rider notes</h3>
                <p className="mt-1 text-muted">{order.notes}</p>
              </>
            )}
          </section>

          <form action={updateOrderStatus} className="rounded-xl border border-line bg-card p-5">
            <input type="hidden" name="id" value={order._id} />
            <label htmlFor="status" className="label">Update status</label>
            <select id="status" name="status" defaultValue={order.status} className="input">
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
            <p className="mt-2 text-xs text-muted">Cancelling puts the items back in stock.</p>
            <button className="btn mt-3 w-full">Save</button>
          </form>
        </div>
      </div>
    </div>
  );
}
