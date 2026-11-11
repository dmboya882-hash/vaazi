"use client";

import { useRef } from "react";
import { ProductCard, type CardProduct } from "@/components/product-card";
import { ChevronIcon } from "@/components/icons";

// Horizontally scrolling row of products with arrow buttons.
export function ProductRail({ products }: { products: CardProduct[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <div className="relative">
      <div className="absolute -top-14 right-0 hidden gap-2 sm:flex">
        <button onClick={() => scroll(-1)} aria-label="Scroll left" className="flex h-11 w-11 items-center justify-center border border-line hover:border-foreground">
          <ChevronIcon className="rotate-180" />
        </button>
        <button onClick={() => scroll(1)} aria-label="Scroll right" className="flex h-11 w-11 items-center justify-center border border-line hover:border-foreground">
          <ChevronIcon />
        </button>
      </div>
      <div ref={ref} className="rail -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {products.map((p) => (
          <div key={p._id} className="w-[70%] shrink-0 sm:w-[40%] lg:w-[calc(25%-9px)]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
