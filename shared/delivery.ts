// Delivery rules shared by the Next.js app and Convex functions.
// All amounts in cents (Ksh × 100).

export const FREE_DELIVERY_THRESHOLD_CENTS = 10_000_00; // Ksh 10,000

export const NAIROBI_DELIVERY_CENTS = 300_00; // Ksh 300, same/next day
export const NEAR_NAIROBI_DELIVERY_CENTS = 400_00; // Ksh 400, 1–2 days
export const UPCOUNTRY_DELIVERY_CENTS = 600_00; // Ksh 600, 2–4 days

const NEAR_NAIROBI = ["Kiambu", "Machakos", "Kajiado", "Murang'a"];

export const COUNTIES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu", "Machakos", "Kajiado", "Uasin Gishu",
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa", "Homa Bay",
  "Isiolo", "Kakamega", "Kericho", "Kilifi", "Kirinyaga", "Kisii", "Kitui", "Kwale", "Laikipia",
  "Lamu", "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Murang'a", "Nandi", "Narok",
  "Nyamira", "Nyandarua", "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River",
  "Tharaka-Nithi", "Trans Nzoia", "Turkana", "Vihiga", "Wajir", "West Pokot",
] as const;

export function deliveryFor(subtotalCents: number, county?: string) {
  if (subtotalCents === 0) return { cents: 0, eta: "" };
  if (!county || county === "Nairobi") {
    return {
      cents: subtotalCents >= FREE_DELIVERY_THRESHOLD_CENTS ? 0 : NAIROBI_DELIVERY_CENTS,
      eta: "Same or next day",
    };
  }
  if (NEAR_NAIROBI.includes(county)) {
    return {
      cents: subtotalCents >= FREE_DELIVERY_THRESHOLD_CENTS ? 0 : NEAR_NAIROBI_DELIVERY_CENTS,
      eta: "1–2 business days",
    };
  }
  return {
    cents: subtotalCents >= FREE_DELIVERY_THRESHOLD_CENTS ? 0 : UPCOUNTRY_DELIVERY_CENTS,
    eta: "2–4 business days",
  };
}
