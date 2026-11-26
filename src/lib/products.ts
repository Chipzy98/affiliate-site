import "server-only";
import { sql, safe } from "./db";
import type { Product, ProductCardData } from "./types";

export const PAGE_SIZE = 24;

function toRating<T extends { rating: unknown }>(row: T): T {
  return { ...row, rating: row.rating === null || row.rating === undefined ? null : Number(row.rating) };
}

// ---------- Public queries ----------

export function getFeaturedProducts(limit = 8) {
  return safe(async () => {
    const rows = await sql<ProductCardData[]>`
      select id, slug, title, image_url, price, original_price, rating, store, category
      from products
      where active and featured
      order by updated_at desc
      limit ${limit}
    `;
    return rows.map(toRating);
  }, [] as ProductCardData[]);
}

export function getLatestProducts(limit = 12) {
  return safe(async () => {
    const rows = await sql<ProductCardData[]>`
      select id, slug, title, image_url, price, original_price, rating, store, category
      from products
      where active
      order by created_at desc
      limit ${limit}
    `;
    return rows.map(toRating);
  }, [] as ProductCardData[]);
}

export function getCategories() {
  return safe(async () => {
    const rows = await sql<{ category: string; count: number }[]>`
      select category, count(*)::int as count
      from products
      where active
      group by category
      order by count desc, category asc
    `;
    return [...rows];
  }, [] as { category: string; count: number }[]);
}

export function getStores() {
  return safe(async () => {
    const rows = await sql<{ store: string }[]>`
      select distinct store from products where active order by store
    `;
    return rows.map((r) => r.store);
  }, [] as string[]);
}

export type ProductSearch = { q?: string; category?: string; store?: string; sort?: string; page?: number };

export function searchProducts({ q, category, store, sort, page = 1 }: ProductSearch) {
  return safe(
    async () => {
      const offset = (Math.max(page, 1) - 1) * PAGE_SIZE;
      const term = q?.trim() ? `%${q.trim().replace(/[%_\\]/g, (m) => "\\" + m)}%` : null;

      const where = sql`
        where active
        ${term ? sql`and (title ilike ${term} or description ilike ${term} or category ilike ${term})` : sql``}
        ${category ? sql`and category = ${category}` : sql``}
        ${store ? sql`and store = ${store}` : sql``}
      `;

      const order =
        sort === "rating"
          ? sql`order by rating desc nulls last, created_at desc`
          : sql`order by created_at desc`;

      const [items, total] = await Promise.all([
        sql<ProductCardData[]>`
          select id, slug, title, image_url, price, original_price, rating, store, category
          from products ${where} ${order}
          limit ${PAGE_SIZE} offset ${offset}
        `,
        sql<{ n: number }[]>`select count(*)::int as n from products ${where}`,
      ]);
      return { items: items.map(toRating), total: total[0]?.n ?? 0 };
    },
    { items: [] as ProductCardData[], total: 0 },
  );
}

export function getProductBySlug(slug: string) {
  return safe(async () => {
    const rows = await sql<Product[]>`select * from products where slug = ${slug} and active limit 1`;
    return rows[0] ? toRating(rows[0]) : null;
  }, null as Product | null);
}

export function getRelatedProducts(category: string, excludeId: number, limit = 4) {
  return safe(async () => {
    const rows = await sql<ProductCardData[]>`
      select id, slug, title, image_url, price, original_price, rating, store, category
      from products
      where active and category = ${category} and id <> ${excludeId}
      order by featured desc, created_at desc
      limit ${limit}
    `;
    return rows.map(toRating);
  }, [] as ProductCardData[]);
}

export function getAffiliateUrl(id: number) {
  return safe(async () => {
    const rows = await sql<{ affiliate_url: string }[]>`
      select affiliate_url from products where id = ${id} and active limit 1
    `;
    return rows[0]?.affiliate_url ?? null;
  }, null as string | null);
}

export function getAllSlugs() {
  return safe(async () => {
    const rows = await sql<{ slug: string; updated_at: Date }[]>`
      select slug, updated_at from products where active order by updated_at desc limit 5000
    `;
    return [...rows];
  }, [] as { slug: string; updated_at: Date }[]);
}

// ---------- Admin queries ----------

export type AdminProductRow = Product & { clicks_30d: number };

export function adminListProducts(q?: string) {
  return safe(async () => {
    const term = q?.trim() ? `%${q.trim()}%` : null;
    const rows = await sql<AdminProductRow[]>`
      select p.*,
        (select count(*)::int from clicks c
          where c.product_id = p.id and c.created_at >= now() - interval '30 days') as clicks_30d
      from products p
      ${term ? sql`where p.title ilike ${term} or p.category ilike ${term} or p.store ilike ${term}` : sql``}
      order by p.created_at desc
      limit 500
    `;
    return rows.map(toRating);
  }, [] as AdminProductRow[]);
}

export function adminGetProduct(id: number) {
  return safe(async () => {
    const rows = await sql<Product[]>`select * from products where id = ${id} limit 1`;
    return rows[0] ? toRating(rows[0]) : null;
  }, null as Product | null);
}

export function getAllCategoryNames() {
  return safe(async () => {
    const rows = await sql<{ category: string }[]>`select distinct category from products order by category`;
    return rows.map((r) => r.category);
  }, [] as string[]);
}
