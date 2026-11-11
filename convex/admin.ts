import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { condition, orderStatus } from "./schema";
import { photoUrls, requireServer, slugify } from "./lib";
import { setStatusImpl } from "./orders";

// Every function here requires the server secret. The Next.js admin pages
// check the admin login cookie first, then call these from the server.

const PAID = ["PAID", "SHIPPED", "DELIVERED"];

export const dashboard = query({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    requireServer(secret);
    const [orders, products, variants] = await Promise.all([
      ctx.db.query("orders").order("desc").collect(),
      ctx.db.query("products").collect(),
      ctx.db.query("variants").collect(),
    ]);
    const paid = orders.filter((o) => PAID.includes(o.status));
    const activeIds = new Set(products.filter((p) => p.active).map((p) => p._id));
    const names = new Map(products.map((p) => [p._id, p.name]));
    return {
      revenueCents: paid.reduce((n, o) => n + o.totalCents, 0),
      paidCount: paid.length,
      toShip: orders.filter((o) => o.status === "PAID" || o.status === "CONFIRMED").length,
      activeProducts: activeIds.size,
      subscribers: (await ctx.db.query("subscribers").collect()).length,
      recent: orders.slice(0, 6),
      lowStock: variants
        .filter((v) => v.stock <= 2 && activeIds.has(v.productId))
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 8)
        .map((v) => ({ ...v, productName: names.get(v.productId) ?? "" })),
    };
  },
});

export const products = query({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    requireServer(secret);
    const [products, categories, variants] = await Promise.all([
      ctx.db.query("products").collect(),
      ctx.db.query("categories").collect(),
      ctx.db.query("variants").collect(),
    ]);
    const cat = new Map(categories.map((c) => [c._id, c]));
    const photos = await Promise.all(products.map((p) => photoUrls(ctx, p)));
    return products
      .map((p, i) => {
        const vs = variants.filter((v) => v.productId === p._id);
        return {
          ...p,
          imageUrl: photos[i][0],
          photoCount: photos[i].length,
          category: { name: cat.get(p.categoryId)?.name ?? "", slug: cat.get(p.categoryId)?.slug ?? "", sort: cat.get(p.categoryId)?.sort ?? 0 },
          stock: vs.reduce((n, v) => n + v.stock, 0),
          variantCount: vs.length,
        };
      })
      .sort((a, b) => a.category.sort - b.category.sort || a.name.localeCompare(b.name));
  },
});

export const product = query({
  args: { secret: v.string(), id: v.string() },
  handler: async (ctx, { secret, id }) => {
    requireServer(secret);
    const productId = ctx.db.normalizeId("products", id);
    const product = productId && (await ctx.db.get(productId));
    if (!product) return null;
    const variants = await ctx.db
      .query("variants")
      .withIndex("by_product", (q) => q.eq("productId", product._id))
      .collect();
    const photos = await Promise.all(
      (product.images ?? []).map(async (storageId) => ({ storageId, url: await ctx.storage.getUrl(storageId) })),
    );
    const ready = photos.filter((p): p is { storageId: Id<"_storage">; url: string } => !!p.url);
    return { ...product, variants, photos: ready, externalPhoto: product.imageUrl ?? null };
  },
});

export const categories = query({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    requireServer(secret);
    return (await ctx.db.query("categories").collect()).sort((a, b) => a.sort - b.sort);
  },
});

export const saveProduct = mutation({
  args: {
    secret: v.string(),
    id: v.optional(v.id("products")),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    priceCents: v.number(),
    compareAtCents: v.optional(v.number()),
    categoryId: v.id("categories"),
    imageUrl: v.optional(v.string()),
    tint: v.string(),
    condition: v.optional(condition),
    measurements: v.optional(v.string()),
    featured: v.boolean(),
    active: v.boolean(),
  },
  handler: async (ctx, { secret, id, ...data }) => {
    requireServer(secret);
    const slug = slugify(data.slug || data.name);
    const clash = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (clash && clash._id !== id) throw new ConvexError("Another product already uses that URL slug.");
    const doc = { ...data, slug };
    if (id) {
      // replace() so clearing optional fields (sale price, URL) removes them;
      // uploaded photos are managed separately, so carry them over.
      const existing = await ctx.db.get(id);
      await ctx.db.replace(id, { ...doc, images: existing?.images });
      return id;
    }
    return ctx.db.insert("products", doc);
  },
});

