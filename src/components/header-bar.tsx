"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { BagIcon, ChevronIcon, CloseIcon, HeartIcon, MenuIcon, SearchIcon } from "@/components/icons";
import { site } from "@/lib/site";
import { ThemeToggle } from "@/components/theme-toggle";

type Cat = { name: string; slug: string };

const CLOTHING = ["shirts", "t-shirts", "knitwear", "trousers", "jackets"];

export function HeaderBar({ categories }: { categories: Cat[] }) {
  const { count, wishlist, ready, setDrawerOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const router = useRouter();

  const clothing = categories.filter((c) => CLOTHING.includes(c.slug));
  const other = categories.filter((c) => !CLOTHING.includes(c.slug));

  // Lock page scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();
    setSearchOpen(false);
    setMenuOpen(false);
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  }

  const navLink = "py-6 text-[11px] font-medium uppercase tracking-[0.2em] hover:text-muted";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/95 backdrop-blur">
      <div className="relative mx-auto grid h-20 max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-8">
        {/* Left: menu (mobile) / main nav (desktop) */}
        <div className="flex items-center">
          <button className="-ml-2 p-2 lg:hidden" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <MenuIcon />
          </button>
          <nav className="hidden items-center gap-7 lg:flex" onMouseLeave={() => setMegaOpen(false)}>
            <Link href="/shop?sort=newest" className={navLink}>
              New In
            </Link>
            <button className={navLink} onMouseEnter={() => setMegaOpen(true)} onClick={() => setMegaOpen((o) => !o)} aria-expanded={megaOpen}>
              Shop
            </button>
            <Link href="/shop?thrifted=1" className={navLink}>
              Thrifted
            </Link>
            <Link href="/shop?sale=1" className={`${navLink} text-sale`}>
              Sale
            </Link>

            {megaOpen && (
              <div className="absolute inset-x-0 top-full border-b border-line bg-background">
                <div className="mx-auto grid max-w-[1440px] grid-cols-4 gap-10 px-8 py-12">
                  <div>
                    <div className="eyebrow">Clothing</div>
                    <ul className="mt-4 space-y-3 text-[15px]">
                      {clothing.map((c) => (
                        <li key={c.slug}>
                          <Link href={`/shop?category=${c.slug}`} onClick={() => setMegaOpen(false)} className="hover:text-muted">
                            {c.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="eyebrow">Shoes &amp; more</div>
                    <ul className="mt-4 space-y-3 text-[15px]">
                      {other.map((c) => (
                        <li key={c.slug}>
                          <Link href={`/shop?category=${c.slug}`} onClick={() => setMegaOpen(false)} className="hover:text-muted">
                            {c.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="eyebrow">Shop by price</div>
                    <ul className="mt-4 space-y-3 text-[15px]">
                      {[
                        ["under-1000", "Under Ksh 1,000"],
                        ["under-2000", "Under Ksh 2,000"],
                        ["under-5000", "Under Ksh 5,000"],
                        ["under-10000", "Under Ksh 10,000"],
                      ].map(([v, l]) => (
                        <li key={v}>
                          <Link href={`/shop?price=${v}`} onClick={() => setMegaOpen(false)} className="hover:text-muted">
                            {l}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href="/shop?thrifted=1"
                    onClick={() => setMegaOpen(false)}
                    className="flex flex-col justify-end bg-earth p-6 text-paper"
                  >
                    <span className="eyebrow text-paper/60">One of one</span>
                    <span className="display mt-2 text-4xl italic">The thrift edit</span>
                  </Link>
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* Centre: the wordmark */}
        <Link href="/" aria-label={`${site.name} home`} className="text-center leading-none">
          <span className="display block pl-[0.4em] text-[34px] font-medium tracking-[0.4em] sm:text-[44px]">{site.name}</span>
          <span className="mt-1 hidden items-center justify-center gap-2 text-[9px] uppercase tracking-[0.45em] text-muted sm:flex">
            Mavazi
            <span aria-hidden className="flex gap-[3px]">
              <i className="block h-[5px] w-[5px] rotate-45 bg-sale" />
              <i className="block h-[5px] w-[5px] rotate-45 bg-accent" />
              <i className="block h-[5px] w-[5px] rotate-45 bg-bead" />
            </span>
            Nairobi
          </span>
        </Link>

        {/* Right: actions */}
        <div className="flex items-center justify-end gap-1">
          <ThemeToggle className="hidden sm:block" />
          <button className="p-2 hover:text-muted" aria-label="Search" onClick={() => setSearchOpen((o) => !o)}>
            <SearchIcon width={20} height={20} />
          </button>
          <Link href="/wishlist" className="relative hidden p-2 hover:text-muted sm:block" aria-label="Favourites">
            <HeartIcon width={20} height={20} />
            {ready && wishlist.length > 0 && <Badge n={wishlist.length} />}
          </Link>
          <button className="relative p-2 hover:text-muted" aria-label="Open bag" onClick={() => setDrawerOpen(true)}>
            <BagIcon width={20} height={20} />
            {ready && count > 0 && <Badge n={count} />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-line bg-background">
          <form onSubmit={onSearch} className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
            <SearchIcon className="shrink-0 text-muted" />
            <input
              name="q"
              autoFocus
              placeholder="Search shirts, jeans, boots…"
              className="w-full bg-transparent py-2 text-lg outline-none"
              aria-label="Search products"
            />
            <button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)}>
              <CloseIcon />
            </button>
          </form>
        </div>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col overflow-y-auto bg-background p-6">
            <div className="flex items-center justify-between">
              <span className="display pl-[0.4em] text-3xl font-medium tracking-[0.4em]">{site.name}</span>
              <button aria-label="Close menu" onClick={() => setMenuOpen(false)}>
                <CloseIcon />
              </button>
            </div>
            <form onSubmit={onSearch} className="mt-6">
              <input name="q" placeholder="Search" className="input" aria-label="Search products" />
            </form>
            <nav className="mt-6 flex flex-col font-display text-3xl">
              {[
                { href: "/shop?sort=newest", label: "New In" },
                { href: "/shop", label: "Shop All" },
                { href: "/shop?thrifted=1", label: "Thrifted" },
                ...categories.map((c) => ({ href: `/shop?category=${c.slug}`, label: c.name })),
                { href: "/shop?sale=1", label: "Sale" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-between py-3 ${l.label === "Sale" ? "text-sale" : ""}`}
                >
                  {l.label}
                  <ChevronIcon className="text-muted" />
                </Link>
              ))}
            </nav>
            <div className="mt-auto space-y-3 border-t border-line pt-6 text-sm text-muted">
              <Link href="/wishlist" onClick={() => setMenuOpen(false)} className="flex items-center gap-3">
                <HeartIcon /> Favourites
              </Link>
              <div className="flex items-center gap-1">
                <ThemeToggle className="-ml-2" /> Light / dark mode
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background">
      {n}
    </span>
  );
}
