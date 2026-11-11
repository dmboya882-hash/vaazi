import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { api, fetchQuery, serverSecret } from "@/lib/convex";
import { ORDER_STATUSES, STATUS_LABELS, type OrderStatus } from "@/lib/orders";
import { formatMoney } from "@/lib/site";
import { StatusBadge, formatDate } from "@/components/admin-ui";

export default async function AdminOrders({ searchParams }: PageProps<"/admin/orders">) {
  await requireAdmin();
  const sp = await searchParams;
  const status =
    typeof sp.status === "string" && (ORDER_STATUSES as readonly string[]).includes(sp.status)
      ? (sp.status as OrderStatus)
      : undefined;
  const orders = await fetchQuery(api.admin.orders, { secret: serverSecret(), status });

  const tab = (s?: string) =>
    `rounded-full px-3 py-1.5 text-xs ${status === s ? "bg-foreground text-background" : "border border-line bg-card"}`;

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-medium">Orders</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/admin/orders" className={tab(undefined)}>All</Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`} className={tab(s)}>
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>
      <div className="mt-6 overflow-x-auto border border-line bg-card">
        {orders.length === 0 ? (
          <p className="p-6 text-sm text-muted">No orders here yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Deliver to</th>
                <th className="p-3">Date</th>
                <th className="p-3">Total</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o._id} className="hover:bg-soft">
                  <td className="p-3 font-medium">
                    <Link href={`/admin/orders/${o._id}`}>#{o.number}</Link>
                  </td>
                  <td className="p-3">
                    {o.name}
                    <span className="block text-xs text-muted">{o.phone}</span>
                  </td>
                  <td className="p-3 text-muted">{o.town}, {o.county}</td>
                  <td className="p-3 text-muted">{formatDate(o._creationTime)}</td>
                  <td className="p-3">{formatMoney(o.totalCents)}</td>
                  <td className="p-3 text-muted">{o.paymentMethod === "COD" ? "On delivery" : "M-Pesa/card"}</td>
                  <td className="p-3"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
