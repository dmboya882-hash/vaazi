"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";

export function CartLink() {
  const { count, ready } = useCart();
  return (
    <Link href="/cart" className="flex items-center gap-2 hover:text-muted">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M6 7h12l-1 13H7L6 7Z" />
        <path d="M9 7a3 3 0 0 1 6 0" />
      </svg>
      <span>Cart{ready && count > 0 ? ` (${count})` : ""}</span>
    </Link>
  );
}
