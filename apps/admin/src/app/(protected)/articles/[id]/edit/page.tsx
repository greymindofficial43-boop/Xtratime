'use client';

import { ArticleForm } from '@/components/ArticleForm';
import { adminApi, type Article } from '@/lib/api';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    adminApi.getArticles({ limit: '100' }).then((res) => {
      const found = res.items.find((a) => a.id === id);
      setArticle(found ?? null);
    });
  }, [id]);

  if (!article) {
    return <p className="text-slate-500">Loading article...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Edit Article</h1>
      <p className="mt-1 text-slate-500">{article.title}</p>
      <div className="mt-6">
        <ArticleForm article={article} />
      </div>
    </div>
  );
}
