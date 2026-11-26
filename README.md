# DealHub – Affiliate Marketing Website + Admin Panel

Next.js 16 (frontend + backend in one project) · PostgreSQL (Neon, free) · Hosting on Netlify (free, commercial use allowed)

## Features

**Public website**
- Home page with Top picks, Latest deals and category chips
- All-deals page with search, category/store filters, sort, pagination
- Product page with image, price, discount badge, rating, description, related products
- "View deal" buttons go through `/go/{id}` → the click is counted → visitor is sent to your affiliate link
- Affiliate disclosure + Privacy policy pages, sitemap.xml, robots.txt, SEO/OG meta tags
- Fast: home and product pages are cached (ISR) and refreshed instantly when you save in admin

**Admin panel (`/admin`)**
- Password login (signed, httpOnly cookie)
- Dashboard: online now, unique visitors, page views, affiliate clicks, click rate, daily chart,
  countries (with click counts), most clicked products, top pages, traffic sources
  (facebook.com, google.com, `?utm_source=tiktok`…), devices, browsers, latest visits
- Visitors page: full visit log, filter by country, delete old data
- Products: add / edit / delete, featured & visible toggles, image preview, clicks per product

**Privacy:** real IP addresses are never stored – only an anonymous hash that changes daily.
Country/city come from the hosting provider's headers (Netlify `x-nf-geo` / `x-country`; Vercel and Cloudflare headers also supported).

---

## 1. Run on your computer

Requirements: Node.js 20+ and a free Neon account.

```bash
npm install
cp .env.example .env.local      # then fill in the values (see below)
npm run db:setup                # creates the tables
npm run db:seed                 # optional: 4 demo products
npm run dev                     # http://localhost:3000   admin: http://localhost:3000/admin
```

> Locally the country shows as "Unknown" – that's normal. Countries appear once it's hosted on Netlify.

### Environment variables

| Name | What to put |
|---|---|
| `DATABASE_URL` | Neon **pooled** connection string |
| `ADMIN_PASSWORD` | Your admin password (min 8 chars, longer is better) |
| `SESSION_SECRET` | Random 64-char string: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXT_PUBLIC_SITE_NAME` | Site name, e.g. `DealHub` |
| `NEXT_PUBLIC_SITE_TAGLINE` | Hero headline |
| `NEXT_PUBLIC_SITE_URL` | Your live URL, e.g. `https://dealhub.netlify.app` |
| `ANALYTICS_TZ` | Time zone for daily charts, e.g. `Asia/Colombo` |

## 2. Create the free database (Neon)

1. Sign up at https://neon.com (no credit card).
2. Create a project → choose the region closest to your visitors (e.g. AWS US East, or Singapore for Asia).
3. Dashboard → **Connect** → turn on **Connection pooling** → copy the connection string → put it in `DATABASE_URL`.
4. Run `npm run db:setup` (or paste `db/schema.sql` into Neon's **SQL Editor** and run it).

## 3. Deploy for free (Netlify)

1. Push this folder to a GitHub repository (`.env.local` is ignored – never commit it).
2. https://app.netlify.com → **Add new project → Import from Git** → pick the repo.
   Netlify detects Next.js automatically (`netlify.toml` is included).
3. **Site configuration → Environment variables** → add every variable from the table above.
4. Deploy. Your site is live at `https://<name>.netlify.app`. Admin: `https://<name>.netlify.app/admin`.
5. Optional: add your own domain in **Domain management**, then update `NEXT_PUBLIC_SITE_URL` and redeploy.

> Why not Vercel's free plan? Vercel's Hobby plan is for non-commercial use only and lists affiliate sites as
> commercial. Netlify's free plan allows commercial projects, including affiliate sites.

## 4. Adding products

1. Join the affiliate programs (Amazon Associates, AliExpress Portals, eBay Partner Network, …).
2. Use the program's own tool (e.g. Amazon **SiteStripe**) to get the tracking link and image link.
3. Admin → **Add product** → paste the link, image link, title, price, category → Save.

**Amazon rules to keep in mind** (read the current Operating Agreement yourself):
- The disclosure "As an Amazon Associate I earn from qualifying purchases." is already on every page.
- Don't copy/scrape product data from Amazon pages; use SiteStripe / their API tools.
- Prices change constantly – keep the price field updated or leave it empty (the site then hides it).
- The button says "View on Amazon", so visitors always know where the link goes.

## 5. Tracking social media campaigns

Share links like `https://your-site.netlify.app/?utm_source=facebook` or `?utm_source=tiktok`.
They appear under **Traffic sources** in the dashboard.

## Project structure

```
src/
  app/
    (site)/           public website (home, products, p/[slug], disclosure, privacy)
    admin/            login page, server actions, (panel)/ dashboard, visitors, products
    api/track/        receives page views from the browser
    go/[id]/          counts a click and redirects to the affiliate link
    sitemap.ts, robots.ts
  components/         ProductCard, Header, Footer, Tracker, admin/* (charts, form…)
  lib/                db, products & analytics queries, session/auth, visitor geo & device
  proxy.ts            protects /admin
db/schema.sql         database tables
scripts/              db:setup and db:seed
```

## Free-tier limits (check the providers' sites for current numbers)
- Neon Free: 1 GB storage per project – millions of page-view rows. Use **Visitors → Delete old data** occasionally.
- Netlify Free: monthly limits on bandwidth/function calls. Plenty for a new site; upgrade if you get big traffic.
