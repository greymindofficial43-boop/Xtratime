import type { MetadataRoute } from 'next';
import { api, type Article } from '@/lib/api';
import { site } from '@/lib/site';

// Rebuilt hourly so new articles/categories show up for crawlers.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.siteUrl.replace(/\/$/, '');

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base || '/', changeFrequency: 'hourly' as const, priority: 1 },
    { url: `${base}/gallery`, changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${base}/videos`, changeFrequency: 'daily' as const, priority: 0.7 },
  ].map((r) => ({ ...r, lastModified: new Date() }));

  let categories: Awaited<ReturnType<typeof api.getCategories>> = [];
  let articles: Article[] = [];
  try {
    categories = await api.getCategories();
  } catch {
    categories = [];
  }
  try {
    const res = await api.getArticles({ status: 'PUBLISHED', limit: 1000 });
    articles = res.items;
  } catch {
    articles = [];
  }

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${base}/${a.category.slug}/${a.slug}`,
    lastModified: new Date(a.publishedAt ?? a.createdAt),
    changeFrequency: 'weekly',
    priority: a.isFeatured ? 0.9 : 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
