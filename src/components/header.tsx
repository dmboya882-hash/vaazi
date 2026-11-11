import { Suspense } from "react";
import { getCategories } from "@/lib/catalog";
import { formatMoney, site } from "@/lib/site";
import { HeaderBar } from "@/components/header-bar";
import { BeadBand } from "@/components/bead-band";

const MESSAGES = [
  `Free delivery on orders over ${formatMoney(site.freeShippingThresholdCents)}`,
  "Same-day delivery in Nairobi",
  "Lipa na M-Pesa",
  "Pay on delivery available",
  "Sign up for 10% off your first order",
];

function AnnouncementBar() {
  // The list is repeated so the CSS ticker loops without a gap.
  const row = [...MESSAGES, ...MESSAGES];
  return (
    <div className="overflow-hidden bg-earth py-2 text-[10px] font-medium uppercase tracking-[0.3em] text-paper/85">
      <div className="marquee flex w-max gap-20 whitespace-nowrap">
        {row.map((m, i) => (
          <span key={i} aria-hidden={i >= MESSAGES.length}>
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

async function HeaderWithCategories() {
  const categories = await getCategories();
  return <HeaderBar categories={categories.map(({ name, slug }) => ({ name, slug }))} />;
}

export function Header() {
  return (
    <>
      <BeadBand />
      <AnnouncementBar />
      <Suspense fallback={<HeaderBar categories={[]} />}>
        <HeaderWithCategories />
      </Suspense>
    </>
  );
}
