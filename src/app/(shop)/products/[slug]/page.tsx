import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts, type ProductWithCard } from "@/lib/catalog";
import { ProductGallery } from "@/components/product-gallery";
import { ProductGridSkeleton } from "@/components/product-card";
import { ProductRail } from "@/components/product-rail";
import { AddToCart } from "@/components/add-to-cart";
import { CONDITIONS, formatMoney, site, sortSizes } from "@/lib/site";
import { BeadLabel, BeadRow } from "@/components/tribal";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? "Product", description: product?.description };
}

async function Related({ productId }: { productId: ProductWithCard["_id"] }) {
  const related = await getRelatedProducts(productId);
  if (related.length === 0) return null;
  return (
    <section className="mt-24">
      <BeadLabel>Complete the look</BeadLabel>
      <h2 className="display mb-8 mt-3 text-4xl sm:text-5xl">You might also like</h2>
      <ProductRail products={related} />
    </section>
  );
}

function Accordion({ title, children, open }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group border-b border-line py-5">
      <summary className="flex cursor-pointer list-none items-center justify-between text-[11px] font-medium uppercase tracking-[0.2em]">
        {title}
        <span className="text-lg font-light transition group-open:rotate-45">+</span>
      </summary>
      <div className="mt-4 space-y-2 text-[14px] leading-relaxed text-muted">{children}</div>
    </details>
  );
}

async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const condition = product.condition ? CONDITIONS[product.condition] : null;
  const sizes = sortSizes([...new Set(product.variants.map((v) => v.size))]);
  const onSale = !!product.compareAtCents && product.compareAtCents > product.priceCents;
  const pct = onSale ? Math.round((1 - product.priceCents / product.compareAtCents!) * 100) : 0;
  const whatsapp = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Hi! I have a question about the ${product.name}.`)}`;

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-[1fr_440px] xl:gap-16">
        <ProductGallery
          photos={product.photos}
          name={product.name}
          tint={product.tint}
          category={product.category.slug}
          badge={
            condition && (
              <span className="absolute left-4 top-4 bg-earth px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-paper">
                Thrifted · 1 of 1
              </span>
            )
          }
        />

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <nav className="eyebrow">
            <Link href="/shop" className="hover:text-foreground">Shop</Link> /{" "}
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-foreground">
              {product.category.name}
            </Link>
          </nav>
          <h1 className="display mt-5 text-4xl sm:text-5xl">{product.name}</h1>
          <BeadRow count={6} small className="mt-3" />
          <div className="mt-4 flex items-baseline gap-3 text-lg">
            <span className={onSale ? "text-sale" : ""}>{formatMoney(product.priceCents)}</span>
            {onSale && !condition && (
              <>
                <span className="text-base text-muted line-through">{formatMoney(product.compareAtCents!)}</span>
                <span className="text-base font-medium text-sale">{pct}% off</span>
              </>
            )}
          </div>
          {onSale && (
            <p className="mt-1 text-sm font-medium text-sale">
              {condition ? `About ${formatMoney(product.compareAtCents!)} new · ` : ""}You save {formatMoney(product.compareAtCents! - product.priceCents)}
            </p>
          )}
          <ul className="mt-5 space-y-1 border-t border-line pt-5 text-[13px] text-muted">
            <li>Lipa na M-Pesa, card, or pay on delivery</li>
            <li>Order before 2pm for same-day delivery in Nairobi</li>
          </ul>
          {condition && (
            <div className="mt-6 border border-line bg-card p-5">
              <div className="text-sm">
                Condition: <strong>{condition.label}</strong>
              </div>
              <p className="mt-1 text-sm text-muted">{condition.detail} Pre-loved and hand-picked; there&apos;s only one of this piece.</p>
              {product.measurements && (
                <p className="mt-3 border-t border-line pt-3 text-sm">
                  <strong>Measured flat:</strong> {product.measurements}
                </p>
              )}
            </div>
          )}

          <div className="mt-8">
            <AddToCart
              product={{
                _id: product._id,
                slug: product.slug,
                name: product.name,
                priceCents: product.priceCents,
                tint: product.tint,
                imageUrl: product.imageUrl ?? null,
                category: product.category.slug,
                thrifted: !!condition,
              }}
              whatsapp={site.whatsapp}
              variants={product.variants}
              sizes={sizes}
            />
          </div>

          <div className="mt-8 border-t border-line">
            <Accordion title="Description" open>
              <p>{product.description}</p>
              {!condition && product.measurements && <p><strong>Fit:</strong> {product.measurements}</p>}
            </Accordion>
            <Accordion title="Delivery">
              <p><strong>Nairobi:</strong> same or next-day delivery, Ksh 300.</p>
              <p><strong>Kiambu, Machakos, Kajiado, Murang&apos;a:</strong> 1–2 days, Ksh 400.</p>
              <p><strong>Rest of Kenya:</strong> 2–4 days, Ksh 600.</p>
              <p>Free delivery anywhere on orders over {formatMoney(site.freeShippingThresholdCents)}.</p>
            </Accordion>
            <Accordion title="Exchanges & returns">
              <p>Not the right fit? Exchange or return unworn items with tags within 14 days. We&apos;ll arrange pickup in Nairobi.</p>
            </Accordion>
            <Accordion title="Care">
              <p>Machine wash cold, inside out. Hang to dry out of direct sunlight. Iron on low.</p>
            </Accordion>
          </div>

          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="mt-6 flex items-center gap-3 bg-soft p-4 text-sm hover:bg-line">
            <WhatsAppGlyph />
            <span>
              <strong>Questions about fit?</strong> Chat with us on WhatsApp
            </span>
          </a>
        </div>
      </div>
      <Suspense fallback={<div className="mt-24"><ProductGridSkeleton count={4} /></div>}>
        <Related productId={product._id} />
      </Suspense>
    </>
  );
}

function WhatsAppGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="#25D366" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.5 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 2 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.7-.1l1.9.9c.3.1.5.2.5.3.1.2.1.8-.1 1.3Z" />
    </svg>
  );
}

export default function ProductPage({ params }: PageProps<"/products/[slug]">) {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-8">
      <Suspense
        fallback={
          <div className="grid gap-10 lg:grid-cols-[1fr_440px]">
            <div className="aspect-[4/5] animate-pulse bg-soft" />
            <div className="h-96 animate-pulse bg-soft" />
          </div>
        }
      >
        <ProductDetail params={params} />
      </Suspense>
    </div>
  );
}
