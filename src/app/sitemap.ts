import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/products";
import { site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllSlugs();
  return [
    { url: `${site.url}/`, changeFrequency: "daily", priority: 1 },
    { url: `${site.url}/products`, changeFrequency: "daily", priority: 0.8 },
    ...products.map((p) => ({
      url: `${site.url}/p/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
