import Link from "next/link";
import { Suspense } from "react";
import { getBestsellers, getCategories } from "@/lib/catalog";
import { ProductCard, ProductGridSkeleton } from "@/components/product-card";
import { EditorialPhoto } from "@/components/editorial-photo";
import { DropCountdown } from "@/components/drop-countdown";
import { BeadBand } from "@/components/bead-band";
import { BeadCollar, BeadLabel, BeadRow, ShukaStripe } from "@/components/tribal";
import { media } from "@/lib/media";
import { formatMoney, site } from "@/lib/site";

// A deliberately quiet home page: one hero, one story, a short edit of four
// pieces, the thrift drop, and plain category links. No product walls.

// Featured products = what customers buy most (see catalog.bestsellers)
async function FeaturedProducts() {
  const products = await getBestsellers(4);
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}

async function CategoryIndex() {
  const categories = await getCategories();
  return (
    <ul className="divide-y divide-line border-y border-line">
      {categories.map((c, i) => (
        <li key={c._id}>
          <Link href={`/shop?category=${c.slug}`} className="group flex items-baseline justify-between gap-6 py-5 sm:py-6">
            <span className="flex items-baseline gap-6">
              <span className="w-8 text-[11px] tracking-[0.2em] text-muted">{String(i + 1).padStart(2, "0")}</span>
              <span className="display text-3xl transition group-hover:translate-x-2 group-hover:italic sm:text-5xl">{c.name}</span>
            </span>
            <span className="eyebrow transition group-hover:text-foreground">Shop</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

const FAQ = [
  ["How do I pay?", "M-Pesa or card at checkout (secured by Paystack), or Pay on Delivery: pay the rider by M-Pesa or cash."],
  ["How long does delivery take?", "Nairobi: same or next day, Ksh 300 (order before 2pm for same day). Kiambu, Machakos, Kajiado and Murang'a: 1–2 days, Ksh 400. Rest of Kenya: 2–4 days, Ksh 600. Free over Ksh 10,000."],
  ["What does “thrifted” mean here?", "Pre-loved pieces we hand-pick, clean and grade. Each is one of one, listed with its condition, real photos and measurements."],
  ["How do I know my size?", "Every product has a size guide, and thrifted pieces list measurements taken flat. Still unsure? Send us your height and usual size on WhatsApp."],
  ["Can I return or exchange?", "Unworn items with tags can be exchanged or returned within 14 days. Message us your order number and we'll arrange pickup."],
] as const;

export default function HomePage() {
  return (
    <>
      {/* Hero: one full-screen landscape photo with the name across it */}
      <section className="relative h-[calc(100svh-130px)] min-h-[520px] overflow-hidden">
        {media.campaign.src ? (
          <>
            <EditorialPhoto photo={media.campaign} priority className="absolute inset-0 hidden h-full w-full object-[center_75%] sm:block" />
            <EditorialPhoto photo={media.campaignMobile} priority className="absolute inset-0 h-full w-full object-[center_30%] sm:hidden" />
          </>
        ) : (
          // Red-earth backdrop until the campaign photo is set
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, #c98a5c 0%, #a9623a 42%, #8c4a2a 62%, #c9b08a 63%, #b89c76 100%)",
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
        <div className="relative flex h-full flex-col items-center justify-between px-4 pb-12 pt-10 text-center text-white sm:pb-16 sm:pt-14">
          <h1 className="display pl-[0.3em] text-[18vw] font-medium leading-[0.8] tracking-[0.25em] sm:text-[17vw] sm:tracking-[0.3em] xl:text-[240px]">
            {site.name}
          </h1>
          <div className="flex flex-col items-center gap-5">
            <p className="eyebrow text-white/80">Campaign · Ardhi</p>
            <Link href="/shop" className="btn-light">
              Shop the collection
            </Link>
          </div>
        </div>
      </section>

      {/* Service line */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-8">
        <ul className="flex flex-wrap justify-center gap-x-10 gap-y-2 py-6 text-[11px] uppercase tracking-[0.25em] text-muted">
          <li>Lipa na M-Pesa</li>
          <li>Pay on delivery</li>
          <li>Same-day Nairobi</li>
          <li>Free delivery over {formatMoney(site.freeShippingThresholdCents)}</li>
        </ul>
      </section>

      {/* Weekly thrift drop: full-bleed photo with the text over it */}
      <section className="mt-10 bg-earth text-paper">
        <BeadBand />
        <BeadBand className="opacity-60" />
        <div className="relative min-h-[560px] overflow-hidden md:min-h-[78vh]">
          {/* Wide landscape on desktop, tall portrait on phones */}
          <EditorialPhoto photo={media.thriftWide} className="absolute inset-0 hidden h-full w-full object-[center_85%] md:block" />
          <EditorialPhoto photo={media.thrift} className="absolute inset-0 h-full w-full object-[70%_25%] md:hidden" />
          {/* Fade from the left (and bottom on phones) so the text stays readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 md:bg-gradient-to-r md:from-black/80 md:via-black/45 md:to-transparent" />
          {/* Shuka check draped down the left edge */}
          <ShukaStripe className="absolute inset-y-0 left-0 w-3 sm:w-5 lg:w-8" />
          <div className="relative mx-auto flex min-h-[560px] max-w-[1440px] flex-col justify-end px-4 py-14 sm:px-8 md:min-h-[78vh] md:justify-center">
            <div className="max-w-md pl-4 sm:pl-6 lg:max-w-xl lg:pl-10">
              <BeadCollar size={88} className="mb-6 drop-shadow-lg sm:size-[104px]" />
              <p className="eyebrow text-paper/70">Weekly thrift drop · One of one</p>
              <h2 className="display mt-3 text-4xl sm:text-6xl lg:text-7xl">
                New finds land <em>{site.thriftDrop.label.toLowerCase()}</em>
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-paper/80 lg:text-base">
                Hand-picked, cleaned and graded. When it&apos;s gone, it&apos;s gone.
              </p>
              <BeadRow className="mt-6" />
              <div className="mt-6">
                <DropCountdown />
              </div>
              <Link href="/shop?thrifted=1" className="btn-light mt-8">
                Shop thrifted
              </Link>
            </div>
          </div>
        </div>
        <BeadBand className="opacity-60" />
        <BeadBand />
      </section>

      {/* Featured products: the most-bought pieces */}
      <section className="mx-auto mt-24 max-w-[1440px] px-4 sm:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <BeadLabel>Frequently bought</BeadLabel>
            <h2 className="display mt-3 text-4xl sm:text-5xl">Featured Products</h2>
          </div>
          <Link href="/shop" className="eyebrow text-foreground underline underline-offset-8">
            Shop all
          </Link>
        </div>
        <Suspense fallback={<ProductGridSkeleton count={4} />}>
          <FeaturedProducts />
        </Suspense>
      </section>

      {/* Category index */}
      <section className="mx-auto mt-28 max-w-[1440px] px-4 sm:px-8">
        <BeadLabel className="mb-6">Shop by category</BeadLabel>
        <Suspense fallback={<div className="h-80 animate-pulse bg-soft" />}>
          <CategoryIndex />
        </Suspense>
      </section>

      {/* FAQ */}
      <section className="mx-auto mt-28 grid max-w-[1440px] gap-10 px-4 sm:px-8 lg:grid-cols-[1fr_2fr]">
        <div>
          <BeadLabel>Maswali</BeadLabel>
          <h2 className="display mt-3 text-5xl">Questions?</h2>
          <p className="mt-4 text-muted">We reply fast on WhatsApp, 8am – 7pm.</p>
          <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-6">
            Chat on WhatsApp
          </a>
        </div>
        <div className="border-t border-line">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group border-b border-line py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-2xl">
                {q}
                <span className="font-sans text-xl font-light transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
