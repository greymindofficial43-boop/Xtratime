import type { MetadataRoute } from 'next';
import { api, type Article } from '@/lib/api';
import { site } from '@/lib/site';

// Rebuilt hourly so new articles/categories show up for crawlers.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.siteUrl.replace(/\/$/, '');

  const staticRoutes: MetadataRoute.Sitemap = ['', '/schedule', '/standings', '/players'].map(
    (path) => ({
      url: `${base}${path || '/'}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: path === '' ? 1 : 0.6,
    }),
  );

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
    url: `${base}/article/${a.slug}`,
    lastModified: new Date(a.publishedAt ?? a.createdAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