export const deleteProduct = mutation({
  args: { secret: v.string(), id: v.id("products") },
  handler: async (ctx, { secret, id }) => {
    requireServer(secret);
    const orders = await ctx.db.query("orders").collect();
    const used = orders.some((o) => o.items.some((i) => i.productId === id));
    if (used) {
      // Keep products that appear in past orders; just hide them.
      await ctx.db.patch(id, { active: false });
      return "hidden";
    }
    const variants = await ctx.db
      .query("variants")
      .withIndex("by_product", (q) => q.eq("productId", id))
      .collect();
    for (const v of variants) await ctx.db.delete(v._id);
    const product = await ctx.db.get(id);
    for (const img of product?.images ?? []) await ctx.storage.delete(img);
    await ctx.db.delete(id);
    return "deleted";
  },
});

export const addVariants = mutation({
  args: {
    secret: v.string(),
    productId: v.id("products"),
    sizes: v.array(v.string()),
    stock: v.number(),
  },
  handler: async (ctx, { secret, productId, sizes, stock }) => {
    requireServer(secret);
    for (const size of sizes) {
      const existing = await ctx.db
        .query("variants")
        .withIndex("by_product_size", (q) => q.eq("productId", productId).eq("size", size))
        .first();
      if (!existing) await ctx.db.insert("variants", { productId, size, stock: Math.max(0, stock) });
    }
  },
});

export const updateStock = mutation({
  args: {
    secret: v.string(),
    productId: v.id("products"),
    updates: v.array(v.object({ variantId: v.id("variants"), stock: v.number() })),
  },
  handler: async (ctx, { secret, productId, updates }) => {
    requireServer(secret);
    for (const u of updates) {
      const variant = await ctx.db.get(u.variantId);
      if (variant?.productId === productId) await ctx.db.patch(u.variantId, { stock: Math.max(0, Math.floor(u.stock)) });
    }
  },
});

export const deleteVariant = mutation({
  args: { secret: v.string(), variantId: v.id("variants") },
  handler: async (ctx, { secret, variantId }) => {
    requireServer(secret);
    await ctx.db.delete(variantId);
  },
});

export const orders = query({
  args: { secret: v.string(), status: v.optional(orderStatus) },
  handler: async (ctx, { secret, status }) => {
    requireServer(secret);
    const q = status
      ? ctx.db.query("orders").withIndex("by_status", (q) => q.eq("status", status))
      : ctx.db.query("orders");
    return q.order("desc").take(200);
  },
});

export const order = query({
  args: { secret: v.string(), id: v.string() },
  handler: async (ctx, { secret, id }) => {
    requireServer(secret);
    const orderId = ctx.db.normalizeId("orders", id);
    return orderId ? ctx.db.get(orderId) : null;
  },
});

export const updateOrderStatus = mutation({
  args: { secret: v.string(), id: v.id("orders"), status: orderStatus },
  handler: async (ctx, { secret, id, status }) => {
    requireServer(secret);
    await setStatusImpl(ctx, id, status);
  },
});

// ---- Product photos (Convex file storage) ----

export const generateUploadUrl = mutation({
  args: { secret: v.string() },
  handler: async (ctx, { secret }) => {
    requireServer(secret);
    return ctx.storage.generateUploadUrl();
  },
});

export const addImages = mutation({
  args: { secret: v.string(), productId: v.id("products"), storageIds: v.array(v.id("_storage")) },
  handler: async (ctx, { secret, productId, storageIds }) => {
    requireServer(secret);
    const product = await ctx.db.get(productId);
    if (!product) throw new ConvexError("Product not found.");
    const images = [...(product.images ?? []), ...storageIds].slice(0, 10);
    await ctx.db.patch(productId, { images });
  },
});

export const removeImage = mutation({
  args: { secret: v.string(), productId: v.id("products"), storageId: v.id("_storage") },
  handler: async (ctx, { secret, productId, storageId }) => {
    requireServer(secret);
    const product = await ctx.db.get(productId);
    if (!product) return;
    await ctx.db.patch(productId, { images: (product.images ?? []).filter((i) => i !== storageId) });
    await ctx.storage.delete(storageId);
  },
});

export const makeMainImage = mutation({
  args: { secret: v.string(), productId: v.id("products"), storageId: v.id("_storage") },
  handler: async (ctx, { secret, productId, storageId }) => {
    requireServer(secret);
    const product = await ctx.db.get(productId);
    if (!product?.images?.includes(storageId)) return;
    await ctx.db.patch(productId, { images: [storageId, ...product.images.filter((i) => i !== storageId)] });
  },
});

export const setActive = mutation({
  args: { secret: v.string(), id: v.id("products"), active: v.boolean() },
  handler: async (ctx, { secret, id, active }) => {
    requireServer(secret);
    await ctx.db.patch(id, { active });
  },
});

// Removes the external (placeholder) photo URL from a product.
export const clearImageUrl = mutation({
  args: { secret: v.string(), id: v.id("products") },
  handler: async (ctx, { secret, id }) => {
    requireServer(secret);
    await ctx.db.patch(id, { imageUrl: undefined });
  },
});
