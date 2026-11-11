import Link from "next/link";
import { CartProvider } from "@/components/cart-provider";
import { CartDrawer } from "@/components/cart-drawer";
import { Header } from "@/components/header";
import { Newsletter } from "@/components/newsletter";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { BeadBand } from "@/components/bead-band";
import { formatMoney, site } from "@/lib/site";

const FOOTER = [
  {
    title: "Shop",
    links: [
      ["New In", "/shop?sort=newest"],
      ["Bestsellers", "/shop?sort=featured"],
      ["Sale", "/shop?sale=1"],
      ["Wishlist", "/wishlist"],
    ],
  },
  {
    title: "Help",
    links: [
      ["Delivery", "/help#delivery"],
      ["Exchanges & returns", "/help#returns"],
      ["Size guide", "/help#sizes"],
      ["Contact & WhatsApp", "/help#contact"],
    ],
  },
];

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Header />
      <main className="flex-1">{children}</main>
      <CartDrawer />
      <WhatsAppButton />

      <footer className="mt-28 bg-ink text-white">
        <BeadBand />
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
            <div>
              <p className="eyebrow text-white/50">Jiunge · Join the list</p>
              <h2 className="display mt-3 text-5xl">10% off your first order</h2>
              <p className="mt-3 max-w-sm text-white/70">
                Join the list for early access to drops, restocks and members-only offers.
              </p>
              <div className="mt-6">
                <Newsletter />
              </div>
            </div>
            {FOOTER.map((col) => (
              <div key={col.title}>
                <div className="eyebrow text-white/50">{col.title}</div>
                <ul className="mt-4 space-y-3 text-sm text-white/70">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="hover:text-white">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <div className="eyebrow text-white/50">Contact</div>
              <ul className="mt-4 space-y-3 text-sm text-white/70">
                <li>
                  <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    WhatsApp {site.supportPhone}
                  </a>
                </li>
                <li>
                  <a href={`tel:${site.supportPhone.replace(/\s/g, "")}`} className="hover:text-white">
                    Call {site.supportPhone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${site.supportEmail}`} className="break-all hover:text-white">
                    {site.supportEmail}
                  </a>
                </li>
                <li className="text-white/50">Mon – Sat, 8am – 7pm EAT</li>
              </ul>
            </div>
          </div>
          <div
            aria-hidden
            className="display mt-16 select-none pl-[0.25em] text-center text-[21vw] font-medium leading-[0.8] tracking-[0.25em] text-white/90 xl:text-[300px]"
          >
            {site.name}
          </div>
          <div className="mt-10 flex flex-col justify-between gap-4 border-t border-white/15 pt-6 text-[11px] uppercase tracking-[0.2em] text-white/50 sm:flex-row">
            <span>
              © {site.name}. Free delivery over {formatMoney(site.freeShippingThresholdCents)} · Nairobi, Kenya
            </span>
            <span>M-Pesa · Visa · Mastercard · Cash on delivery</span>
          </div>
        </div>
      </footer>
    </CartProvider>
  );
}
