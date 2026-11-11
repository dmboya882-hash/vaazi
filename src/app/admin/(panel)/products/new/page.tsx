import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { api, fetchQuery, serverSecret } from "@/lib/convex";
import { Notice } from "@/components/admin-ui";
import { ProductForm } from "../product-form";

export default async function NewProductPage({ searchParams }: PageProps<"/admin/products/new">) {
  await requireAdmin();
  const sp = await searchParams;
  const categories = await fetchQuery(api.admin.categories, { secret: serverSecret() });
  return (
    <div className="max-w-3xl">
      <Link href="/admin/products" className="text-sm text-muted">← Products</Link>
      <h1 className="mt-2 text-3xl font-medium">New product</h1>
      <p className="mt-1 text-sm text-muted">After creating it you can upload photos and add sizes and stock.</p>
      <div className="mt-6">
        <Notice error={typeof sp.error === "string" ? sp.error : undefined} />
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
