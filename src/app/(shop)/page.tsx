import Link from "next/link";
import { Suspense } from "react";
import { getCategories, getFeaturedProducts } from "@/lib/catalog";
import { ProductCard, ProductGridSkeleton } from "@/components/product-card";
import { EditorialPhoto } from "@/components/editorial-photo";
import { DropCountdown } from "@/components/drop-countdown";
import { BeadBand } from "@/components/bead-band";
import { media } from "@/lib/media";
import { formatMoney, site } from "@/lib/site";

// A deliberately quiet home page: one hero, one story, a short edit of four
// pieces, the thrift drop, and plain category links. No product walls.

async function TheEdit() {
  const products = (await getFeaturedProducts()).slice(0, 4);
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

      {/* The edit: four pieces only */}
      <section className="mx-auto mt-16 max-w-[1440px] px-4 sm:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Curated</p>
            <h2 className="display mt-3 text-4xl sm:text-5xl">The Edit</h2>
          </div>
          <Link href="/shop" className="eyebrow text-foreground underline underline-offset-8">
            Shop all
          </Link>
        </div>
        <Suspense fallback={<ProductGridSkeleton count={4} />}>
          <TheEdit />
        </Suspense>
      </section>

      {/* Weekly thrift drop */}
      <section className="mt-28 bg-earth text-paper">
        <BeadBand />
        <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-20 sm:px-8 md:grid-cols-2 md:items-center">
          <EditorialPhoto photo={media.thrift} className="aspect-[4/5] w-full bg-white/5 md:order-2" />
          <div>
            <p className="eyebrow text-paper/60">Weekly thrift drop · One of one</p>
            <h2 className="display mt-4 text-5xl sm:text-7xl">
              New finds land <em>{site.thriftDrop.label.toLowerCase()}</em>
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-paper/70">
              Hand-picked from bales and closets, cleaned, repaired and honestly graded. Every piece is the only one.
              When it&apos;s gone, it&apos;s gone.
            </p>
            <div className="mt-8">
              <DropCountdown />
            </div>
            <ol className="mt-10 grid grid-cols-2 gap-6 border-t border-white/15 pt-8 text-sm sm:grid-cols-4">
              {["Sourced", "Cleaned", "Graded", "Delivered"].map((t, i) => (
                <li key={t}>
                  <span className="text-[11px] tracking-[0.2em] text-paper/50">0{i + 1}</span>
                  <div className="mt-1 font-display text-xl">{t}</div>
                </li>
              ))}
            </ol>
            <Link href="/shop?thrifted=1" className="btn-light mt-10">
              Shop thrifted
            </Link>
          </div>
        </div>
        <BeadBand />
      </section>

      {/* Category index */}
      <section className="mx-auto mt-28 max-w-[1440px] px-4 sm:px-8">
        <p className="eyebrow mb-6">Shop by category</p>
        <Suspense fallback={<div className="h-80 animate-pulse bg-soft" />}>
          <CategoryIndex />
        </Suspense>
      </section>

      {/* FAQ */}
      <section className="mx-auto mt-28 grid max-w-[1440px] gap-10 px-4 sm:px-8 lg:grid-cols-[1fr_2fr]">
        <div>
          <p className="eyebrow">Maswali</p>
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
