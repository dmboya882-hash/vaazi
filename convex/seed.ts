import { internalMutation } from "./_generated/server";
import { colorHex } from "../src/lib/colors";
import { slugify } from "./lib";

// Run with: npx convex run seed:run
// Wipes the catalog and orders, then loads sample products.

const categories = [
  { name: "Shirts", slug: "shirts", sort: 1 },
  { name: "T-Shirts & Polos", slug: "t-shirts", sort: 2 },
  { name: "Knitwear", slug: "knitwear", sort: 3 },
  { name: "Trousers & Jeans", slug: "trousers", sort: 4 },
  { name: "Jackets & Coats", slug: "jackets", sort: 5 },
  { name: "Shoes", slug: "shoes", sort: 6 },
  { name: "Accessories", slug: "accessories", sort: 7 },
];

const TOPS = ["S", "M", "L", "XL", "XXL"];
const WAIST = ["30", "32", "34", "36", "38"];
const SHOES = ["40", "41", "42", "43", "44", "45"];
const ONE = ["One Size"];

type Condition = "LIKE_NEW" | "EXCELLENT" | "GOOD";
type Seed = {
  name: string;
  category: string;
  price: number; // Ksh
  compareAt?: number; // Ksh
  look: string; // colour name, only used to tint the placeholder artwork
  sizes: string[];
  featured?: boolean;
  description: string;
  // Thrifted pieces: one of a kind, one size, one in stock
  condition?: Condition;
};

const products: Seed[] = [
  // New stock
  { name: "Oxford Button-Down Shirt", category: "shirts", price: 3500, look: "Light Blue", sizes: TOPS, featured: true, description: "A wardrobe cornerstone in soft brushed cotton Oxford cloth. Button-down collar, chest pocket and a tailored fit that works tucked or untucked." },
  { name: "Linen Camp Collar Shirt", category: "shirts", price: 3800, look: "Sand", sizes: TOPS, description: "Breathable linen with a relaxed camp collar. Made for warm days and easy evenings." },
  { name: "Essential Crew Tee", category: "t-shirts", price: 1200, look: "Black", sizes: TOPS, featured: true, description: "Midweight cotton jersey that holds its shape wash after wash. The tee you'll reach for every day." },
  { name: "Piqué Polo", category: "t-shirts", price: 2200, look: "Navy", sizes: TOPS, description: "Classic cotton piqué polo with a two-button placket and ribbed collar." },
  { name: "Merino Crewneck Sweater", category: "knitwear", price: 5500, look: "Charcoal", sizes: TOPS, description: "Fine-gauge merino wool. Warm without the bulk, perfect for chilly Nairobi mornings." },
  { name: "Slim Fit Jeans", category: "trousers", price: 4800, look: "Indigo", sizes: WAIST, featured: true, description: "Rigid denim in a slim, slightly tapered fit. Fades beautifully with wear." },
  { name: "Stretch Chinos", category: "trousers", price: 3500, compareAt: 4500, look: "Khaki", sizes: WAIST, description: "Cotton twill chinos with a touch of stretch for all-day comfort. Smart enough for the office." },
  { name: "Waxed Field Jacket", category: "jackets", price: 11500, look: "Olive", sizes: TOPS, description: "Water-resistant waxed cotton with a corduroy collar and four cargo pockets. Ready for the long rains." },
  { name: "Suede Chelsea Boots", category: "shoes", price: 8500, look: "Tan", sizes: SHOES, featured: true, description: "Suede Chelsea boots on a lightweight crepe sole." },
  { name: "Leather Low-Top Sneakers", category: "shoes", price: 6800, look: "White", sizes: SHOES, description: "Minimal full-grain leather sneakers with a stitched cupsole." },
  { name: "Leather Belt", category: "accessories", price: 1800, look: "Brown", sizes: WAIST, description: "Full-grain leather belt with a solid brass buckle." },
  { name: "Ribbed Beanie", category: "accessories", price: 900, compareAt: 1300, look: "Burgundy", sizes: ONE, description: "Soft ribbed beanie with a fold-over cuff." },

  // Thrifted one-offs
  { name: "Vintage Denim Trucker Jacket", category: "jackets", price: 2800, look: "Indigo", sizes: ["L"], condition: "EXCELLENT", featured: true, description: "Classic 90s trucker jacket in a perfect mid-wash. Soft, broken-in denim with no rips or stains. Hand-picked and cleaned." },
  { name: "Thrifted Corduroy Shirt", category: "shirts", price: 1200, look: "Rust", sizes: ["M"], condition: "GOOD", description: "Wide-wale corduroy shirt with pearl snaps. Light fading at the collar adds character." },
  { name: "Retro Windbreaker", category: "jackets", price: 2200, look: "Green", sizes: ["XL"], condition: "LIKE_NEW", featured: true, description: "Colour-block nylon windbreaker with a packable hood. Barely worn." },
  { name: "Vintage Leather Bomber", category: "jackets", price: 4500, look: "Brown", sizes: ["L"], condition: "GOOD", description: "Genuine leather bomber with ribbed cuffs and hem. Some natural creasing; lining is intact." },
  { name: "Thrifted Cargo Trousers", category: "trousers", price: 1500, look: "Olive", sizes: ["34"], condition: "LIKE_NEW", description: "Relaxed ripstop cargos with six pockets. No signs of wear." },
  { name: "Vintage Graphic Tee", category: "t-shirts", price: 700, look: "Grey", sizes: ["L"], condition: "GOOD", featured: true, description: "Soft, faded single-stitch tee with a cracked vintage print. That perfect lived-in feel." },
  { name: "Thrifted Wool Blazer", category: "jackets", price: 2500, look: "Charcoal", sizes: ["M"], condition: "EXCELLENT", description: "Two-button wool blazer, fully lined. Pairs with jeans or chinos for a smart-casual look." },
  { name: "Retro Hiking Boots", category: "shoes", price: 3200, look: "Tan", sizes: ["43"], condition: "GOOD", description: "Sturdy leather hiking boots with lugged soles. Re-laced and cleaned; light scuffs on the toes." },
];

