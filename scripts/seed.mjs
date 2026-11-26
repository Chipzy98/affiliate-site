// Adds a few DEMO products so you can see how the site looks.
// Delete them later from the admin panel and add your real affiliate items.
// Usage: npm run db:seed
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Add it to .env.local first.");
  process.exit(1);
}

const sql = postgres(url, { max: 1, prepare: false });

const demo = [
  {
    slug: "demo-wireless-earbuds",
    title: "Demo Wireless Earbuds with Noise Cancelling",
    description: "DEMO ITEM – replace with a real product.\n\nUp to 30 hours battery, USB-C fast charging and IPX5 water resistance.",
    image_url: "https://picsum.photos/seed/earbuds/600/600",
    price: "$39.99",
    original_price: "$59.99",
    rating: 4.5,
    store: "Amazon",
    category: "Electronics",
    affiliate_url: "https://www.amazon.com/?tag=yourtag-20",
    featured: true,
  },
  {
    slug: "demo-smart-watch",
    title: "Demo Smart Watch – Fitness & Sleep Tracker",
    description: "DEMO ITEM – replace with a real product.\n\nHeart rate, SpO2, 100+ sport modes, 7-day battery.",
    image_url: "https://picsum.photos/seed/watch/600/600",
    price: "$49.00",
    original_price: "",
    rating: 4.2,
    store: "Amazon",
    category: "Electronics",
    affiliate_url: "https://www.amazon.com/?tag=yourtag-20",
    featured: true,
  },
  {
    slug: "demo-kitchen-knife-set",
    title: "Demo 6-Piece Kitchen Knife Set",
    description: "DEMO ITEM – replace with a real product.\n\nStainless steel blades with a wooden block.",
    image_url: "https://picsum.photos/seed/knife/600/600",
    price: "$24.95",
    original_price: "$34.95",
    rating: 4.7,
    store: "AliExpress",
    category: "Home & Kitchen",
    affiliate_url: "https://www.aliexpress.com/",
    featured: false,
  },
  {
    slug: "demo-yoga-mat",
    title: "Demo Non-Slip Yoga Mat 6mm",
    description: "DEMO ITEM – replace with a real product.",
    image_url: "https://picsum.photos/seed/yoga/600/600",
    price: "$19.99",
    original_price: "",
    rating: 4.4,
    store: "eBay",
    category: "Sports",
    affiliate_url: "https://www.ebay.com/",
    featured: true,
  },
];

try {
  for (const p of demo) {
    await sql`
      insert into products ${sql(p)}
      on conflict (slug) do nothing
    `;
  }
  console.log(`✅ Added ${demo.length} demo products.`);
} catch (err) {
  console.error("❌ Seed failed (did you run npm run db:setup first?):", err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
