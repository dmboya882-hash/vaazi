import { mutation, query, type MutationCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { paymentMethod } from "./schema";
import { deliveryFor, requireServer } from "./lib";
import { COUNTIES } from "../shared/delivery";

async function takeStock(ctx: MutationCtx, order: Doc<"orders">, direction: -1 | 1) {
  for (const item of order.items) {
    if (!item.variantId) continue;
    const variant = await ctx.db.get(item.variantId);
    if (variant) await ctx.db.patch(variant._id, { stock: Math.max(0, variant.stock + direction * item.quantity) });
  }
}

// Statuses in which the items have left stock.
export const STOCK_TAKEN = ["CONFIRMED", "PAID", "SHIPPED", "DELIVERED"];

// Creates an order. Prices and stock always come from the database, never
// from the browser. Pay-on-delivery orders reserve stock immediately; online
// payments reserve it once Paystack confirms the payment.
export const create = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    phone: v.string(),
    county: v.string(),
    town: v.string(),
    address: v.string(),
    notes: v.optional(v.string()),
    paymentMethod,
    items: v.array(v.object({ variantId: v.id("variants"), quantity: v.number() })),
  },
  handler: async (ctx, args) => {
    if (args.items.length === 0) throw new ConvexError("Your bag is empty.");
    if (!(COUNTIES as readonly string[]).includes(args.county)) throw new ConvexError("Choose your county.");

    const items = [];
    let subtotalCents = 0;
    for (const { variantId, quantity } of args.items) {
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new ConvexError("Invalid quantity.");
      const variant = await ctx.db.get(variantId);
      const product = variant && (await ctx.db.get(variant.productId));
      if (!variant || !product || !product.active) {
        throw new ConvexError("An item in your bag is no longer available. Please remove it and try again.");
      }
      if (variant.stock < quantity) {
        throw new ConvexError(
          variant.stock === 0
            ? `Sorry, ${product.name} (size ${variant.size}) just sold out. Please remove it from your bag.`
            : `Only ${variant.stock} left of ${product.name} (size ${variant.size}). Please update your bag.`,
        );
      }
      subtotalCents += product.priceCents * quantity;
      items.push({
        productId: product._id,
        variantId: variant._id,
        productName: product.name,
        size: variant.size,
        priceCents: product.priceCents,
        quantity,
      });
    }

    const last = await ctx.db.query("orders").withIndex("by_number").order("desc").first();
    const shippingCents = deliveryFor(subtotalCents, args.county).cents;
    const orderId = await ctx.db.insert("orders", {
      number: (last?.number ?? 1000) + 1,
      email: args.email.trim(),
      name: args.name.trim(),
      phone: args.phone,
      county: args.county,
      town: args.town.trim(),
      address: args.address.trim(),
      notes: args.notes?.trim() || undefined,
      paymentMethod: args.paymentMethod,
      status: args.paymentMethod === "COD" ? "CONFIRMED" : "PENDING",
      subtotalCents,
      shippingCents,
      totalCents: subtotalCents + shippingCents,
      items,
    });

    if (args.paymentMethod === "COD") await takeStock(ctx, (await ctx.db.get(orderId))!, -1);
    const order = (await ctx.db.get(orderId))!;
    return { orderId, number: order.number, totalCents: order.totalCents };
  },
});

// Public lookup for the confirmation page. Order ids are long random strings.
export const get = query({
  args: { orderId: v.string() },
  handler: async (ctx, { orderId }) => {
    const id = ctx.db.normalizeId("orders", orderId);
    return id ? ctx.db.get(id) : null;
  },
});

export async function markPaidImpl(ctx: MutationCtx, orderId: Id<"orders">, paymentRef?: string) {
  const order = await ctx.db.get(orderId);
  if (!order) return false;
  // Pay-on-delivery: cash collected, stock was already taken.
  if (order.status === "CONFIRMED") {
    await ctx.db.patch(orderId, { status: "PAID", paidAt: Date.now() });
    return true;
  }
  // Only the first confirmation counts (webhook and success page may both fire).
  if (order.status !== "PENDING") return false;
  await ctx.db.patch(orderId, { status: "PAID", paidAt: Date.now(), ...(paymentRef ? { paymentRef } : {}) });
  await takeStock(ctx, order, -1);
  return true;
}

export async function setStatusImpl(ctx: MutationCtx, orderId: Id<"orders">, status: Doc<"orders">["status"]) {
  const order = await ctx.db.get(orderId);
  if (!order || order.status === status) return;
  if (status === "PAID" && (await markPaidImpl(ctx, orderId))) return;
  // Put items back on the shelf when a reserved/paid order is cancelled.
  if (status === "CANCELLED" && STOCK_TAKEN.includes(order.status)) await takeStock(ctx, order, 1);
  if (STOCK_TAKEN.includes(status) && !STOCK_TAKEN.includes(order.status)) await takeStock(ctx, order, -1);
  await ctx.db.patch(orderId, { status });
}

export const markPaid = mutation({
  args: { secret: v.string(), orderId: v.id("orders"), paymentRef: v.optional(v.string()) },
  handler: async (ctx, { secret, orderId, paymentRef }) => {
    requireServer(secret);
    return markPaidImpl(ctx, orderId, paymentRef);
  },
});

export const setPaymentRef = mutation({
  args: { secret: v.string(), orderId: v.id("orders"), paymentRef: v.string() },
  handler: async (ctx, { secret, orderId, paymentRef }) => {
    requireServer(secret);
    await ctx.db.patch(orderId, { paymentRef });
  },
});
