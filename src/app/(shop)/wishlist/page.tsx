"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { ProductImage } from "@/components/product-image";
import { HeartIcon } from "@/components/icons";
import { formatMoney } from "@/lib/site";

export default function WishlistPage() {
  const { wishlist, ready, toggleWish } = useCart();

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-10 sm:px-8">
      <h1 className="display text-5xl">Favourites</h1>
      {!ready ? null : wishlist.length === 0 ? (
        <div className="mt-10 bg-soft p-16 text-center">
          <HeartIcon className="mx-auto" width={32} height={32} />
          <p className="mt-4 text-lg font-medium">Nothing saved yet</p>
          <p className="mt-1 text-muted">Tap the heart on any product to save it here.</p>
          <Link href="/shop" className="btn mt-6">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {wishlist.map((w) => (
            <div key={w.productId} className="relative">
              <Link href={`/products/${w.slug}`} className="block bg-soft">
                <ProductImage imageUrl={w.imageUrl} tint={w.tint} category={w.category} name={w.name} />
              </Link>
              <button
                onClick={() => toggleWish(w)}
                aria-label={`Remove ${w.name} from favourites`}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-paper/80 text-ink"
              >
                <HeartIcon width={18} height={18} filled className="text-sale" />
              </button>
              <Link href={`/products/${w.slug}`} className="mt-3 block text-[15px] font-medium hover:underline">
                {w.name}
              </Link>
              <div className="mt-1 text-[15px]">{formatMoney(w.priceCents)}</div>
              <Link href={`/products/${w.slug}`} className="btn-outline mt-3 w-full py-2.5">
                Select size
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
