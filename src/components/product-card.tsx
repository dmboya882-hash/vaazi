"use client";

import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { useCart } from "@/components/cart-provider";
import { HeartIcon } from "@/components/icons";
import { CONDITIONS, formatMoney, sortSizes, type Condition } from "@/lib/site";

export type CardProduct = {
  _id: string;
  slug: string;
  name: string;
  priceCents: number;
  compareAtCents?: number;
  imageUrl?: string;
  photos?: string[];
  tint: string;
  featured: boolean;
  condition?: Condition;
  category: { name: string; slug: string };
  variants: { _id: string; size: string; stock: number }[];
};

function badgeFor(p: CardProduct) {
  const total = p.variants.reduce((n, v) => n + v.stock, 0);
  if (total === 0) return { text: "Sold", tone: "bg-foreground text-background" };
  if (p.compareAtCents && p.compareAtCents > p.priceCents) {
    const pct = Math.round((1 - p.priceCents / p.compareAtCents) * 100);
    return { text: `−${pct}%`, tone: "bg-card text-sale" };
  }
  if (p.condition) return { text: "1 of 1", tone: "bg-earth text-paper" };
  if (total <= 5) return { text: "Few left", tone: "bg-card text-foreground" };
  return null;
}

export function ProductCard({ product }: { product: CardProduct }) {
  const { isWished, toggleWish, add } = useCart();
  const wished = isWished(product._id);
  const badge = badgeFor(product);
  const onSale = !!product.compareAtCents && product.compareAtCents > product.priceCents;
  const sizes = sortSizes(product.variants.map((v) => v.size));
  const variantFor = (size: string) => product.variants.find((v) => v.size === size);
  const inStock = product.variants.filter((v) => v.stock > 0);

  function quickAdd(size: string) {
    const v = variantFor(size);
    if (!v || v.stock <= 0) return;
    add({
      variantId: v._id,
      productId: product._id,
      slug: product.slug,
      name: product.name,
      size: v.size,
      maxQuantity: v.stock,
      priceCents: product.priceCents,
      tint: product.tint,
      imageUrl: product.imageUrl ?? null,
      category: product.category.slug,
    });
  }

  return (
    <div className="group relative">
      <div className="relative overflow-hidden bg-soft">
        <Link href={`/products/${product.slug}`} tabIndex={-1} aria-hidden>
          <ProductImage
            imageUrl={product.imageUrl}
            hoverUrl={product.photos?.[1]}
            tint={product.tint}
            category={product.category.slug}
            name={product.name}
            className={product.photos?.[1] ? "" : "transition duration-500 group-hover:scale-[1.03]"}
          />
        </Link>
        {badge && (
          <span className={`absolute left-3 top-3 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] ${badge.tone}`}>
            {badge.text}
          </span>
        )}
        <button
          type="button"
          onClick={() =>
            toggleWish({
              productId: product._id,
              slug: product.slug,
              name: product.name,
              priceCents: product.priceCents,
              tint: product.tint,
              imageUrl: product.imageUrl ?? null,
              category: product.category.slug,
            })
          }
          aria-label={wished ? `Remove ${product.name} from favourites` : `Save ${product.name} to favourites`}
          aria-pressed={wished}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-paper/80 text-ink transition hover:scale-110"
        >
          <HeartIcon width={18} height={18} filled={wished} className={wished ? "text-sale" : ""} />
        </button>

        {/* Quick add: pick a size straight from the grid (desktop hover) */}
        {inStock.length > 0 && (
          <div className="absolute inset-x-0 bottom-0 hidden translate-y-2 bg-card/95 p-3 opacity-0 backdrop-blur transition group-hover:translate-y-0 group-hover:opacity-100 md:block">
            {product.condition ? (
              <button type="button" onClick={() => quickAdd(inStock[0].size)} className="w-full py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] hover:underline">
                Add to bag · Size {inStock[0].size}
              </button>
            ) : (
              <>
                <div className="mb-2 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-muted">Quick add</div>
                <div className="flex flex-wrap justify-center gap-1">
                  {sizes.map((s) => {
                    const v = variantFor(s);
                    const out = !v || v.stock <= 0;
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={out}
                        onClick={() => quickAdd(s)}
                        className="min-w-9 border border-line px-2 py-1.5 text-[11px] hover:border-foreground disabled:cursor-not-allowed disabled:text-muted disabled:line-through"
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1">
        <Link href={`/products/${product.slug}`} className="block text-[13px] leading-snug hover:underline">
          {product.name}
        </Link>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted">
          {product.condition
            ? `Thrifted · ${CONDITIONS[product.condition].label} · Size ${sizes[0]}`
            : `${product.category.name} · ${sizes.length > 1 ? `${sizes[0]}–${sizes[sizes.length - 1]}` : sizes[0] ?? ""}`}
        </div>
        <div className="flex items-baseline gap-2 pt-1 text-[13px]">
          <span className={onSale ? "text-sale" : ""}>{formatMoney(product.priceCents)}</span>
          {onSale && <span className="text-muted line-through">{formatMoney(product.compareAtCents!)}</span>}
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="aspect-[4/5] animate-pulse bg-soft" />
          <div className="mt-3 h-4 w-2/3 animate-pulse bg-soft" />
          <div className="mt-2 h-4 w-1/3 animate-pulse bg-soft" />
        </div>
      ))}
    </div>
  );
}
