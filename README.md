# Vaazi — menswear store (Kenya)

Online shop for men's clothing, new and thrifted, built for Kenyan shoppers.

- **Next.js 16** (App Router) for the storefront and admin
- **Convex** for the database and backend functions
- **Paystack** for M-Pesa and card payments, plus **Pay on Delivery**
- Prices in **Ksh**, delivery priced by **county**, a WhatsApp chat button

## Run it locally

You need Node 20+.

```bash
npm install
```

Start Convex. The first run asks you to log in or to use a local deployment, then writes `.env.local`:

```bash
npx convex dev
```

In a second terminal, set the shared server secret (any long random string). Put the same value in `.env.local` as `CONVEX_SERVER_SECRET=...`:

```bash
npx convex env set CONVEX_SERVER_SECRET your-long-random-string
```

Load the sample catalog (this wipes products and orders):

```bash
npm run seed
```

Start the site:

```bash
npm run dev
```

Open http://localhost:3000. The admin area is at http://localhost:3000/admin, and its password is `ADMIN_PASSWORD` in `.env`.

## Settings

| Where | What |
|---|---|
| `.env` | `ADMIN_PASSWORD`, `SESSION_SECRET`, `PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_SITE_URL` |
| `.env.local` | Convex URL and `CONVEX_SERVER_SECRET` (created by `npx convex dev`) |
| `src/lib/site.ts` | Store name, WhatsApp number, support phone and email, thrift drop day/time, condition labels |
| `shared/delivery.ts` | Delivery fees per county and the free-delivery threshold |

## Payments

- **No Paystack key**: demo mode. "M-Pesa or card" orders are marked paid straight away, so you can test without paying.
- **With a Paystack key** (`sk_test_...` while testing): customers go to Paystack's page, pay with M-Pesa or card, and come back to the order confirmation.
  In the Paystack dashboard, set the webhook URL to `https://your-domain/api/paystack/webhook`.
- **Pay on delivery**: the order is confirmed and stock is reserved right away. Mark it **Paid** in the admin once the rider collects the money.

## Product photos

Open a product in the admin and go to **Photos**. Click **Add photos** or drag images in. You can add up to 10 per product.

- Photos are shrunk to 1600px JPEG in the browser before uploading, which keeps the shop fast on mobile data.
- They're stored in Convex file storage.
- The first photo is the main one, and the second shows when shoppers hover a product card. **Make main** reorders them; **Delete** removes one.
- Product pages show every photo: swipeable on phones, a grid on desktop, and tap or click to zoom.
- The "External photo URL" field still works if you'd rather host images elsewhere.

### Placeholder photography

The home page photos (`src/lib/media.ts`) and sample product photos (`PRODUCT_PHOTOS` in `convex/seed.ts`) are free-licence stock images from Unsplash and Pexels, hotlinked and credited in those files.

- Replace them with your own campaign and product photos before launch.
- For thrifted pieces, customers must see the actual item.
- Run `npx convex run seed:applyPhotos` to apply the product placeholders again without touching orders.

## Thrifted items

Choose a **Condition** (Like new / Excellent / Good) on a product in the admin to mark it as thrifted. Give it one size with stock 1. It shows a "Thrifted · 1 of 1" badge and sells out after one purchase. Products with no condition are treated as new stock.

Use the **Measurements / fit** field for flat measurements (for example "Pit to pit 56cm, length 72cm"), which shows on the product page. Put the approximate new retail price in **Was price** to show "About Ksh X new · You save Ksh Y".

The home page counts down to the weekly thrift drop. Set the day and time in `site.thriftDrop` in `src/lib/site.ts`.

## Order statuses

| Status | Meaning |
|---|---|
| Awaiting payment | Sent to Paystack, payment not confirmed yet |
| Pay on delivery | Confirmed, customer pays the rider |
| Paid | Money received |
| Out for delivery | With the rider |
| Delivered | Done |
| Cancelled | Cancelling a confirmed or paid order puts the items back in stock |

## Project layout

```
convex/            Backend: schema, catalog queries, orders, admin, seed data
shared/            Code used by both Convex and Next.js (delivery rules)
src/app/(shop)/    Storefront: home, shop, product, bag, checkout, favourites, help
src/app/admin/     Admin: dashboard, products & stock, orders
src/app/api/       Paystack webhook
src/components/    UI pieces (header, product card, bag drawer, …)
src/lib/           Settings, Convex helpers, Paystack, admin auth
```

## Before going live

- Set a strong `ADMIN_PASSWORD` and `SESSION_SECRET`.
- Run `npx convex deploy` and point the site at the production Convex URL.
- Use your live Paystack key (`sk_live_...`) and set up the webhook.
- Replace the placeholder WhatsApp number and phone in `src/lib/site.ts`.
- Add real product photos (Image URL on each product in the admin).
