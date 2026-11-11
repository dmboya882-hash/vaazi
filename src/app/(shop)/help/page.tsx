import type { Metadata } from "next";
import { formatMoney, site } from "@/lib/site";

export const metadata: Metadata = { title: "Help" };

export default function HelpPage() {
  const whatsapp = `https://wa.me/${site.whatsapp}`;
  return (
    <div className="mx-auto max-w-3xl px-4 pt-12 sm:px-8">
      <h1 className="display text-6xl">Help</h1>

      <section id="delivery" className="mt-12 scroll-mt-28">
        <h2 className="text-2xl font-medium">Delivery</h2>
        <table className="mt-4 w-full text-[15px]">
          <tbody className="divide-y divide-line">
            <tr><td className="py-3 font-medium">Nairobi</td><td className="py-3 text-muted">Same or next day</td><td className="py-3 text-right">Ksh 300</td></tr>
            <tr><td className="py-3 font-medium">Kiambu, Machakos, Kajiado, Murang&apos;a</td><td className="py-3 text-muted">1–2 business days</td><td className="py-3 text-right">Ksh 400</td></tr>
            <tr><td className="py-3 font-medium">Rest of Kenya</td><td className="py-3 text-muted">2–4 business days</td><td className="py-3 text-right">Ksh 600</td></tr>
          </tbody>
        </table>
        <p className="mt-4 text-muted">
          Free delivery anywhere in Kenya on orders over {formatMoney(site.freeShippingThresholdCents)}. Our rider calls you before arriving.
        </p>
      </section>

      <section id="payment" className="mt-12 scroll-mt-28">
        <h2 className="text-2xl font-medium">Payment</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
          <li><strong className="text-foreground">M-Pesa</strong>: you get a prompt on your phone; enter your PIN to pay.</li>
          <li><strong className="text-foreground">Card</strong>: Visa and Mastercard, processed securely by Paystack.</li>
          <li><strong className="text-foreground">Pay on delivery</strong>: pay the rider by M-Pesa or cash when your order arrives.</li>
        </ul>
      </section>

      <section id="returns" className="mt-12 scroll-mt-28">
        <h2 className="text-2xl font-medium">Exchanges &amp; returns</h2>
        <p className="mt-4 text-muted">
          Exchange or return unworn items with tags within 14 days of delivery. Message us on WhatsApp with your order number and we&apos;ll arrange a pickup.
          Refunds go back to your M-Pesa or card within 5 business days.
        </p>
      </section>

      <section id="sizes" className="mt-12 scroll-mt-28">
        <h2 className="text-2xl font-medium">Size guide</h2>
        <p className="mt-4 text-muted">
          Every product page has a size guide next to the size buttons. Still unsure? Send us your height and usual size on WhatsApp and we&apos;ll recommend one.
        </p>
      </section>

      <section id="contact" className="mt-12 scroll-mt-28">
        <h2 className="text-2xl font-medium">Contact</h2>
        <p className="mt-4 text-muted">Monday to Saturday, 8am – 7pm EAT.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
            Chat on WhatsApp
          </a>
          <a href={`tel:${site.supportPhone.replace(/\s/g, "")}`} className="btn-outline">
            Call {site.supportPhone}
          </a>
          <a href={`mailto:${site.supportEmail}`} className="btn-outline">
            Email us
          </a>
        </div>
        <p className="mt-4 text-sm text-muted">
          WhatsApp or call {site.supportPhone} ·{" "}
          <a href={`mailto:${site.supportEmail}`} className="underline">
            {site.supportEmail}
          </a>
        </p>
      </section>
    </div>
  );
}
