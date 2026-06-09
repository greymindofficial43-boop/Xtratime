import { notFound } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';
import { sanitize } from '@/lib/sanitize';
import { formatDateTime } from '@/lib/format';
import { ShareButtons } from '@/components/ShareButtons';
import { ArticleCard } from '@/components/ArticleCard';
import { AdSlot } from '@/components/AdSlot';
import { RandomAdInjector } from '@/components/RandomAdInjector';

type Props = {
  params: { slug: string; category: string };
};

export async function generateMetadata({ params }: Props) {
  const article = await api.getArticle(params.slug).catch(() => null);
  if (!article || article.category.slug !== params.category) {
    return { title: 'Not Found' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const canonical = `${siteUrl}/${article.category.slug}/${article.slug}`;

  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt,
    keywords: article.metaKeywords,
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt,
      url: canonical,
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [article.author.name],
      images: article.featuredImage ? [article.featuredImage] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt,
      images: article.featuredImage ? [article.featuredImage] : undefined,
    },
    alternates: {
      canonical,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await api.getArticle(params.slug).catch(() => null);
  if (!article || article.category.slug !== params.category) {
    notFound();
  }

  const relatedArticles = await api.getArticles({
    categoryId: article.category.id,
    exclude: article.id,
    limit: 4,
  });

  const sanitizedContent = sanitize(article.content);

  return (
    <div className="mx-auto max-w-[1200px] px-3 sm:px-5">
      <div className="grid grid-cols-12 gap-x-5 lg:gap-x-8">
        {/* Main content */}
        <div className="col-span-12 lg:col-span-8">
          <article className="py-4 md:py-6">
            <header>
              <p className="font-bold text-[var(--sk-accent)]">{article.category.name}</p>
              <h1 className="mt-1 text-2xl font-extrabold leading-tight md:text-3xl lg:text-4xl">
                {article.title}
              </h1>
              <p className="mt-2 text-base text-[var(--sk-muted)] md:text-lg">{article.excerpt}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span>By {article.author.name}</span>
                <span className="text-[var(--sk-muted)]">•</span>
                <span className="text-[var(--sk-muted)]">
                  Published {formatDateTime(article.publishedAt ?? article.createdAt)}
                </span>
              </div>
              <div className="mt-4">
                <ShareButtons
                  url={`/${article.category.slug}/${article.slug}`}
                  title={article.title}
                  className="justify-start"
                />
              </div>
            </header>

            <AdSlot slotId="article-top" className="my-4" />

            {article.featuredImage && (
              <div className="relative my-5 aspect-video overflow-hidden rounded-xl">
                <Image
                  src={article.featuredImage}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            <div
              className="prose prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />

            <AdSlot slotId="article-bottom" className="my-4" />

            <footer className="mt-8 border-t border-[var(--sk-border)] pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Related stories</h3>
                <ShareButtons
                  url={`/${article.category.slug}/${article.slug}`}
                  title={article.title}
                  className="justify-end"
                />
              </div>
            </footer>
          </article>
        </div>

        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-4">
          <div className="sticky top-[65px] py-4 md:py-6">
            <AdSlot slotId="sidebar" className="mb-5" />
            <h3 className="text-xl font-bold">More from {article.category.name}</h3>
            <div className="mt-3 flex flex-col">
              <RandomAdInjector>
                {relatedArticles.map((related) => (
                  <ArticleCard key={related.id} article={related} size="list" />
                ))}
              </RandomAdInjector>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
