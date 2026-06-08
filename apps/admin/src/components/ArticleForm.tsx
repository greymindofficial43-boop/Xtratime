'use client';

import { adminApi, type Article, type Category, type Tag } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { RichTextEditor } from './RichTextEditor';
import { ArticlePreview } from './ArticlePreview';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api').replace(/\/api$/, '');

// Date -> value for <input type="datetime-local"> in the browser's local time.
function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Props = {
  article?: Article;
};

export function ArticleForm({ article }: Props) {
  const router = useRouter();
  const isEdit = !!article;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Image upload state
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(article?.featuredImage ?? '');

  const [form, setForm] = useState<{
    title: string;
    excerpt: string;
    content: string;
    featuredImage: string;
    videoUrl: string;
    status: Article['status'];
    isFeatured: boolean;
    isTrending: boolean;
    categoryId: string;
    tagIds: string[];
    publishedAt: string;
  }>({
    title: article?.title ?? '',
    excerpt: article?.excerpt ?? '',
    content: article?.content ?? '<p>Write your article content here...</p>',
    featuredImage: article?.featuredImage ?? '',
    videoUrl: article?.videoUrl ?? '',
    status: article?.status ?? 'DRAFT',
    isFeatured: article?.isFeatured ?? false,
    isTrending: article?.isTrending ?? false,
    categoryId: article?.categoryId ?? '',
    tagIds: article?.tags.map((t) => t.id) ?? [],
    // datetime-local value (local time). Existing date on edit, else now.
    publishedAt: toLocalInput(article?.publishedAt ? new Date(article.publishedAt) : new Date()),
  });

  useEffect(() => {
    Promise.all([adminApi.getCategories(), adminApi.getTags()]).then(([cats, tgs]) => {
      setCategories(cats);
      setTags(tgs);
      setForm((f) => (!f.categoryId && cats[0] ? { ...f, categoryId: cats[0].id } : f));
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);

    setImageUploading(true);
    try {
      const token = localStorage.getItem('token') ?? sessionStorage.getItem('token') ?? '';
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/api/uploads`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json() as { url: string };
      const fullUrl = data.url;
      update('featuredImage', fullUrl);
      setImagePreview(fullUrl);
    } catch (err) {
      setError('Image upload failed. Please try again or paste a URL instead.');
      setImagePreview(form.featuredImage);
    } finally {
      setImageUploading(false);
    }
  }

  /** Extract a valid YouTube embed URL from any YouTube link */
  function getYouTubeEmbedUrl(url: string): string | null {
    if (!url) return null;
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Prevent submitting articles that contain inline base64 image data URLs — these create very large payloads.
      if (form.content.includes('data:')) {
        throw new Error('Article content contains inline images (data URLs). Please upload images using the Upload button and ensure uploads are configured in the API (Cloudinary).');
      }
      const payload = {
        ...form,
        status: form.status as Article['status'],
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
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

  const embedUrl = getYouTubeEmbedUrl(form.videoUrl);

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4">
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

        {/* ── Featured Image ── */}
        <div>
          <label className="block text-sm font-medium mb-2">Featured Image</label>

          {/* Image preview */}
          {imagePreview && (
            <div className="relative mb-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-56 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => { setImagePreview(''); update('featuredImage', ''); }}
                className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white hover:bg-black/80"
              >
                ✕ Remove
              </button>
            </div>
          )}

          {/* Upload from local */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={imageUploading}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
            >
              {imageUploading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                  Uploading…
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Upload from Computer
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <span className="text-xs text-slate-400">or</span>
            {/* Paste URL */}
            <input
              value={form.featuredImage}
              onChange={(e) => { update('featuredImage', e.target.value); setImagePreview(e.target.value); }}
              placeholder="Paste image URL…"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-400">Accepted: JPG, PNG, GIF, WebP · Max 10 MB</p>
        </div>

        {/* ── YouTube Video URL ── */}
        <div>
          <label className="block text-sm font-medium mb-1">
            YouTube Video URL
            <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">Optional</span>
          </label>
          <div className="flex items-center gap-2">
            <svg className="shrink-0 text-red-500" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1C4.5 20.4 12 20.4 12 20.4s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg>
            <input
              value={form.videoUrl}
              onChange={(e) => update('videoUrl', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          {/* Inline preview of video */}
          {embedUrl && (
            <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-black" style={{ aspectRatio: '16/9' }}>
              <iframe
                src={embedUrl}
                title="Video preview"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          <p className="mt-1 text-xs text-slate-400">
            Supports youtube.com/watch, youtu.be, and Shorts links. Video will play inline on the article page.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Content *</label>
          <RichTextEditor
            value={form.content}
            onChange={(val) => update('content', val)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4">
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
          <div>
            <label className="block text-sm font-medium">Publish date &amp; time</label>
            <input
              type="datetime-local"
              value={form.publishedAt}
              onChange={(e) => update('publishedAt', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <p className="mt-1 text-xs text-slate-400">Shown on the article. Defaults to now; change it to backdate.</p>
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
          onClick={() => setShowPreview(true)}
          className="rounded-lg border border-slate-300 px-6 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
        >
          👁 Preview
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-slate-300 px-6 py-2.5 font-medium"
        >
          Cancel
        </button>
      </div>

      <ArticlePreview
        open={showPreview}
        onClose={() => setShowPreview(false)}
        data={{
          title: form.title,
          excerpt: form.excerpt,
          content: form.content,
          featuredImage: form.featuredImage,
          categoryName: categories.find((c) => c.id === form.categoryId)?.name ?? '',
          publishedAt: form.publishedAt,
        }}
      />
    </form>
  );
}