export const run = internalMutation({
  args: {},
  handler: async (ctx) => {
    for (const table of ["variants", "products", "categories", "orders"] as const) {
      for (const doc of await ctx.db.query(table).collect()) await ctx.db.delete(doc._id);
    }

    const catIds = new Map<string, Awaited<ReturnType<typeof ctx.db.insert<"categories">>>>();
    for (const c of categories) catIds.set(c.slug, await ctx.db.insert("categories", c));

    for (const p of products) {
      const productId = await ctx.db.insert("products", {
        name: p.name,
        slug: slugify(p.name),
        description: p.description,
        priceCents: p.price * 100,
        compareAtCents: p.compareAt ? p.compareAt * 100 : undefined,
        featured: p.featured ?? false,
        active: true,
        tint: colorHex(p.look),
        condition: p.condition,
        imageUrl: PRODUCT_PHOTOS[p.name],
        categoryId: catIds.get(p.category)!,
      });
      for (const [si, size] of p.sizes.entries()) {
        // Thrifted: exactly one. New: deterministic 0..12 so a few sizes sell out.
        const stock = p.condition ? 1 : (p.name.length + si * 7) % 13;
        await ctx.db.insert("variants", { productId, size, stock });
      }
    }
    return `Seeded ${categories.length} categories and ${products.length} products.`;
  },
});

// Placeholder product photos (free Unsplash licence, hotlinked). Replace with
// photos of your actual stock before launch, especially for thrifted pieces.
const U = (id: string) => `https://images.unsplash.com/photo-${id}?w=1000&q=80&auto=format&fit=crop`;
export const PRODUCT_PHOTOS: Record<string, string> = {
  "Oxford Button-Down Shirt": U("1740711152088-88a009e877bb"),
  "Linen Camp Collar Shirt": U("1776838103951-993ff1ffc916"),
  "Essential Crew Tee": U("1778671394516-8270eac13c42"),
  "Piqué Polo": U("1625910513394-ea511bed44ca"),
  "Merino Crewneck Sweater": U("1646270968802-6bad28659329"),
  "Slim Fit Jeans": U("1637069585336-827b298fe84a"),
  "Stretch Chinos": U("1711443813147-def27861b9af"),
  "Waxed Field Jacket": U("1548883354-d056ab7b441f"),
  "Suede Chelsea Boots": U("1534233812932-59b8fa1b780c"),
  "Leather Low-Top Sneakers": U("1544441892-794166f1e3be"),
  "Leather Belt": U("1664286074176-5206ee5dc878"),
  "Ribbed Beanie": U("1672187049467-ff95e93e31ed"),
  "Vintage Denim Trucker Jacket": U("1773236237553-0950d3c31d20"),
  "Thrifted Corduroy Shirt": U("1521443331827-88ee11ea2706"),
  "Vintage Leather Bomber": U("1614804538679-3421a1165480"),
  "Thrifted Cargo Trousers": U("1548883354-7622d03aca27"),
  "Vintage Graphic Tee": U("1790644896291-17441b49ac9d"),
  "Thrifted Wool Blazer": U("1740710748146-a15d840d6f40"),
  "Retro Hiking Boots": U("1575987116913-e96e7d490b8a"),
};

// Run with: npx convex run seed:applyPhotos
// Sets the placeholder photo URL on matching products without touching
// orders or stock. Products with uploaded photos still show those first.
export const applyPhotos = internalMutation({
  args: {},
  handler: async (ctx) => {
    let n = 0;
    for (const p of await ctx.db.query("products").collect()) {
      const url = PRODUCT_PHOTOS[p.name];
      if (url && p.imageUrl !== url) {
        await ctx.db.patch(p._id, { imageUrl: url });
        n++;
      }
    }
    return `Set photos on ${n} products.`;
  },
});
