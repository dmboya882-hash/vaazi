"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { ProductImage } from "@/components/product-image";
import { FreeShippingBar } from "@/components/cart-drawer";
import { HeartIcon } from "@/components/icons";
import { deliveryFor, formatMoney } from "@/lib/site";

export default function CartPage() {
  const { items, ready, subtotalCents, setQuantity, remove, toggleWish, isWished } = useCart();
  const delivery = deliveryFor(subtotalCents, "Nairobi");

  if (!ready) return <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-8">Loading bag…</div>;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 pt-20 text-center sm:px-8">
        <h1 className="display text-5xl">Your bag is empty</h1>
        <p className="mt-3 text-muted">Find something you love.</p>
        <Link href="/shop" className="btn mt-8">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-8">
      <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
        <div>
          <h1 className="display text-5xl">Bag</h1>
          <div className="mt-6 bg-soft p-4">
            <FreeShippingBar subtotalCents={subtotalCents} />
          </div>
          <ul className="mt-2 divide-y divide-line">
            {items.map((item) => (
              <li key={item.variantId} className="flex gap-5 py-6">
                <Link href={`/products/${item.slug}`} className="w-28 shrink-0 bg-soft sm:w-36">
                  <ProductImage imageUrl={item.imageUrl} tint={item.tint} category={item.category} name={item.name} />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link href={`/products/${item.slug}`} className="text-[15px] font-medium">
                        {item.name}
                      </Link>
                      <p className="mt-1 text-[15px] text-muted">Size {item.size}</p>
                    </div>
                    <div className="text-[15px] font-medium">{formatMoney(item.priceCents * item.quantity)}</div>
                  </div>
                  <div className="mt-auto flex items-center gap-5 pt-4">
                    <div className="flex items-center border border-line">
                      <button className="px-3.5 py-1.5" aria-label="Decrease quantity" onClick={() => setQuantity(item.variantId, item.quantity - 1)}>
                        −
                      </button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button className="px-3.5 py-1.5 disabled:opacity-30" aria-label="Increase quantity" disabled={item.quantity >= (item.maxQuantity ?? 20)} onClick={() => setQuantity(item.variantId, item.quantity + 1)}>
                        +
                      </button>
                    </div>
                    <button
                      aria-label="Move to favourites"
                      onClick={() => {
                        const { productId } = item;
                        if (!isWished(productId)) {
                          toggleWish({ productId, slug: item.slug, name: item.name, priceCents: item.priceCents, tint: item.tint, imageUrl: item.imageUrl, category: item.category });
                        }
                        remove(item.variantId);
                      }}
                      className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
                    >
                      <HeartIcon width={18} height={18} /> Save for later
                    </button>
                    <button className="text-sm text-muted underline hover:text-foreground" onClick={() => remove(item.variantId)}>
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <aside className="h-fit lg:sticky lg:top-24">
          <h2 className="text-2xl font-medium">Summary</h2>
          <dl className="mt-6 space-y-3 text-[15px]">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatMoney(subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Delivery</dt>
              <dd className="text-right">
                {delivery.cents === 0 ? "Free" : `From ${formatMoney(delivery.cents)}`}
                <span className="block text-xs text-muted">Calculated by county at checkout</span>
              </dd>
            </div>
            <div className="flex justify-between border-y border-line py-4 font-medium">
              <dt>Estimated total</dt>
              <dd>{formatMoney(subtotalCents + delivery.cents)}</dd>
            </div>
          </dl>
          <Link href="/checkout" className="btn mt-6 w-full py-5 text-base">
            Checkout
          </Link>
          <p className="mt-4 text-center text-xs text-muted">M-Pesa · Visa · Mastercard · Pay on delivery</p>
        </aside>
      </div>
    </div>
  );
}
