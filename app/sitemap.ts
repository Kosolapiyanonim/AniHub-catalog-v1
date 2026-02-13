import type { MetadataRoute } from "next";
import { getAnimeSitemapIds } from "@/lib/server/anime-seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://anihub.wtf";
  const now = new Date();
  const animeIds = await getAnimeSitemapIds();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/catalog`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/popular`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  const animePages: MetadataRoute.Sitemap = animeIds.map((id) => ({
    url: `${siteUrl}/anime/${id}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticPages, ...animePages];
}
