import { ConvexError } from "convex/values";
import type { QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

export { deliveryFor } from "../shared/delivery";

// Privileged functions (admin, marking orders paid) are only called from the
// Next.js server, which passes CONVEX_SERVER_SECRET. Set the same value with
// `npx convex env set CONVEX_SERVER_SECRET <value>` and in .env.local.
export function requireServer(secret: string) {
  const expected = process.env.CONVEX_SERVER_SECRET;
  if (!expected || secret !== expected) throw new ConvexError("Unauthorized");
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// All photo URLs for a product: uploaded photos first, then the external URL.
export async function photoUrls(ctx: QueryCtx, product: Doc<"products">) {
  const uploaded = await Promise.all((product.images ?? []).map((id) => ctx.storage.getUrl(id)));
  const urls = uploaded.filter((u): u is string => !!u);
  if (product.imageUrl) urls.push(product.imageUrl);
  return urls;
}

// Product with its category and variants, the shape the storefront renders.
// imageUrl is the main photo, photos is the full gallery.
export async function hydrate(ctx: QueryCtx, product: Doc<"products">) {
  const [category, variants, photos] = await Promise.all([
    ctx.db.get(product.categoryId),
    ctx.db
      .query("variants")
      .withIndex("by_product", (q) => q.eq("productId", product._id))
      .collect(),
    photoUrls(ctx, product),
  ]);
  return {
    ...product,
    imageUrl: photos[0],
    photos,
    category: { _id: product.categoryId as Id<"categories">, name: category?.name ?? "", slug: category?.slug ?? "" },
    variants: variants.map(({ _id, size, stock }) => ({ _id, size, stock })),
  };
}
