'use client';

import { adminApi, type PopupAd } from '@/lib/api';
import { FormEvent, useEffect, useState } from 'react';

const emptyForm = {
  title: '',
  imageUrl: '',
  linkUrl: '',
  openInNewTab: true,
  enabled: true,
  startDate: '',
  endDate: '',
  sortOrder: 0,
};

// ISO (UTC) -> value for <input type="datetime-local"> (local time, no seconds).
function toLocalInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function fmt(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

export default function PopupAdsPage() {
  const [ads, setAds] = useState<PopupAd[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setAds(await adminApi.getPopupAds());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(ad: PopupAd) {
    setEditingId(ad.id);
    setForm({
      title: ad.title ?? '',
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
      openInNewTab: ad.openInNewTab,
      enabled: ad.enabled,
      startDate: toLocalInput(ad.startDate),
      endDate: toLocalInput(ad.endDate),
      sortOrder: ad.sortOrder,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (!form.imageUrl) { alert('Please add an image.'); return; }
    if (!form.linkUrl) { alert('Please add a link URL.'); return; }
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      alert('End date must be after the start date.');
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title || undefined,
      imageUrl: form.imageUrl,
      linkUrl: form.linkUrl,
      openInNewTab: form.openInNewTab,
      enabled: form.enabled,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      sortOrder: Number(form.sortOrder) || 0,
    };
    try {
      if (editingId) await adminApi.updatePopupAd(editingId, payload);
      else await adminApi.createPopupAd(payload);
      resetForm();
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function toggle(ad: PopupAd) {
    await adminApi.updatePopupAd(ad.id, { enabled: !ad.enabled });
    await load();
  }

  async function handleDelete(ad: PopupAd) {
    if (!confirm(`Delete popup ad "${ad.title || ad.linkUrl}"?`)) return;
    await adminApi.deletePopupAd(ad.id);
    if (editingId === ad.id) resetForm();
    await load();
  }

  // Live = enabled and within the date window right now.
  function isLive(ad: PopupAd): boolean {
    if (!ad.enabled) return false;
    const now = Date.now();
    if (ad.startDate && new Date(ad.startDate).getTime() > now) return false;
    if (ad.endDate && new Date(ad.endDate).getTime() < now) return false;
    return true;
  }

  const inputCls = 'mt-1 w-full rounded-lg border px-3 py-2 text-sm';
  const inputStyle = { borderColor: 'var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' };
  const labelCls = 'block text-xs font-medium';
  const labelStyle = { color: 'var(--admin-muted)' };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>Popup Ads</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--admin-muted)' }}>
          A full-screen popup shown to visitors. Add an image and a link — clicking it redirects to
          that URL. Set an optional start/end date to schedule when it shows, and visitors can close
          it with the × button. Leave the dates empty to show it as long as it&apos;s enabled.
        </p>
      </div>

      {/* Create / edit form */}
      <form
        onSubmit={onSubmit}
        className="rounded-xl border p-5"
        style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)', boxShadow: 'var(--admin-shadow)' }}
      >
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>
          {editingId ? 'Edit Popup Ad' : 'Add New Popup Ad'}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls} style={labelStyle}>Title <span className="font-normal">(internal label, optional)</span></label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={inputCls} style={inputStyle} placeholder="e.g. Diwali sale popup" />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls} style={labelStyle}>Image *</label>
            <div className="mt-1 flex gap-2">
              <input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm" style={inputStyle} placeholder="https://… or upload →" />
              <label className="flex shrink-0 cursor-pointer items-center rounded-lg border px-3 text-xs font-semibold"
                style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}>
                {uploading ? '…' : 'Upload'}
                <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
              </label>
            </div>
            {form.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.imageUrl} alt="" className="mt-2 max-h-48 w-auto rounded-lg object-contain" />
            )}
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls} style={labelStyle}>Link URL *</label>
            <input value={form.linkUrl} onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
              className={inputCls} style={inputStyle} placeholder="https://example.com/offer" required />
          </div>

          <div>
            <label className={labelCls} style={labelStyle}>Show from <span className="font-normal">(optional)</span></label>
            <input type="datetime-local" value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Show until <span className="font-normal">(optional)</span></label>
            <input type="datetime-local" value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              className={inputCls} style={inputStyle} />
          </div>

          <div>
            <label className={labelCls} style={labelStyle}>Order</label>
            <input type="number" value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
              className={inputCls} style={inputStyle} />
          </div>
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--admin-text)' }}>
              <input type="checkbox" checked={form.enabled} onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))} />
              Enabled
            </label>
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--admin-text)' }}>
              <input type="checkbox" checked={form.openInNewTab} onChange={(e) => setForm((f) => ({ ...f, openInNewTab: e.target.checked }))} />
              Open link in new tab
            </label>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button type="submit" disabled={saving}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: 'var(--admin-accent)' }}>
            {saving ? 'Saving…' : editingId ? 'Update Popup' : 'Add Popup'}
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
        ) : ads.length === 0 ? (
          <p className="p-8 text-sm" style={{ color: 'var(--admin-muted)' }}>
            No popup ads yet. Add one above and it&apos;ll show on the site during its date window.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b" style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)' }}>
              <tr>
                <th className="px-5 py-3 text-xs font-bold uppercase" style={{ color: 'var(--admin-muted)' }}>Popup</th>
                <th className="px-5 py-3 text-xs font-bold uppercase" style={{ color: 'var(--admin-muted)' }}>Schedule</th>
                <th className="px-5 py-3 text-xs font-bold uppercase" style={{ color: 'var(--admin-muted)' }}>Status</th>
                <th className="px-5 py-3 text-xs font-bold uppercase" style={{ color: 'var(--admin-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <tr key={ad.id} className="border-b last:border-0" style={{ borderColor: 'var(--admin-border)' }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ad.imageUrl} alt="" className="h-10 w-16 shrink-0 rounded object-cover" />
                      <div className="min-w-0">
                        <p className="font-semibold" style={{ color: 'var(--admin-text)' }}>{ad.title || '(untitled)'}</p>
                        <p className="max-w-[220px] truncate text-xs" style={{ color: 'var(--admin-muted)' }}>{ad.linkUrl}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--admin-muted)' }}>
                    {fmt(ad.startDate)} <span className="opacity-60">→</span> {fmt(ad.endDate)}
                  </td>
                  <td className="px-5 py-3">
                    {isLive(ad) ? (
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">Live</span>
                    ) : ad.enabled ? (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">Scheduled</span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">Off</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => toggle(ad)} className="text-sm font-medium" style={{ color: 'var(--admin-accent-2)' }}>
                        {ad.enabled ? 'Disable' : 'Enable'}
                      </button>
                      <button onClick={() => startEdit(ad)} className="text-sm font-medium" style={{ color: 'var(--admin-accent-2)' }}>Edit</button>
                      <button onClick={() => handleDelete(ad)} className="text-sm font-medium text-red-500 hover:text-red-700">Delete</button>
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
