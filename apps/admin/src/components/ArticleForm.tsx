'use client';

import { adminApi, type Article, type Category, type Tag } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

type Props = {
  article?: Article;
};

export function ArticleForm({ article }: Props) {
  const router = useRouter();
  const isEdit = !!article;

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<{
    title: string;
    excerpt: string;
    content: string;
    featuredImage: string;
    status: Article['status'];
    isFeatured: boolean;
    isTrending: boolean;
    categoryId: string;
    tagIds: string[];
  }>({
    title: article?.title ?? '',
    excerpt: article?.excerpt ?? '',
    content: article?.content ?? '<p>Write your article content here...</p>',
    featuredImage: article?.featuredImage ?? '',
    status: article?.status ?? 'DRAFT',
    isFeatured: article?.isFeatured ?? false,
    isTrending: article?.isTrending ?? false,
    categoryId: article?.categoryId ?? '',
    tagIds: article?.tags.map((t) => t.id) ?? [],
  });

  useEffect(() => {
    Promise.all([adminApi.getCategories(), adminApi.getTags()]).then(([cats, tgs]) => {
      setCategories(cats);
      setTags(tgs);
      if (!form.categoryId && cats[0]) {
        setForm((f) => ({ ...f, categoryId: cats[0].id }));
      }
    });
  }, []);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleTag(tagId: string) {
    setForm((f) => ({
      ...f,
      tagIds: f.tagIds.includes(tagId)
        ? f.tagIds.filter((id) => id !== tagId)
        : [...f.tagIds, tagId],
    }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        status: form.status as Article['status'],
      };
      if (isEdit && article) {
        await adminApi.updateArticle(article.id, payload);
      } else {
        await adminApi.createArticle(payload);
      }
      router.push('/articles');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Title *</label>
          <input
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            required
            minLength={5}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Excerpt</label>
          <textarea
            value={form.excerpt}
            onChange={(e) => update('excerpt', e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Featured Image URL</label>
          <input
            value={form.featuredImage}
            onChange={(e) => update('featuredImage', e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Content (HTML) *</label>
          <textarea
            value={form.content}
            onChange={(e) => update('content', e.target.value)}
            rows={12}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
            required
          />
          <p className="mt-1 text-xs text-slate-400">
            Use HTML tags: &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;li&gt;, etc.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Category *</label>
            <select
              value={form.categoryId}
              onChange={(e) => update('categoryId', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              value={form.status}
              onChange={(e) => update('status', e.target.value as Article['status'])}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => update('isFeatured', e.target.checked)}
            />
            Featured on homepage
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isTrending}
              onChange={(e) => update('isTrending', e.target.checked)}
            />
            Trending sidebar
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  form.tagIds.includes(tag.id)
                    ? 'border-[var(--admin-accent)] bg-red-50 text-[var(--admin-accent)]'
                    : 'border-slate-300 text-slate-600'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[var(--admin-accent)] px-6 py-2.5 font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Article' : 'Create Article'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-slate-300 px-6 py-2.5 font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
