// Store-wide settings. Change these to rebrand the shop.
// Money is stored in cents (1 shilling = 100 cents), which is also what
// Paystack expects. Delivery rules live in shared/delivery.ts.
export { COUNTIES, deliveryFor, FREE_DELIVERY_THRESHOLD_CENTS } from "../../shared/delivery";
import { FREE_DELIVERY_THRESHOLD_CENTS } from "../../shared/delivery";

export const site = {
  // "Vaazi", from mavazi, Swahili for clothing
  name: "VAAZI",
  tagline: "Considered menswear from Nairobi",
  currency: "KES",
  locale: "en-KE",
  freeShippingThresholdCents: FREE_DELIVERY_THRESHOLD_CENTS,
  // WhatsApp number for the chat button, in international format without "+"
  whatsapp: "254768819481", // 0768 819 481
  supportPhone: "+254 768 819 481",
  supportEmail: "denisomondi294@gmail.com",
  // Weekly thrift drop: day of week (0 = Sunday … 5 = Friday) and hour, Nairobi time
  thriftDrop: { day: 5, hour: 18, label: "Fridays at 6pm" },
  sizes: ["XS", "S", "M", "L", "XL", "XXL"],
};

export function formatMoney(cents: number) {
  const shillings = Math.round(cents / 100);
  return `Ksh ${new Intl.NumberFormat(site.locale, { maximumFractionDigits: 0 }).format(shillings)}`;
}

// Sort sizes in a natural order (XS..XXL first, then numeric waist/shoe sizes).
export function sortSizes(sizes: string[]) {
  const order = (s: string) => {
    const i = site.sizes.indexOf(s);
    if (i >= 0) return i;
    const n = parseFloat(s);
    return Number.isNaN(n) ? 1000 : 100 + n;
  };
  return [...sizes].sort((a, b) => order(a) - order(b));
}

// Accepts 07XX…, 01XX…, 2547…, +2547… and returns +2547XXXXXXXX, or null.
export function normalizeKenyanPhone(input: string) {
  const digits = input.replace(/[^\d]/g, "");
  let local = "";
  if (/^0[17]\d{8}$/.test(digits)) local = digits.slice(1);
  else if (/^254[17]\d{8}$/.test(digits)) local = digits.slice(3);
  else if (/^[17]\d{8}$/.test(digits)) local = digits;
  return local ? `+254${local}` : null;
}

// Grades for thrifted (second-hand) pieces. New stock has no condition.
export const CONDITIONS = {
  LIKE_NEW: { label: "Like new", detail: "Worn once or twice, no visible signs of wear." },
  EXCELLENT: { label: "Excellent", detail: "Gently worn, no flaws. Cleaned and pressed." },
  GOOD: { label: "Good", detail: "Visible but minor signs of wear, described in the listing." },
} as const;
export type Condition = keyof typeof CONDITIONS;
