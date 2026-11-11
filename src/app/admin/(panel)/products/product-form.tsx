import type { Doc } from "../../../../../convex/_generated/dataModel";
import { saveProduct } from "../actions";
import { CONDITIONS } from "@/lib/site";

const shillings = (cents?: number) => (cents == null ? "" : String(Math.round(cents / 100)));

export function ProductForm({ product, categories }: { product?: Doc<"products">; categories: Doc<"categories">[] }) {
  return (
    <form action={saveProduct} className="grid gap-5 border border-line bg-card p-6 sm:grid-cols-2">
      {product && <input type="hidden" name="id" value={product._id} />}
      <div className="sm:col-span-2">
        <label className="label" htmlFor="name">Name</label>
        <input id="name" name="name" required defaultValue={product?.name} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="slug">URL slug</label>
        <input id="slug" name="slug" defaultValue={product?.slug} placeholder="auto from name" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="categoryId">Category</label>
        <select id="categoryId" name="categoryId" required defaultValue={product?.categoryId} className="input">
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={4} required defaultValue={product?.description} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="price">Price (Ksh)</label>
        <input id="price" name="price" type="number" step="1" min="0" required defaultValue={shillings(product?.priceCents)} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="compareAt">Was price, Ksh (shows as sale)</label>
        <input id="compareAt" name="compareAt" type="number" step="1" min="0" defaultValue={shillings(product?.compareAtCents)} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="condition">Condition</label>
        <select id="condition" name="condition" defaultValue={product?.condition ?? ""} className="input">
          <option value="">New (multiple in stock)</option>
          {Object.entries(CONDITIONS).map(([k, c]) => (
            <option key={k} value={k}>Thrifted · {c.label}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="measurements">Measurements / fit (optional)</label>
        <input id="measurements" name="measurements" defaultValue={product?.measurements ?? ""} placeholder="e.g. Pit to pit 56cm, length 72cm, sleeve 63cm" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="imageUrl">External photo URL (optional)</label>
        <input id="imageUrl" name="imageUrl" defaultValue={product?.imageUrl ?? ""} placeholder="https://… or /images/…" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="tint">Placeholder colour (when no photo)</label>
        <input id="tint" name="tint" type="color" defaultValue={product?.tint ?? "#4b5563"} className="h-10 w-20 rounded border border-line" />
      </div>
      <div className="flex gap-6 text-sm sm:col-span-2">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="active" defaultChecked={product?.active ?? true} /> Visible in store
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} /> Bestseller (home page)
        </label>
      </div>
      <div className="sm:col-span-2">
        <button className="btn">{product ? "Save changes" : "Create product"}</button>
      </div>
    </form>
  );
}
