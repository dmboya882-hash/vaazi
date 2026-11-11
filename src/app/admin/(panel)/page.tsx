import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { api, fetchQuery, serverSecret } from "@/lib/convex";
import { formatMoney } from "@/lib/site";
import { StatusBadge, formatDate } from "@/components/admin-ui";

export default async function AdminDashboard() {
  await requireAdmin();
  const d = await fetchQuery(api.admin.dashboard, { secret: serverSecret() });

  const stats = [
    { label: "Revenue (paid)", value: formatMoney(d.revenueCents) },
    { label: "Paid orders", value: d.paidCount },
    { label: "To deliver", value: d.toShip },
    { label: "Active products", value: d.activeProducts },
    { label: "Newsletter signups", value: d.subscribers },
  ];

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-medium">Dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-card p-5">
            <div className="text-xs uppercase tracking-wide text-muted">{s.label}</div>
            <div className="mt-2 text-2xl font-medium">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm underline underline-offset-4">All orders</Link>
          </div>
          {d.recent.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No orders yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line text-sm">
              {d.recent.map((o) => (
                <li key={o._id}>
                  <Link href={`/admin/orders/${o._id}`} className="flex items-center justify-between gap-3 py-3">
                    <span>
                      #{o.number} · {o.name}
                      <span className="block text-xs text-muted">{formatDate(o._creationTime)} · {o.county}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      {formatMoney(o.totalCents)}
                      <StatusBadge status={o.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-line bg-card p-5">
          <h2 className="font-medium">Low stock</h2>
          {d.lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Everything is well stocked.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line text-sm">
              {d.lowStock.map((v) => (
                <li key={v._id}>
                  <Link href={`/admin/products/${v.productId}`} className="flex justify-between gap-3 py-3">
                    <span>
                      {v.productName}
                      <span className="block text-xs text-muted">Size {v.size}</span>
                    </span>
                    <span className={v.stock === 0 ? "text-sale" : "text-accent"}>
                      {v.stock === 0 ? "Out of stock" : `${v.stock} left`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
