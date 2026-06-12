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

  // Gallery images state
  type GalleryEntry = { tempId: string; url: string; caption: string; order: number; uploading?: boolean };
  const [galleryImages, setGalleryImages] = useState<GalleryEntry[]>(
    (article?.galleryImages ?? []).map((img, i) => ({
      tempId: img.id,
      url: img.url,
      caption: img.caption ?? '',
      order: img.order ?? i,
    }))
  );
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<{
    type: 'ARTICLE' | 'GALLERY';
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage: string;
    videoUrl: string;
    status: Article['status'];
    isFeatured: boolean;
    isTrending: boolean;
    categoryId: string;
    categoryIds: string[];
    tagIds: string[];
    publishedAt: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
  }>({
    type: (article?.type as 'ARTICLE' | 'GALLERY') ?? 'ARTICLE',
    title: article?.title ?? '',
    slug: article?.slug ?? '',
    excerpt: article?.excerpt ?? '',
    content: article?.content ?? '<p>Write your article content here...</p>',
    featuredImage: article?.featuredImage ?? '',
    videoUrl: article?.videoUrl ?? '',
    status: article?.status ?? 'DRAFT',
    isFeatured: article?.isFeatured ?? false,
    isTrending: article?.isTrending ?? false,
    categoryId: article?.categoryId ?? '',
    categoryIds:
      article?.categories?.map((c) => c.id) ??
      (article?.categoryId ? [article.categoryId] : []),
    tagIds: article?.tags.map((t) => t.id) ?? [],
    publishedAt: toLocalInput(article?.publishedAt ? new Date(article.publishedAt) : new Date()),
    metaTitle: article?.metaTitle ?? '',
    metaDescription: article?.metaDescription ?? '',
    metaKeywords: article?.metaKeywords ?? '',
  });

  useEffect(() => {
    Promise.all([adminApi.getCategories(), adminApi.getTags()]).then(([cats, tgs]) => {
      setCategories(cats);
      setTags(tgs);
      setForm((f) =>
        !f.categoryId && cats[0]
          ? { ...f, categoryId: cats[0].id, categoryIds: [cats[0].id] }
          : f,
      );
    });
  }, []);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Toggle a category on/off. The first selected becomes the main (URL) category;
  // unchecking the main one promotes the next selected category.
  function toggleCategory(id: string) {
    setForm((f) => {
      const selected = f.categoryIds.includes(id)
        ? f.categoryIds.filter((c) => c !== id)
        : [...f.categoryIds, id];
      let primary = f.categoryId;
      if (!selected.includes(primary)) primary = selected[0] ?? '';
      if (!primary && selected.length) primary = selected[0];
      return { ...f, categoryIds: selected, categoryId: primary };
    });
  }

  function setPrimaryCategory(id: string) {
    setForm((f) => ({
      ...f,
      categoryId: id,
      categoryIds: f.categoryIds.includes(id) ? f.categoryIds : [...f.categoryIds, id],
    }));
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

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const token = localStorage.getItem('token') ?? sessionStorage.getItem('token') ?? '';
    const tempEntries: GalleryEntry[] = files.map((f, i) => ({
      tempId: `tmp-${Date.now()}-${i}`,
      url: URL.createObjectURL(f),
      caption: '',
      order: galleryImages.length + i,
      uploading: true,
    }));
    setGalleryImages((prev) => [...prev, ...tempEntries]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tempId = tempEntries[i].tempId;
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE}/api/uploads`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json() as { url: string };
        setGalleryImages((prev) =>
          prev.map((img) => img.tempId === tempId ? { ...img, url: data.url, uploading: false } : img)
        );
      } catch {
        setGalleryImages((prev) => prev.filter((img) => img.tempId !== tempId));
      }
    }
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  }

  function removeGalleryImage(tempId: string) {
    setGalleryImages((prev) => prev.filter((img) => img.tempId !== tempId));
  }

  function updateGalleryCaption(tempId: string, caption: string) {
    setGalleryImages((prev) => prev.map((img) => img.tempId === tempId ? { ...img, caption } : img));
  }

  function moveGalleryImage(tempId: string, direction: -1 | 1) {
    setGalleryImages((prev) => {
      const idx = prev.findIndex((img) => img.tempId === tempId);
      if (idx < 0) return prev;
      const next = idx + direction;
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr.map((img, i) => ({ ...img, order: i }));
    });
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
      if (form.type === 'ARTICLE' && form.content.includes('data:')) {
        throw new Error('Article content contains inline images (data URLs). Please upload images using the Upload button and ensure uploads are configured in the API (Cloudinary).');
      }
      if (!form.categoryId || form.categoryIds.length === 0) {
        throw new Error('Please select at least one category.');
      }
      if (form.type === 'GALLERY' && galleryImages.filter((i) => !i.uploading).length === 0) {
        throw new Error('Please add at least one image to the gallery.');
      }
      const payload = {
        ...form,
        categoryIds: Array.from(new Set([form.categoryId, ...form.categoryIds])),
        status: form.status as Article['status'],
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
        galleryImages: form.type === 'GALLERY'
          ? galleryImages.filter((i) => !i.uploading).map((img, idx) => ({ url: img.url, caption: img.caption || undefined, order: idx }))
          : undefined,
        // Empty slug => let the API auto-generate from the title.
        slug: form.slug.trim() || undefined,
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

      {/* ── Article type toggle ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <label className="block text-sm font-medium mb-3">Content Type</label>
        <div className="flex gap-3">
          {(['ARTICLE', 'GALLERY'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => update('type', t)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                form.type === t
                  ? 'border-[var(--admin-accent)] bg-red-50 text-[var(--admin-accent)]'
                  : 'border-slate-300 text-slate-600 hover:border-slate-400'
              }`}
            >
              {t === 'ARTICLE' ? '📝 Article' : '🖼️ Photo Gallery'}
            </button>
          ))}
        </div>
        {form.type === 'GALLERY' && (
          <p className="mt-2 text-xs text-slate-400">Gallery articles show a full-screen slideshow. Upload multiple images below.</p>
        )}
      </div>

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
          <label className="block text-sm font-medium">
            URL slug <span className="font-normal text-slate-400">(the article&apos;s web address)</span>
          </label>
          <input
            value={form.slug}
            onChange={(e) => update('slug', e.target.value)}
            placeholder="auto-generated from the title — leave blank for that"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-slate-400">
            Works with any language (e.g. Bangla). Leave blank to auto-create from the title.
          </p>
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
                className="mx-auto max-h-72 w-full object-contain"
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

        {form.type === 'ARTICLE' ? (
          <div>
            <label className="block text-sm font-medium mb-1">Content *</label>
            <RichTextEditor
              value={form.content}
              onChange={(val) => update('content', val)}
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-2">Gallery Images *</label>
            <p className="mb-3 text-xs text-slate-400">Upload images in order. You can reorder with the ↑ ↓ buttons. Add a caption for each slide.</p>

            {/* Image list */}
            <div className="space-y-3 mb-4">
              {galleryImages.map((img, idx) => (
                <div key={img.tempId} className="flex gap-3 rounded-lg border border-slate-200 p-3">
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                    {img.uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      </div>
                    )}
                    <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">{idx + 1}</span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <input
                      value={img.caption}
                      onChange={(e) => updateGalleryCaption(img.tempId, e.target.value)}
                      placeholder="Caption (optional)"
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                    />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => moveGalleryImage(img.tempId, -1)} disabled={idx === 0} className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-30">↑</button>
                      <button type="button" onClick={() => moveGalleryImage(img.tempId, 1)} disabled={idx === galleryImages.length - 1} className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-30">↓</button>
                      <button type="button" onClick={() => removeGalleryImage(img.tempId)} className="rounded border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add images button */}
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 hover:border-slate-400 hover:bg-slate-100 transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Add Images
            </button>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleGalleryUpload}
            />
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Categories *</label>
            <p className="mb-2 mt-0.5 text-xs text-slate-400">
              Tick every category this article belongs to. The one marked{' '}
              <span className="font-semibold text-[var(--admin-accent)]">Main</span> sets the
              article&apos;s URL; the rest also list it on their category pages.
            </p>
            <div className="grid max-h-56 grid-cols-1 gap-1.5 overflow-y-auto rounded-lg border border-slate-300 p-2 sm:grid-cols-2">
              {categories.map((c) => {
                const checked = form.categoryIds.includes(c.id);
                const isPrimary = form.categoryId === c.id;
                return (
                  <div
                    key={c.id}
                    className={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 ${
                      checked ? 'bg-red-50' : ''
                    }`}
                  >
                    <label className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCategory(c.id)}
                      />
                      <span className="truncate">
                        {c.icon ? `${c.icon} ` : ''}
                        {c.name}
                      </span>
                    </label>
                    {checked && (
                      <button
                        type="button"
                        onClick={() => setPrimaryCategory(c.id)}
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide transition ${
                          isPrimary
                            ? 'bg-[var(--admin-accent)] text-white'
                            : 'border border-slate-300 text-slate-500 hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)]'
                        }`}
                        title={isPrimary ? 'This is the main category' : 'Make this the main category'}
                      >
                        {isPrimary ? '★ Main' : 'Set main'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
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

        <div>
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
          <p className="mt-1.5 text-xs text-slate-400">
            Featured articles take the large hero slots on the homepage (Top Stories, the
            More Stories hero, and their category section). Tip: give a featured article a
            good image so the big slot looks its best.
          </p>
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

      {/* ── SEO settings (per-post meta tags) ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-700">🔍 SEO settings</h2>
          <span className="text-xs text-slate-400">How this post appears on Google &amp; social shares</span>
        </div>

        <div>
          <label className="block text-sm font-medium">Meta title</label>
          <input
            value={form.metaTitle}
            onChange={(e) => update('metaTitle', e.target.value)}
            placeholder={form.title || 'Defaults to the article title'}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <p className={`mt-1 text-xs ${form.metaTitle.length > 60 ? 'text-red-500' : 'text-slate-400'}`}>
            {form.metaTitle.length}/60 — leave blank to use the title.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium">Meta description</label>
          <textarea
            value={form.metaDescription}
            onChange={(e) => update('metaDescription', e.target.value)}
            rows={3}
            placeholder={form.excerpt || 'Defaults to the excerpt'}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <p className={`mt-1 text-xs ${form.metaDescription.length > 160 ? 'text-red-500' : 'text-slate-400'}`}>
            {form.metaDescription.length}/160 — leave blank to use the excerpt.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium">Focus keywords</label>
          <input
            value={form.metaKeywords}
            onChange={(e) => update('metaKeywords', e.target.value)}
            placeholder="cricket, ipl, virat kohli"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <p className="mt-1 text-xs text-slate-400">Comma-separated keywords.</p>
        </div>

        {/* Live Google snippet preview */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Google preview</p>
          <p className="truncate text-base text-[#1a0dab]">{form.metaTitle || form.title || 'Article title'}</p>
          <p className="text-xs text-[#006621]">your-site › article</p>
          <p className="line-clamp-2 text-sm text-slate-600">
            {form.metaDescription || form.excerpt || 'Your meta description preview will appear here…'}
          </p>
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
