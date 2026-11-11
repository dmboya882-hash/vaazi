import "server-only";
import { api, fetchQuery, query } from "@/lib/convex";
import type { FunctionReturnType } from "convex/server";

// Storefront data access, backed by Convex.

export type CatalogFilters = {
  category?: string;
  size?: string;
  thrifted?: string;
  q?: string;
  sort?: string;
  price?: string;
  sale?: string;
};

export const getCategories = () => query(() => fetchQuery(api.catalog.categories, {}));

export const getProducts = (f: CatalogFilters = {}) =>
  query(() =>
    fetchQuery(api.catalog.list, {
      category: f.category,
      size: f.size,
      thrifted: f.thrifted === "1" ? true : undefined,
      q: f.q,
      sort: f.sort,
      price: f.price,
      sale: f.sale === "1" ? true : undefined,
    }),
  );

export const getFeaturedProducts = () => query(() => fetchQuery(api.catalog.featured, {}));
export const getBestsellers = (limit = 4) => query(() => fetchQuery(api.catalog.bestsellers, { limit }));
export const getNewestProducts = (limit = 10) => query(() => fetchQuery(api.catalog.newest, { limit }));
export const getProductBySlug = (slug: string) => query(() => fetchQuery(api.catalog.bySlug, { slug }));
export const getRelatedProducts = (productId: ProductWithCard["_id"]) =>
  query(() => fetchQuery(api.catalog.related, { productId }));
export const getFilterOptions = () => query(() => fetchQuery(api.catalog.filterOptions, {}));

export type ProductWithCard = FunctionReturnType<typeof api.catalog.list>[number];
