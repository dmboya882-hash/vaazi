import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// PENDING   – waiting for online payment (M-Pesa / card via Paystack)
// CONFIRMED – pay-on-delivery order accepted, stock reserved
// PAID → SHIPPED → DELIVERED, or CANCELLED
export const orderStatus = v.union(
  v.literal("PENDING"),
  v.literal("CONFIRMED"),
  v.literal("PAID"),
  v.literal("SHIPPED"),
  v.literal("DELIVERED"),
  v.literal("CANCELLED"),
);

// Second-hand (thrifted) items carry a condition grade; new items have none.
export const condition = v.union(v.literal("LIKE_NEW"), v.literal("EXCELLENT"), v.literal("GOOD"));

export const paymentMethod = v.union(v.literal("PAYSTACK"), v.literal("COD"));

export const orderItem = v.object({
  productId: v.optional(v.id("products")),
  variantId: v.optional(v.id("variants")),
  productName: v.string(),
  size: v.string(),
  priceCents: v.number(),
  quantity: v.number(),
});

export default defineSchema({
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    sort: v.number(),
  }).index("by_slug", ["slug"]),

  products: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    priceCents: v.number(),
    compareAtCents: v.optional(v.number()),
    imageUrl: v.optional(v.string()), // external photo URL (optional)
    // Uploaded photos in Convex file storage; the first one is the main photo
    images: v.optional(v.array(v.id("_storage"))),
    // Colour for the generated artwork when there is no photo
    tint: v.string(),
    condition: v.optional(condition),
    // Free text, e.g. "Pit to pit 56cm, length 72cm" (useful for thrift)
    measurements: v.optional(v.string()),
    featured: v.boolean(),
    active: v.boolean(),
    categoryId: v.id("categories"),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["categoryId"])
    .index("by_active", ["active"]),

  variants: defineTable({
    productId: v.id("products"),
    size: v.string(),
    stock: v.number(),
  })
    .index("by_product", ["productId"])
    .index("by_product_size", ["productId", "size"]),

  orders: defineTable({
    number: v.number(),
    email: v.string(),
    name: v.string(),
    phone: v.string(),
    county: v.string(),
    town: v.string(),
    // Street, building, house number or nearby landmark
    address: v.string(),
    notes: v.optional(v.string()),
    paymentMethod,
    status: orderStatus,
    subtotalCents: v.number(),
    shippingCents: v.number(),
    totalCents: v.number(),
    items: v.array(orderItem),
    // Paystack transaction reference
    paymentRef: v.optional(v.string()),
    paidAt: v.optional(v.number()),
  })
    .index("by_number", ["number"])
    .index("by_status", ["status"]),

  subscribers: defineTable({
    email: v.string(),
  }).index("by_email", ["email"]),
});
