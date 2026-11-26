"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { deleteOldAnalytics } from "@/lib/analytics";
import { isHttpUrl, slugify } from "@/lib/format";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

// ---------------- Login / logout ----------------

export type LoginState = { error?: string };

function sha256(s: string) {
  return createHash("sha256").update(s).digest();
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected.length < 8) {
    return { error: "ADMIN_PASSWORD is not set (min 8 characters). Add it to your environment variables." };
  }
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 16) {
    return { error: "SESSION_SECRET is not set (min 16 characters). Add it to your environment variables." };
  }

  const password = String(formData.get("password") ?? "");
  const ok = timingSafeEqual(sha256(password), sha256(expected));
  if (!ok) {
    await new Promise((r) => setTimeout(r, 800)); // slow down password guessing
    return { error: "Wrong password." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  redirect("/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// ---------------- Products ----------------

export type ProductFormState = { error?: string; fieldErrors?: Record<string, string> };

function refreshPublicPages(slug?: string) {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/p/${slug}`);
}

export async function saveProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();

  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const id = Number(get("id")) || null;
  const title = get("title").slice(0, 200);
  const affiliateUrl = get("affiliate_url");
  const imageUrl = get("image_url");
  const ratingRaw = get("rating");
  const rating = ratingRaw === "" ? null : Number(ratingRaw);

  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = "Title is required.";
  if (!isHttpUrl(affiliateUrl)) fieldErrors.affiliate_url = "Enter a full link starting with https://";
  if (imageUrl && !isHttpUrl(imageUrl)) fieldErrors.image_url = "Enter a full image link starting with https://";
  if (rating !== null && (!Number.isFinite(rating) || rating < 0 || rating > 5))
    fieldErrors.rating = "Rating must be between 0 and 5.";
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const data = {
    title,
    description: get("description").slice(0, 5000),
    image_url: imageUrl,
    price: get("price").slice(0, 40),
    original_price: get("original_price").slice(0, 40),
    rating,
    store: get("store").slice(0, 40) || "Amazon",
    category: get("category").slice(0, 60) || "General",
    affiliate_url: affiliateUrl,
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
  };

  const baseSlug = slugify(get("slug") || title) || "product";
  let savedSlug = baseSlug;
  let oldSlug: string | undefined;

  try {
    for (let attempt = 0; attempt < 5; attempt++) {
      const slug = attempt === 0 ? baseSlug : `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
      try {
        if (id) {
          const before = await sql<{ slug: string }[]>`select slug from products where id = ${id}`;
          if (!before[0]) return { error: "This product no longer exists." };
          oldSlug = before[0].slug;
          await sql`
            update products set ${sql({ ...data, slug })}, updated_at = now()
            where id = ${id}
          `;
        } else {
          await sql`insert into products ${sql({ ...data, slug })}`;
        }
        savedSlug = slug;
        break;
      } catch (err) {
        // 23505 = slug already used by another product -> try again with a suffix
        if ((err as { code?: string }).code === "23505" && attempt < 4) continue;
        throw err;
      }
    }
  } catch (err) {
    console.error("[saveProduct]", err);
    return { error: "Could not save the product. Check the database connection and try again." };
  }

  refreshPublicPages(savedSlug);
  if (oldSlug && oldSlug !== savedSlug) revalidatePath(`/p/${oldSlug}`);
  revalidatePath("/admin/products");
  redirect(`/admin/products?saved=${encodeURIComponent(title)}`);
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  const rows = await sql<{ slug: string }[]>`delete from products where id = ${id} returning slug`;
  refreshPublicPages(rows[0]?.slug);
  revalidatePath("/admin/products");
  redirect("/admin/products?deleted=1");
}

export async function toggleProduct(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const field = String(formData.get("field"));
  if (!Number.isInteger(id) || (field !== "featured" && field !== "active")) return;
  const rows =
    field === "featured"
      ? await sql<{ slug: string }[]>`update products set featured = not featured, updated_at = now() where id = ${id} returning slug`
      : await sql<{ slug: string }[]>`update products set active = not active, updated_at = now() where id = ${id} returning slug`;
  refreshPublicPages(rows[0]?.slug);
  revalidatePath("/admin/products");
}

// ---------------- Analytics ----------------

export async function cleanupAnalytics(formData: FormData) {
  await requireAdmin();
  const days = Math.max(30, Number(formData.get("days")) || 180);
  const removed = await deleteOldAnalytics(days);
  revalidatePath("/admin");
  redirect(`/admin/visitors?cleaned=${removed}`);
}
