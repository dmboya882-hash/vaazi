import { query } from "./_generated/server";
import { v } from "convex/values";
import { hydrate } from "./lib";

export const categories = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("categories").collect();
    return all.sort((a, b) => a.sort - b.sort);
  },
});

// Price filters in cents (Ksh × 100)
const PRICE_RANGES: Record<string, [number, number]> = {
  "under-1000": [0, 1000_00],
  "under-2000": [0, 2000_00],
  "under-5000": [0, 5000_00],
  "under-10000": [0, 10000_00],
  "over-10000": [10000_00, Infinity],
};

export const list = query({
  args: {
    category: v.optional(v.string()),
    size: v.optional(v.string()),
    thrifted: v.optional(v.boolean()),
    q: v.optional(v.string()),
    sort: v.optional(v.string()),
    price: v.optional(v.string()),
    sale: v.optional(v.boolean()),
  },
  handler: async (ctx, f) => {
    let products = await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();

    if (f.category) {
      const cat = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", f.category!))
        .unique();
      products = cat ? products.filter((p) => p.categoryId === cat._id) : [];
    }
    if (f.q) {
      const q = f.q.toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (f.thrifted) products = products.filter((p) => p.condition);
    if (f.sale) products = products.filter((p) => p.compareAtCents && p.compareAtCents > p.priceCents);
    if (f.price && PRICE_RANGES[f.price]) {
      const [min, max] = PRICE_RANGES[f.price];
      products = products.filter((p) => p.priceCents >= min && p.priceCents < max);
    }

    let hydrated = await Promise.all(products.map((p) => hydrate(ctx, p)));
    if (f.size) hydrated = hydrated.filter((p) => p.variants.some((v) => v.stock > 0 && v.size === f.size));

    const sorters: Record<string, (a: (typeof hydrated)[number], b: (typeof hydrated)[number]) => number> = {
      "price-asc": (a, b) => a.priceCents - b.priceCents,
      "price-desc": (a, b) => b.priceCents - a.priceCents,
      name: (a, b) => a.name.localeCompare(b.name),
      featured: (a, b) => Number(b.featured) - Number(a.featured),
    };
    return hydrated.sort(sorters[f.sort ?? ""] ?? ((a, b) => b._creationTime - a._creationTime));
  },
});

export const featured = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    return Promise.all(products.filter((p) => p.featured).slice(0, 8).map((p) => hydrate(ctx, p)));
  },
});

export const newest = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("active", true))
      .order("desc")
      .take(limit ?? 10);
    return Promise.all(products.map((p) => hydrate(ctx, p)));
  },
});

export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!product || !product.active) return null;
    return hydrate(ctx, product);
  },
});

export const related = query({
  args: { productId: v.id("products") },
  handler: async (ctx, { productId }) => {
    const product = await ctx.db.get(productId);
    if (!product) return [];
    const same = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categoryId", product.categoryId))
      .collect();
    return Promise.all(
      same
        .filter((p) => p.active && p._id !== productId)
        .slice(0, 4)
        .map((p) => hydrate(ctx, p)),
    );
  },
});

export const filterOptions = query({
  args: {},
  handler: async (ctx) => {
    const variants = await ctx.db.query("variants").collect();
    return { sizes: [...new Set(variants.filter((v) => v.stock > 0).map((v) => v.size))] };
  },
});

// Most-bought products: ranked by units sold across orders that went through
// (pay on delivery, paid, shipped, delivered). Gaps are filled with regular
// stock marked as featured, then the newest, so the row is never empty.
export const bestsellers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 4 }) => {
    const sold = new Map<string, number>();
    for (const status of ["CONFIRMED", "PAID", "SHIPPED", "DELIVERED"] as const) {
      const orders = await ctx.db
        .query("orders")
        .withIndex("by_status", (q) => q.eq("status", status))
        .collect();
      for (const o of orders) {
        for (const item of o.items) {
          if (item.productId) sold.set(item.productId, (sold.get(item.productId) ?? 0) + item.quantity);
        }
      }
    }

    const active = await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    // Thrifted one-offs can't be "frequently bought", so regular stock comes
    // first; sold-out items are skipped.
    const ranked = [...active].sort(
      (a, b) =>
        (sold.get(b._id) ?? 0) - (sold.get(a._id) ?? 0) ||
        Number(!!a.condition) - Number(!!b.condition) ||
        Number(b.featured) - Number(a.featured) ||
        b._creationTime - a._creationTime,
    );
    const picked = [];
    for (const p of ranked) {
      if (picked.length >= limit) break;
      const full = await hydrate(ctx, p);
      if (full.variants.some((v) => v.stock > 0)) picked.push({ ...full, unitsSold: sold.get(p._id) ?? 0 });
    }
    return picked;
  },
});
