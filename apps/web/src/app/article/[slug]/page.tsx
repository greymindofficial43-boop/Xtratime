import { notFound, permanentRedirect } from 'next/navigation';
import { api } from '@/lib/api';

type Props = {
  params: { slug: string };
};

export default async function LegacyArticlePage({ params }: Props) {
  const article = await api.getArticle(params.slug).catch(() => null);

  if (article) {
    permanentRedirect(`/${article.category.slug}/${article.slug}`);
  } else {
    notFound();
  }
}