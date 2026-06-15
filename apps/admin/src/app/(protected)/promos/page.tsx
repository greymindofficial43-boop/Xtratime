'use client';

import { adminApi, type Promo } from '@/lib/api';
import { FormEvent, useEffect, useState } from 'react';
import { MediaPickerModal } from '@/components/MediaPickerModal';

const emptyForm = {
  title: '',
  label: '',
  imageUrl: '',
  href: '',
  emoji: '',
  openInNewTab: false,
  enabled: true,
  sortOrder: 0,
};

export default function PromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setPromos(await adminApi.getPromos());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(promo: Promo) {
    setEditingId(promo.id);
    setForm({
      title: promo.title,
      label: promo.label ?? '',
      imageUrl: promo.imageUrl ?? '',
      href: promo.href,
      emoji: promo.emoji ?? '',
      openInNewTab: promo.openInNewTab,
      enabled: promo.enabled,
      sortOrder: promo.sortOrder,
    });
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    try {
      const res = await adminApi.uploadFile(e.target.files[0]);
      setForm((f) => ({ ...f, imageUrl: res.absoluteUrl }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title,
      label: form.label || undefined,
      imageUrl: form.imageUrl || undefined,
      href: form.href,
      emoji: form.emoji || undefined,
      openInNewTab: form.openInNewTab,
      enabled: form.enabled,
      sortOrder: Number(form.sortOrder) || 0,
    };
    try {
      if (editingId) await adminApi.updatePromo(editingId, payload);
      else await adminApi.createPromo(payload);
      resetForm();
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function toggle(promo: Promo) {
    await adminApi.updatePromo(promo.id, { enabled: !promo.enabled });
    await load();
  }

  async function handleDelete(promo: Promo) {
    if (!confirm(`Delete promo "${promo.title}"?`)) return;
    await adminApi.deletePromo(promo.id);
    if (editingId === promo.id) resetForm();
    await load();
  }

  const inputCls = 'mt-1 w-full rounded-lg border px-3 py-2 text-sm';
  const inputStyle = { borderColor: 'var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>Homepage Promos</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--admin-muted)' }}>
          The promo banners shown in the homepage &ldquo;Promo Banner&rdquo; block. Add as many as you
          like — they render in a responsive grid in the order below. Toggle the whole block on/off
          under <strong>Homepage</strong>.
        </p>
      </div>

      {/* Create / edit form */}
      <form
        onSubmit={onSubmit}
        className="rounded-xl border p-5"
        style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)', boxShadow: 'var(--admin-shadow)' }}
      >
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>
          {editingId ? 'Edit Promo' : 'Add New Promo'}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium" style={{ color: 'var(--admin-muted)' }}>Title *</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={inputCls} style={inputStyle} placeholder="e.g. Catch every NFL game" required minLength={2} />
          </div>
          <div>
            <label className="block text-xs font-medium" style={{ color: 'var(--admin-muted)' }}>Eyebrow label</label>
            <input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              className={inputCls} style={inputStyle} placeholder="e.g. NFL (optional)" />
          </div>
          <div>
            <label className="block text-xs font-medium" style={{ color: 'var(--admin-muted)' }}>Emoji</label>
            <input value={form.emoji} onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
              className={inputCls} style={inputStyle} placeholder="🏈 (optional)" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium" style={{ color: 'var(--admin-muted)' }}>Link URL *</label>
            <input value={form.href} onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
              className={inputCls} style={inputStyle} placeholder="/category/nfl or https://..." required />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium" style={{ color: 'var(--admin-muted)' }}>Background image</label>
            <div className="mt-1 flex gap-2">
              <input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm" style={inputStyle} placeholder="https://… or upload →" />
              <label className="flex shrink-0 cursor-pointer items-center rounded-lg border px-3 text-xs font-semibold"
                style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
                {uploading ? '…' : 'Upload'}
                <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
              </label>
              <button type="button" onClick={() => setShowMediaPicker(true)}
                className="shrink-0 rounded-lg border px-3 text-xs font-semibold"
                style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
                ⬚ Library
              </button>
            </div>
            <MediaPickerModal
              open={showMediaPicker}
              onClose={() => setShowMediaPicker(false)}
              onSelect={(urls) => setForm((f) => ({ ...f, imageUrl: urls[0] }))}
            />
            {form.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.imageUrl} alt="" className="mt-2 h-24 w-full rounded-lg object-cover" />
            )}
          </div>
          <div>
            <label className="block text-xs font-medium" style={{ color: 'var(--admin-muted)' }}>Order</label>
            <input type="number" value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
              className={inputCls} style={inputStyle} />
          </div>
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--admin-text)' }}>
              <input type="checkbox" checked={form.enabled} onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))} />
              Visible
            </label>
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--admin-text)' }}>
              <input type="checkbox" checked={form.openInNewTab} onChange={(e) => setForm((f) => ({ ...f, openInNewTab: e.target.checked }))} />
              Open in new tab
            </label>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button type="submit" disabled={saving}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: 'var(--admin-accent)' }}>
            {saving ? 'Saving…' : editingId ? 'Update Promo' : 'Add Promo'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm}
              className="rounded-lg border px-4 py-2 text-sm font-medium"
              style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="overflow-x-auto rounded-xl border"
        style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)', boxShadow: 'var(--admin-shadow)' }}>
        {loading ? (
          <p className="p-8 text-sm" style={{ color: 'var(--admin-muted)' }}>Loading…</p>
        ) : promos.length === 0 ? (
          <p className="p-8 text-sm" style={{ color: 'var(--admin-muted)' }}>
            No promos yet. Add one above — until you do, the homepage falls back to the default ESPN cards.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b" style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)' }}>
              <tr>
                <th className="px-5 py-3 text-xs font-bold uppercase" style={{ color: 'var(--admin-muted)' }}>Promo</th>
                <th className="px-5 py-3 text-xs font-bold uppercase" style={{ color: 'var(--admin-muted)' }}>Link</th>
                <th className="px-5 py-3 text-xs font-bold uppercase" style={{ color: 'var(--admin-muted)' }}>Order</th>
                <th className="px-5 py-3 text-xs font-bold uppercase" style={{ color: 'var(--admin-muted)' }}>Status</th>
                <th className="px-5 py-3 text-xs font-bold uppercase" style={{ color: 'var(--admin-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((promo) => (
                <tr key={promo.id} className="border-b last:border-0" style={{ borderColor: 'var(--admin-border)' }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {promo.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={promo.imageUrl} alt="" className="h-10 w-16 shrink-0 rounded object-cover" />
                      ) : (
                        <span className="flex h-10 w-16 shrink-0 items-center justify-center rounded text-lg"
                          style={{ background: 'var(--admin-bg)' }}>{promo.emoji || '🖼'}</span>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold" style={{ color: 'var(--admin-text)' }}>{promo.title}</p>
                        {promo.label && <p className="text-xs" style={{ color: 'var(--admin-muted)' }}>{promo.label}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 max-w-[200px] truncate text-xs" style={{ color: 'var(--admin-muted)' }}>{promo.href}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--admin-muted)' }}>{promo.sortOrder}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggle(promo)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${promo.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {promo.enabled ? 'Visible' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => startEdit(promo)} className="text-sm font-medium" style={{ color: 'var(--admin-accent-2)' }}>Edit</button>
                      <button onClick={() => handleDelete(promo)} className="text-sm font-medium text-red-500 hover:text-red-700">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
