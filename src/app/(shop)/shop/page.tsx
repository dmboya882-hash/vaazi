import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getCategories, getFilterOptions, getProducts, type CatalogFilters } from "@/lib/catalog";
import { ProductCard, ProductGridSkeleton } from "@/components/product-card";
import { CatalogShell } from "@/components/catalog-shell";
import { sortSizes } from "@/lib/site";

export const metadata: Metadata = { title: "Shop" };

type Search = Record<string, string | string[] | undefined>;
const KEYS = ["category", "size", "thrifted", "q", "sort", "price", "sale"] as const;

function pick(sp: Search): CatalogFilters {
  const out: CatalogFilters = {};
  for (const k of KEYS) if (typeof sp[k] === "string") out[k] = sp[k] as string;
  return out;
}

// Build a /shop URL that toggles one filter while keeping the others.
function hrefWith(f: CatalogFilters, key: keyof CatalogFilters, value?: string) {
  const next = { ...f, [key]: f[key] === value ? undefined : value };
  const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v) as [string, string][]).toString();
  return qs ? `/shop?${qs}` : "/shop";
}

const PRICES = [
  ["under-1000", "Under Ksh 1,000"],
  ["under-2000", "Under Ksh 2,000"],
  ["under-5000", "Under Ksh 5,000"],
  ["under-10000", "Under Ksh 10,000"],
  ["over-10000", "Ksh 10,000 +"],
];

function Row({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={`flex items-center gap-3 py-1.5 text-[15px] ${active ? "font-medium" : "text-foreground/80 hover:text-foreground"}`}>
      <span className={`h-4 w-4 shrink-0 rounded border ${active ? "border-foreground bg-foreground" : "border-muted"}`} />
      {children}
    </Link>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details open className="border-b border-line py-4">
      <summary className="cursor-pointer list-none text-[15px] font-medium">{title}</summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

async function Catalog({ searchParams }: { searchParams: Promise<Search> }) {
  const f = pick(await searchParams);
  const [products, categories, options] = await Promise.all([getProducts(f), getCategories(), getFilterOptions()]);
  const current = categories.find((c) => c.slug === f.category);
  const title = f.q ? `Results for “${f.q}”` : f.sale ? "Sale" : f.thrifted ? `Thrifted ${current?.name ?? "finds"}` : (current?.name ?? "All products");
  const anyFilter = KEYS.some((k) => k !== "sort" && f[k]);

  const filters = (
    <div>
      <div className="border-b border-line pb-4">
        <Link href={hrefWith({ ...f, category: undefined }, "category", undefined)} className={`block py-1.5 text-[15px] ${!f.category ? "font-medium" : "text-foreground/80"}`}>
          All products
        </Link>
        {categories.map((c) => (
          <Link key={c._id} href={hrefWith(f, "category", c.slug)} className={`block py-1.5 text-[15px] ${f.category === c.slug ? "font-medium" : "text-foreground/80 hover:text-foreground"}`}>
            {c.name}
          </Link>
        ))}
      </div>
      <Group title="Shop">
        <Row href={hrefWith(f, "thrifted", "1")} active={f.thrifted === "1"}>
          Thrifted only
        </Row>
        <Row href={hrefWith(f, "sale", "1")} active={f.sale === "1"}>
          On sale
        </Row>
      </Group>
      <Group title="Price">
        {PRICES.map(([v, l]) => (
          <Row key={v} href={hrefWith(f, "price", v)} active={f.price === v}>
            {l}
          </Row>
        ))}
      </Group>
      <Group title="Size">
        <div className="grid grid-cols-3 gap-2">
          {sortSizes(options.sizes).map((s) => (
            <Link
              key={s}
              href={hrefWith(f, "size", s)}
              className={`border py-2 text-center text-sm ${f.size === s ? "border-foreground bg-foreground text-background" : "border-line hover:border-foreground"}`}
            >
              {s}
            </Link>
          ))}
        </div>
      </Group>
      {anyFilter && (
        <Link href={f.sort ? `/shop?sort=${f.sort}` : "/shop"} className="mt-4 block text-sm underline underline-offset-4">
          Clear all filters
        </Link>
      )}
    </div>
  );

  return (
    <CatalogShell title={title} count={products.length} filters={filters}>
      {products.length === 0 ? (
        <div className="bg-soft p-16 text-center">
          <p className="text-lg font-medium">No matches</p>
          <p className="mt-1 text-muted">Try removing a filter or searching for something else.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </CatalogShell>
  );
}

export default function ShopPage({ searchParams }: PageProps<"/shop">) {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-10 sm:px-8">
      <Suspense fallback={<div className="pt-20"><ProductGridSkeleton /></div>}>
        <Catalog searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
