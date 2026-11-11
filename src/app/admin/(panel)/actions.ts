"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { api, errorMessage, fetchMutation, serverSecret } from "@/lib/convex";
import { ORDER_STATUSES } from "@/lib/orders";
import type { Id } from "../../../../convex/_generated/dataModel";

// Admin form handlers. Each one checks the admin cookie, then calls Convex
// with the server secret.

const shillings = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : Math.round(parseFloat(v.replace(/,/g, "")) * 100)))
  .refine((v) => v === undefined || (Number.isFinite(v) && v >= 0), "Enter a valid price");

const ProductSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  slug: z.string().trim(),
  description: z.string().trim().min(1, "Description is required"),
  price: shillings.refine((v) => v !== undefined && v > 0, "Price is required"),
  compareAt: shillings,
  categoryId: z.string().min(1, "Choose a category"),
  imageUrl: z
    .string()
    .trim()
    .refine((v) => v === "" || /^https?:\/\//.test(v) || v.startsWith("/"), "Image URL must start with http(s):// or /"),
  tint: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  condition: z.enum(["", "LIKE_NEW", "EXCELLENT", "GOOD"]),
  measurements: z.string().trim().max(300),
});

const back = (path: string, error: string) => redirect(`${path}?error=${encodeURIComponent(error)}`);

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const path = id ? `/admin/products/${id}` : "/admin/products/new";
  const parsed = ProductSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") ?? "",
    description: formData.get("description"),
    price: formData.get("price"),
    compareAt: formData.get("compareAt") ?? "",
    categoryId: formData.get("categoryId"),
    imageUrl: formData.get("imageUrl") ?? "",
    tint: formData.get("tint") ?? "#4b5563",
    condition: formData.get("condition") ?? "",
    measurements: formData.get("measurements") ?? "",
  });
  if (!parsed.success) back(path, parsed.error.issues[0].message);
  const d = parsed.data!;

  let savedId: string;
  try {
    savedId = await fetchMutation(api.admin.saveProduct, {
      secret: serverSecret(),
      id: id ? (id as Id<"products">) : undefined,
      name: d.name,
      slug: d.slug,
      description: d.description,
      priceCents: d.price!,
      compareAtCents: d.compareAt,
      categoryId: d.categoryId as Id<"categories">,
      imageUrl: d.imageUrl || undefined,
      tint: d.tint,
      condition: d.condition || undefined,
      measurements: d.measurements || undefined,
      featured: formData.get("featured") === "on",
      active: formData.get("active") === "on",
    });
  } catch (e) {
    return back(path, errorMessage(e));
  }
  revalidatePath("/", "layout");
  redirect(`/admin/products/${savedId}?saved=1`);
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  await fetchMutation(api.admin.deleteProduct, { secret: serverSecret(), id: String(formData.get("id")) as Id<"products"> });
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function addVariants(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId"));
  const list = (k: string) =>
    String(formData.get(k) ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  const sizes = list("sizes");
  if (sizes.length === 0) back(`/admin/products/${productId}`, "Enter at least one size.");
  await fetchMutation(api.admin.addVariants, {
    secret: serverSecret(),
    productId: productId as Id<"products">,
    sizes,
    stock: Math.max(0, parseInt(String(formData.get("stock") ?? "0"), 10) || 0),
  });
  revalidatePath("/", "layout");
  redirect(`/admin/products/${productId}?saved=1`);
}

export async function updateStock(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId"));
  // Every stock input is named stock_<variantId>.
  const updates = [...formData.entries()]
    .filter(([k]) => k.startsWith("stock_"))
    .map(([k, v]) => ({ variantId: k.slice(6) as Id<"variants">, stock: Math.max(0, parseInt(String(v), 10) || 0) }));
  await fetchMutation(api.admin.updateStock, { secret: serverSecret(), productId: productId as Id<"products">, updates });
  revalidatePath("/", "layout");
  redirect(`/admin/products/${productId}?saved=1`);
}

export async function deleteVariant(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId"));
  await fetchMutation(api.admin.deleteVariant, { secret: serverSecret(), variantId: String(formData.get("variantId")) as Id<"variants"> });
  revalidatePath("/", "layout");
  redirect(`/admin/products/${productId}`);
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = z.enum(ORDER_STATUSES).parse(formData.get("status"));
  await fetchMutation(api.admin.updateOrderStatus, { secret: serverSecret(), id: id as Id<"orders">, status });
  revalidatePath("/admin", "layout");
  redirect(`/admin/orders/${id}`);
}

// Show or hide a product in the store. `back` is the page to return to.
export async function setProductVisibility(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "1";
  await fetchMutation(api.admin.setActive, { secret: serverSecret(), id: id as Id<"products">, active });
  revalidatePath("/", "layout");
  const back = String(formData.get("back") ?? "/admin/products");
  redirect(back.startsWith("/admin") ? back : "/admin/products");
}
