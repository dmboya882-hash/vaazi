"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  size: string;
  priceCents: number;
  tint: string;
  imageUrl: string | null;
  category: string;
  // How many are in stock (1 for thrifted pieces); caps the quantity
  maxQuantity: number;
  quantity: number;
};

export type WishItem = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  tint: string;
  imageUrl: string | null;
  category: string;
};

type StoreContextValue = {
  ready: boolean;
  // cart
  items: CartItem[];
  count: number;
  subtotalCents: number;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  // slide-out cart drawer
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  // wishlist
  wishlist: WishItem[];
  isWished: (productId: string) => boolean;
  toggleWish: (item: WishItem) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);
const CART_KEY = "cart:v1";
const WISH_KEY = "wishlist:v1";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishItem[]>([]);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Restore saved cart and wishlist once on mount.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setItems(load(CART_KEY, []));
    setWishlist(load(WISH_KEY, []));
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (ready) save(CART_KEY, items);
  }, [items, ready]);
  useEffect(() => {
    if (ready) save(WISH_KEY, wishlist);
  }, [wishlist, ready]);

  const add = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      if (existing) {
        return prev.map((i) =>
          i.variantId === item.variantId ? { ...i, quantity: Math.min(i.quantity + quantity, item.maxQuantity, 20) } : i,
        );
      }
      return [...prev, { ...item, quantity: Math.min(quantity, item.maxQuantity) }];
    });
    setDrawerOpen(true);
  }, []);

  const setQuantity = useCallback((variantId: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.variantId !== variantId)
        : prev.map((i) => (i.variantId === variantId ? { ...i, quantity: Math.min(quantity, i.maxQuantity ?? 20, 20) } : i)),
    );
  }, []);

  const remove = useCallback((variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const isWished = useCallback((id: string) => wishlist.some((w) => w.productId === id), [wishlist]);
  const toggleWish = useCallback((item: WishItem) => {
    setWishlist((prev) =>
      prev.some((w) => w.productId === item.productId)
        ? prev.filter((w) => w.productId !== item.productId)
        : [item, ...prev],
    );
  }, []);

  const value = useMemo(
    () => ({
      ready,
      items,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotalCents: items.reduce((n, i) => n + i.quantity * i.priceCents, 0),
      add,
      setQuantity,
      remove,
      clear,
      drawerOpen,
      setDrawerOpen,
      wishlist,
      isWished,
      toggleWish,
    }),
    [ready, items, add, setQuantity, remove, clear, drawerOpen, wishlist, isWished, toggleWish],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useCart() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
