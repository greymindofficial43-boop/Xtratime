import { notFound, permanentRedirect } from 'next/navigation';
import { api } from '@/lib/api';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function LegacyArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await api.getArticle(slug).catch(() => null);

  if (article) {
    permanentRedirect(`/${article.category.slug}/${article.slug}`);
  } else {
    notFound();
  }
}