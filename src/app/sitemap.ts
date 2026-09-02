import type { MetadataRoute } from "next";
import { SITE_PAGES, siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteUrl();
  const now = new Date();
  return SITE_PAGES.map((page) => ({
    url: `${origin}${page.path === "/" ? "" : page.path}`,
    lastModified: now,
    changeFrequency: page.path === "/" || page.path === "/globe" ? "hourly" : "daily",
    priority: page.path === "/" ? 1 : page.path === "/login" ? 0.6 : 0.8,
  }));
}
