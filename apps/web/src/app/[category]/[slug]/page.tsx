import { notFound } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { sanitizeArticleHtml } from '@/lib/sanitize';
import { formatDateTime } from '@/lib/format';
import { ShareButtons } from '@/components/ShareButtons';
import { ArticleCard } from '@/components/ArticleCard';
import { AdSlot } from '@/components/AdSlot';
import { GallerySlideshow } from '@/components/GallerySlideshow';
import { YouTubeStrip } from '@/components/YouTubeStrip';
import { getYouTubeEmbedUrl } from '@/lib/youtube';
import { t } from '@/lib/strings';

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string; category: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug, category } = await params;
  const article = await api.getArticle(slug).catch(() => null);
  if (!article || article.category.slug !== category) {
    return { title: 'Not Found' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const canonical = `${siteUrl}/${article.category.slug}/${article.slug}`;

  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt,
    keywords: article.metaKeywords,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      url: canonical,
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [article.author.name],
      images: article.featuredImage ? [article.featuredImage] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt ?? undefined,
      images: article.featuredImage ? [article.featuredImage] : undefined,
    },
    alternates: {
      canonical,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug, category } = await params;
  const article = await api.getArticle(slug).catch(() => null);
  if (!article || article.category.slug !== category) {
    notFound();
  }

  const relatedRes = await api.getArticles({
    categoryId: article.category.id,
    limit: 5,
  });
  const relatedArticles = relatedRes.items.filter((a) => a.id !== article.id).slice(0, 4);

  const sanitizedContent = sanitizeArticleHtml(article.content);

  return (
    <div className="mx-auto max-w-[1200px] px-3 sm:px-5">
      <div className="grid grid-cols-12 gap-x-5 lg:gap-x-8">

        {/* Main content */}
        <div className="col-span-12 lg:col-span-8">
          <article className="py-4 md:py-6">
            <header>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/category/${article.category.slug}`}
                  className="font-bold text-[var(--sk-accent)] hover:underline"
                >
                  {article.category.name}
                </Link>
                {article.categories
                  ?.filter((c) => c.id !== article.category.id)
                  .map((c) => (
                    <Link
                      key={c.id}
                      href={`/category/${c.slug}`}
                      className="rounded-full border border-[var(--sk-border)] px-2.5 py-0.5 text-xs font-semibold text-[var(--sk-muted)] transition hover:border-[var(--sk-accent)] hover:text-[var(--sk-accent)]"
                    >
                      {c.name}
                    </Link>
                  ))}
              </div>
              <h1 className="mt-1 text-2xl font-extrabold leading-tight md:text-3xl lg:text-4xl">
                {article.title}
              </h1>
              <p className="mt-2 text-base text-[var(--sk-muted)] md:text-lg">{article.excerpt}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span>{t.by} {article.author.name}</span>
                <span className="text-[var(--sk-muted)]">•</span>
                <span className="text-[var(--sk-muted)]">
                  {t.published} {formatDateTime(article.publishedAt ?? article.createdAt)}
                </span>
              </div>
              <div className="mt-4">
                <ShareButtons
                  url={`/${article.category.slug}/${article.slug}`}
                  title={article.title}
                />
              </div>
            </header>

            <AdSlot zone="article-top" className="my-4" />

            {article.type === 'GALLERY' && article.galleryImages?.length ? (
              <GallerySlideshow images={article.galleryImages} />
            ) : (() => {
              const embedUrl = getYouTubeEmbedUrl(article.videoUrl);
              if (embedUrl) {
                return (
                  <div className="my-5 overflow-hidden rounded-xl bg-black" style={{ aspectRatio: '16 / 9' }}>
                    <iframe
                      src={embedUrl}
                      title={article.title}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                );
              }
              if (article.featuredImage) {
                return (
                  <div className="my-5 overflow-hidden rounded-xl bg-[var(--sk-surface)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="mx-auto h-auto w-full object-contain"
                    />
                  </div>
                );
              }
              return null;
            })()}

            {article.type !== 'GALLERY' && (
              <div
                className="prose prose-lg max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            )}

            <AdSlot zone="article-bottom" className="my-4" />

            <footer className="mt-8 border-t border-[var(--sk-border)] pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{t.relatedStories}</h3>
                <ShareButtons
                  url={`/${article.category.slug}/${article.slug}`}
                  title={article.title}
                />
              </div>
            </footer>
          </article>
        </div>

        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-4">
          <div className="sticky top-[65px] py-4 md:py-6">
            <AdSlot zone="sidebar" className="mb-5" />
            <h3 className="text-xl font-bold">{t.moreFrom} {article.category.name}</h3>
            <div className="mt-3 flex flex-col">
              {relatedArticles.map((related) => (
                <ArticleCard key={related.id} article={related} size="list" />
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* YouTube videos strip — full width below article */}
      <div className="mt-10 pb-8">
        <YouTubeStrip maxVideos={8} />
      </div>
    </div>
  );
}
