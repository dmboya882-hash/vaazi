import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { api, fetchQuery, serverSecret } from "@/lib/convex";
import { CONDITIONS, formatMoney } from "@/lib/site";
import { ProductImage } from "@/components/product-image";
import { ConfirmButton } from "@/components/confirm-button";
import { deleteProduct, setProductVisibility } from "../actions";

export default async function AdminProducts({ searchParams }: PageProps<"/admin/products">) {
  await requireAdmin();
  const sp = await searchParams;
  const show = sp.show === "hidden" ? "hidden" : sp.show === "visible" ? "visible" : "all";
  const all = await fetchQuery(api.admin.products, { secret: serverSecret() });
  const products = all.filter((p) => (show === "all" ? true : show === "visible" ? p.active : !p.active));
  const hiddenCount = all.filter((p) => !p.active).length;

  const tab = (v: string) =>
    `px-3 py-1.5 text-xs ${show === v ? "bg-foreground text-background" : "border border-line bg-card hover:border-foreground"}`;

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="display text-4xl">Products</h1>
          <p className="mt-1 text-sm text-muted">Click a product to change its price, photos, sizes and stock.</p>
        </div>
        <Link href="/admin/products/new" className="btn">
          + New product
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/admin/products" className={tab("all")}>All ({all.length})</Link>
        <Link href="/admin/products?show=visible" className={tab("visible")}>Visible ({all.length - hiddenCount})</Link>
        <Link href="/admin/products?show=hidden" className={tab("hidden")}>Hidden ({hiddenCount})</Link>
      </div>

      <div className="mt-4 overflow-x-auto border border-line bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-[11px] uppercase tracking-[0.15em] text-muted">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p._id} className={`hover:bg-soft ${p.active ? "" : "opacity-60"}`}>
                <td className="p-3">
                  <Link href={`/admin/products/${p._id}`} className="flex items-center gap-3">
                    <span className="block w-12 shrink-0 overflow-hidden bg-soft">
                      <ProductImage imageUrl={p.imageUrl} tint={p.tint} category={p.category.slug} name={p.name} />
                    </span>
                    <span>
                      <span className="font-medium hover:underline">{p.name}</span>
                      <span className="block text-xs text-muted">
                        {p.category.name}
                        {p.condition ? ` · Thrifted (${CONDITIONS[p.condition].label})` : ""}
                        {p.photoCount === 0 ? " · No photo" : ""}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="p-3 whitespace-nowrap">
                  {formatMoney(p.priceCents)}
                  {p.compareAtCents && p.compareAtCents > p.priceCents && (
                    <span className="block text-xs text-muted line-through">{formatMoney(p.compareAtCents)}</span>
                  )}
                </td>
                <td className={`p-3 whitespace-nowrap ${p.stock === 0 ? "text-sale" : ""}`}>
                  {p.stock === 0 ? "Sold out" : `${p.stock} in stock`}
                </td>
                <td className="p-3">
                  <span
                    className={`whitespace-nowrap px-2 py-1 text-[11px] font-medium ${
                      p.active
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300"
                        : "bg-soft text-muted"
                    }`}
                  >
                    {p.active ? "Visible" : "Hidden"}
                  </span>
                  {p.featured && p.active && <span className="ml-2 text-xs text-muted">Featured</span>}
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-3 whitespace-nowrap text-xs">
                    <Link href={`/admin/products/${p._id}`} className="font-medium underline underline-offset-4">
                      Edit
                    </Link>
                    <form action={setProductVisibility}>
                      <input type="hidden" name="id" value={p._id} />
                      <input type="hidden" name="active" value={p.active ? "0" : "1"} />
                      <input type="hidden" name="back" value={show === "all" ? "/admin/products" : `/admin/products?show=${show}`} />
                      <button className="underline underline-offset-4 hover:text-muted">{p.active ? "Hide" : "Show"}</button>
                    </form>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={p._id} />
                      <ConfirmButton
                        message={`Delete "${p.name}"? This can't be undone. (Products in past orders are hidden instead.)`}
                        className="text-sale underline underline-offset-4"
                      >
                        Delete
                      </ConfirmButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted">
                  No products here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
