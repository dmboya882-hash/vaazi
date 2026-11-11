"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FilterIcon } from "@/components/icons";

const SORTS = [
  ["newest", "Newest"],
  ["featured", "Featured"],
  ["price-asc", "Price: Low–High"],
  ["price-desc", "Price: High–Low"],
  ["name", "Name"],
] as const;

// Title bar with "Hide filters" and sort, plus a collapsible sidebar.
export function CatalogShell({
  title,
  count,
  filters,
  children,
}: {
  title: string;
  count: number;
  filters: React.ReactNode;
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  function setSort(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "newest") next.delete("sort");
    else next.set("sort", value);
    const qs = next.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
  }

  return (
    <>
      <div className="sticky top-16 z-20 -mx-4 flex items-center justify-between gap-4 bg-background px-4 py-4 sm:-mx-8 sm:px-8">
        <h1 className="text-lg font-medium sm:text-2xl">
          {title} <span className="text-muted">({count})</span>
        </h1>
        <div className="flex shrink-0 items-center gap-3 text-sm sm:gap-5 sm:text-[15px]">
          <button className="hidden items-center gap-2 lg:flex" onClick={() => setShow((s) => !s)}>
            {show ? "Hide filters" : "Show filters"} <FilterIcon width={20} height={20} />
          </button>
          <button className="flex items-center gap-2 border border-line px-4 py-2 lg:hidden" onClick={() => setMobileOpen(true)}>
            Filters <FilterIcon width={18} height={18} />
          </button>
          <label className="flex items-center gap-2">
            <span className="hidden sm:inline">Sort by:</span>
            <select
              value={params.get("sort") ?? "newest"}
              onChange={(e) => setSort(e.target.value)}
              className="cursor-pointer bg-transparent font-medium outline-none"
            >
              {SORTS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className={`mt-4 grid gap-10 ${show ? "lg:grid-cols-[240px_1fr]" : ""}`}>
        {show && <aside className="sticky top-36 hidden h-fit max-h-[calc(100vh-10rem)] overflow-y-auto pr-2 lg:block">{filters}</aside>}
        <div>{children}</div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto bg-background p-6" onClick={(e) => (e.target as HTMLElement).closest("a") && setMobileOpen(false)}>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xl font-medium">Filters</span>
              <button className="text-sm underline" onClick={() => setMobileOpen(false)}>
                Done
              </button>
            </div>
            {filters}
          </div>
        </div>
      )}
    </>
  );
}
