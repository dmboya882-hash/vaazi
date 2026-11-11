import Link from "next/link";
import { notFound } from "next/navigation";
import { api, fetchQuery, serverSecret } from "@/lib/convex";
import { requireAdmin } from "@/lib/admin";
import { sortSizes } from "@/lib/site";
import { Notice } from "@/components/admin-ui";
import { ProductForm } from "../product-form";
import { PhotoManager } from "./photo-manager";
import { ConfirmButton } from "@/components/confirm-button";
import { addVariants, deleteProduct, deleteVariant, setProductVisibility, updateStock } from "../../actions";

export default async function EditProductPage({ params, searchParams }: PageProps<"/admin/products/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const [product, categories] = await Promise.all([
    fetchQuery(api.admin.product, { secret: serverSecret(), id }),
    fetchQuery(api.admin.categories, { secret: serverSecret() }),
  ]);
  if (!product) notFound();

  const sizeOrder = sortSizes([...new Set(product.variants.map((v) => v.size))]);
  const variants = [...product.variants].sort(
    (a, b) => sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size),
  );

  return (
    <div className="max-w-3xl">
      <Link href="/admin/products" className="text-sm text-muted">← Products</Link>
      <h1 className="display mt-2 text-4xl">{product.name}</h1>

      {/* Visibility bar */}
      <div
        className={`mt-5 flex flex-wrap items-center justify-between gap-3 border p-4 text-sm ${
          product.active
            ? "border-emerald-300 bg-emerald-50 dark:border-emerald-400/30 dark:bg-emerald-400/10"
            : "border-line bg-soft"
        }`}
      >
        <span>
          {product.active ? (
            <>
              <strong>Visible</strong> in the store.{" "}
              <Link href={`/products/${product.slug}`} className="underline underline-offset-4">
                View it ↗
              </Link>
            </>
          ) : (
            <>
              <strong>Hidden</strong>. Customers can&apos;t see or buy this product.
            </>
          )}
        </span>
        <form action={setProductVisibility}>
          <input type="hidden" name="id" value={product._id} />
          <input type="hidden" name="active" value={product.active ? "0" : "1"} />
          <input type="hidden" name="back" value={`/admin/products/${product._id}`} />
          <button className={product.active ? "btn-outline py-2.5" : "btn py-2.5"}>
            {product.active ? "Hide from store" : "Show in store"}
          </button>
        </form>
      </div>

      <div className="mt-6">
        <Notice error={typeof sp.error === "string" ? sp.error : undefined} saved={sp.saved === "1"} />
      </div>

      <PhotoManager productId={product._id} photos={product.photos} externalPhoto={product.externalPhoto} />

      <section className="mt-10">
        <h2 className="text-2xl font-medium">Details &amp; price</h2>
        <div className="mt-4">
          <ProductForm product={product} categories={categories} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-medium">Sizes &amp; stock</h2>
        {variants.length > 0 ? (
          <form action={updateStock} className="mt-4 border border-line bg-card">
            <input type="hidden" name="productId" value={product._id} />
            <table className="w-full text-sm">
              <thead className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="p-3">Size</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {variants.map((v) => (
                  <tr key={v._id}>
                    <td className="p-3">{v.size}</td>
                    <td className="p-3">
                      <input
                        name={`stock_${v._id}`}
                        type="number"
                        min="0"
                        defaultValue={v.stock}
                        aria-label={`Stock for size ${v.size}`}
                        className="input w-24"
                      />
                    </td>
                    <td className="p-3 text-right">
                      {/* Submits its own form (below) so Enter in a stock field never deletes a row */}
                      <button form={`del-${v._id}`} className="text-xs text-muted underline hover:text-sale">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-line p-3">
              <button className="btn">Save stock</button>
            </div>
          </form>
        ) : null}
        {variants.map((v) => (
          <form key={v._id} id={`del-${v._id}`} action={deleteVariant} hidden>
            <input type="hidden" name="productId" value={product._id} />
            <input type="hidden" name="variantId" value={v._id} />
          </form>
        ))}
        {variants.length === 0 && (
          <p className="mt-4 text-sm text-muted">No sizes yet. Add at least one size below so customers can buy it.</p>
        )}

        <form action={addVariants} className="mt-6 grid gap-4 border border-dashed border-line p-5 sm:grid-cols-[1fr_120px_auto] sm:items-end">
          <input type="hidden" name="productId" value={product._id} />
          <div>
            <label className="label" htmlFor="sizes">Sizes (comma separated)</label>
            <input id="sizes" name="sizes" placeholder={product.condition ? "e.g. L" : "S, M, L, XL"} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="stock">Stock each</label>
            <input id="stock" name="stock" type="number" min="0" defaultValue={product.condition ? 1 : 10} className="input" />
          </div>
          <button className="btn-outline">Add</button>
        </form>
      </section>

      <section className="mt-12 border border-sale/30 p-5">
        <h2 className="font-medium text-sale">Delete product</h2>
        <p className="mt-1 text-sm text-muted">
          Removes it and its photos for good. Products that appear in past orders are hidden instead, so order history
          stays intact. To take it down temporarily, use <strong>Hide from store</strong> above.
        </p>
        <form action={deleteProduct} className="mt-4">
          <input type="hidden" name="id" value={product._id} />
          <ConfirmButton
            message={`Delete "${product.name}"? This can't be undone.`}
            className="border border-sale px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-sale hover:bg-sale hover:text-white"
          >
            Delete product
          </ConfirmButton>
        </form>
      </section>
    </div>
  );
}
