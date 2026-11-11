"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { CloseIcon, HeartIcon } from "@/components/icons";
import { formatMoney } from "@/lib/site";

type Variant = { _id: string; size: string; stock: number };

const SIZE_GUIDES: Record<string, { head: string[]; rows: string[][]; note: string }> = {
  tops: {
    head: ["Size", "Chest (cm)", "Waist (cm)", "Length (cm)"],
    rows: [
      ["S", "92–97", "78–83", "70"],
      ["M", "98–103", "84–89", "72"],
      ["L", "104–109", "90–95", "74"],
      ["XL", "110–116", "96–102", "76"],
      ["XXL", "117–123", "103–109", "78"],
    ],
    note: "Measure around the fullest part of your chest. Between sizes? Size up for a relaxed fit.",
  },
  trousers: {
    head: ["Waist (in)", "Waist (cm)", "Hip (cm)", "Inside leg (cm)"],
    rows: [
      ["30", "76", "94", "81"],
      ["32", "81", "99", "81"],
      ["34", "86", "104", "82"],
      ["36", "91", "109", "82"],
      ["38", "97", "114", "83"],
    ],
    note: "Measure around your natural waistline, where you normally wear your trousers.",
  },
  shoes: {
    head: ["EU", "UK", "US", "Foot length (cm)"],
    rows: [
      ["40", "6.5", "7", "25.5"],
      ["41", "7", "8", "26"],
      ["42", "8", "9", "27"],
      ["43", "9", "10", "27.5"],
      ["44", "9.5", "10.5", "28.5"],
      ["45", "10.5", "11.5", "29"],
    ],
    note: "Stand on paper and measure heel to longest toe. Our boots fit true to size.",
  },
};

function guideFor(category: string) {
  if (category === "shoes") return SIZE_GUIDES.shoes;
  if (category === "trousers" || category === "accessories") return SIZE_GUIDES.trousers;
  return SIZE_GUIDES.tops;
}

export function AddToCart({
  product,
  variants,
  sizes,
  whatsapp,
}: {
  product: { _id: string; slug: string; name: string; priceCents: number; tint: string; imageUrl: string | null; category: string; thrifted: boolean };
  variants: Variant[];
  sizes: string[];
  whatsapp: string;
}) {
  const { add, isWished, toggleWish } = useCart();
  const [size, setSize] = useState<string | null>(sizes.length === 1 ? sizes[0] : null);
  const [needSize, setNeedSize] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const wished = isWished(product._id);

  const bySize = useMemo(() => new Map(variants.map((v) => [v.size, v])), [variants]);
  const selected = size ? bySize.get(size) : undefined;
  const soldOut = !variants.some((v) => v.stock > 0);
  const guide = guideFor(product.category);

  function handleAdd() {
    if (!selected || selected.stock <= 0) {
      setNeedSize(true);
      return;
    }
    add({
      variantId: selected._id,
      productId: product._id,
      slug: product.slug,
      name: product.name,
      size: selected.size,
      maxQuantity: selected.stock,
      priceCents: product.priceCents,
      tint: product.tint,
      imageUrl: product.imageUrl,
      category: product.category,
    });
  }

  return (
    <div className="space-y-7">
      <div>
        <div className="flex items-center justify-between text-[15px]">
          <span className={needSize && !size ? "font-medium text-sale" : "font-medium"}>
            {product.thrifted ? "Size (one available)" : "Select size"}
          </span>
          <button type="button" className="text-muted underline underline-offset-4 hover:text-foreground" onClick={() => setGuideOpen(true)}>
            Size guide
          </button>
        </div>
        <div className={`mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 ${needSize && !size ? "rounded outline outline-1 outline-sale" : ""}`}>
          {sizes.map((s) => {
            const v = bySize.get(s);
            const out = !v || v.stock <= 0;
            return (
              <button
                key={s}
                type="button"
                disabled={out}
                onClick={() => {
                  setSize(s);
                  setNeedSize(false);
                }}
                className={`border py-3.5 text-[13px] transition ${
                  size === s ? "border-foreground ring-1 ring-foreground" : "border-line hover:border-foreground"
                } disabled:cursor-not-allowed disabled:bg-soft disabled:text-muted disabled:line-through`}
              >
                {s}
              </button>
            );
          })}
        </div>
        {needSize && !size && <p className="mt-2 text-sm text-sale">Please select a size.</p>}
        {!product.thrifted && selected && selected.stock > 0 && selected.stock <= 3 && (
          <p className="mt-2 text-sm font-medium text-sale">Hurry, only {selected.stock} left in this size</p>
        )}
      </div>

      <div className="space-y-3">
        <button type="button" className="btn w-full py-5 text-base" disabled={soldOut} onClick={handleAdd}>
          {soldOut ? (product.thrifted ? "Sold – this piece found a home" : "Sold out") : "Add to bag"}
        </button>
        {!soldOut && (
          <button
            type="button"
            onClick={() => {
              // Built on click so the message includes the page link.
              const text = `Hi! I'd like to order: ${product.name}${size ? `, size ${size}` : ""} (${formatMoney(product.priceCents)}). ${window.location.href}`;
              window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
            }}
            className="btn-whatsapp w-full py-5 text-base"
          >
            Order on WhatsApp
          </button>
        )}
        <button
          type="button"
          className="btn-outline w-full py-5 text-base"
          aria-pressed={wished}
          onClick={() =>
            toggleWish({
              productId: product._id,
              slug: product.slug,
              name: product.name,
              priceCents: product.priceCents,
              tint: product.tint,
              imageUrl: product.imageUrl,
              category: product.category,
            })
          }
        >
          {wished ? "Saved" : "Favourite"} <HeartIcon width={20} height={20} filled={wished} className={wished ? "text-sale" : ""} />
        </button>
      </div>

      {guideOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-label="Size guide">
          <div className="absolute inset-0 bg-black/40" onClick={() => setGuideOpen(false)} />
          <div className="relative w-full max-w-lg bg-background p-6">
            <div className="flex items-center justify-between">
              <h3 className="display text-3xl">Size guide</h3>
              <button aria-label="Close size guide" onClick={() => setGuideOpen(false)}>
                <CloseIcon />
              </button>
            </div>
            <table className="mt-5 w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  {guide.head.map((h) => (
                    <th key={h} className="py-2 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guide.rows.map((r) => (
                  <tr key={r[0]} className="border-b border-line">
                    {r.map((c, i) => (
                      <td key={i} className={`py-2 ${i === 0 ? "font-medium" : "text-muted"}`}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-sm text-muted">{guide.note}</p>
          </div>
        </div>
      )}
    </div>
  );
}
