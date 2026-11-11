"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/components/cart-provider";
import { ProductImage } from "@/components/product-image";
import { CloseIcon } from "@/components/icons";
import { formatMoney, site } from "@/lib/site";

export function FreeShippingBar({ subtotalCents }: { subtotalCents: number }) {
  const remaining = site.freeShippingThresholdCents - subtotalCents;
  const pct = Math.min(100, (subtotalCents / site.freeShippingThresholdCents) * 100);
  return (
    <div>
      <p className="text-sm">
        {remaining > 0 ? (
          <>
            You’re <strong>{formatMoney(remaining)}</strong> away from free shipping
          </>
        ) : (
          <strong>You’ve unlocked free shipping!</strong>
        )}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-soft">
        <div className="h-full rounded-full bg-foreground transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function CartDrawer() {
  const { drawerOpen, setDrawerOpen, items, subtotalCents, setQuantity, remove, count } = useCart();
  // Close on Escape, and whenever a link inside the drawer is followed.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, setDrawerOpen]);

  return (
    <div className={`fixed inset-0 z-50 ${drawerOpen ? "" : "pointer-events-none"}`} aria-hidden={!drawerOpen}>
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${drawerOpen ? "opacity-100" : "opacity-0"}`}
        onClick={() => setDrawerOpen(false)}
      />
      <aside
        onClick={(e) => (e.target as HTMLElement).closest("a") && setDrawerOpen(false)}
        role="dialog"
        aria-label="Shopping bag"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-background shadow-xl transition-transform duration-300 ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="display text-3xl">Bag ({count})</h2>
          <button aria-label="Close bag" onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="text-muted">Your bag is empty.</p>
            <Link href="/shop" className="btn">
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-line px-6 py-4">
              <FreeShippingBar subtotalCents={subtotalCents} />
            </div>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4 py-5">
                  <Link href={`/products/${item.slug}`} className="w-20 shrink-0 bg-soft">
                    <ProductImage imageUrl={item.imageUrl} tint={item.tint} category={item.category} name={item.name} />
                  </Link>
                  <div className="flex flex-1 flex-col text-sm">
                    <div className="flex justify-between gap-3">
                      <Link href={`/products/${item.slug}`} className="font-medium">
                        {item.name}
                      </Link>
                      <span>{formatMoney(item.priceCents * item.quantity)}</span>
                    </div>
                    <span className="mt-1 text-muted">
                      Size {item.size}
                    </span>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-line">
                        <button className="px-3 py-1" aria-label="Decrease quantity" onClick={() => setQuantity(item.variantId, item.quantity - 1)}>
                          −
                        </button>
                        <span className="w-5 text-center">{item.quantity}</span>
                        <button className="px-3 py-1 disabled:opacity-30" aria-label="Increase quantity" disabled={item.quantity >= (item.maxQuantity ?? 20)} onClick={() => setQuantity(item.variantId, item.quantity + 1)}>
                          +
                        </button>
                      </div>
                      <button className="text-xs text-muted underline" onClick={() => remove(item.variantId)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-3 border-t border-line px-6 py-5">
              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span>{formatMoney(subtotalCents)}</span>
              </div>
              <p className="text-xs text-muted">Delivery calculated by county at checkout.</p>
              <Link href="/checkout" className="btn w-full">
                Checkout
              </Link>
              <Link href="/cart" className="btn-outline w-full">
                View bag
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
