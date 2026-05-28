'use client';

import { adminApi, type Advertisement, type AdType } from '@/lib/api';
import { FormEvent, useEffect, useState } from 'react';

const emptyForm = {
  title: '',
  type: 'CUSTOM' as AdType,
  partnerName: '',
  imageUrl: '',
  targetUrl: '',
  googleCode: '',
  slotId: 'inline',
  isActive: true,
};

const placements: { id: string; label: string }[] = [
  { id: 'inline', label: 'Inline Banner (Wide)' },
  { id: 'sidebar', label: 'Sidebar Ad (Square/Tall)' },
];

function ctr(views: number, clicks: number): string {
  if (!views) return '0.00%';
  return ((clicks / views) * 100).toFixed(2) + '%';
}

function MetricCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-black text-slate-800">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

export default function AdsPage() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const data = await adminApi.getAds();
    setAds(data);
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function handleImageUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    let url = e.target.value;
    try {
      if (url.includes('google.com/imgres')) {
        const urlObj = new URL(url);
        const imgurl = urlObj.searchParams.get('imgurl');
        if (imgurl) url = decodeURIComponent(imgurl);
      }
    } catch {
      // Ignore parsing errors
    }
    setForm((prev) => ({ ...prev, imageUrl: url }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title: form.title,
      type: form.type,
      partnerName: form.partnerName || undefined,
      imageUrl: form.type === 'CUSTOM' ? form.imageUrl || undefined : undefined,
      targetUrl: form.type === 'CUSTOM' ? form.targetUrl || undefined : undefined,
      googleCode: (form.type === 'GOOGLE' || form.type === 'THIRD_PARTY') ? form.googleCode || undefined : undefined,
      slotId: form.slotId,
      isActive: form.isActive,
    };

    try {
      if (editingId) {
        await adminApi.updateAd(editingId, payload);
      } else {
        await adminApi.createAd(payload);
      }
      resetForm();
      await load();
    } finally {
      setSaving(false);
    }
  }

  function startEdit(ad: Advertisement) {
    setEditingId(ad.id);
    setForm({
      title: ad.title,
      type: ad.type,
      partnerName: ad.partnerName ?? '',
      imageUrl: ad.imageUrl ?? '',
      targetUrl: ad.targetUrl ?? '',
      googleCode: ad.googleCode ?? '',
      slotId: ad.slotId,
      isActive: ad.isActive,
    });
  }

  async function handleDelete(ad: Advertisement) {
    if (!confirm(`Delete ad "${ad.title}"?`)) return;
    await adminApi.deleteAd(ad.id);
    if (editingId === ad.id) resetForm();
    load();
  }

  // Aggregate metrics
  const totalViews = ads.reduce((s, a) => s + (a.views ?? 0), 0);
  const totalClicks = ads.reduce((s, a) => s + (a.clicks ?? 0), 0);
  const overallCtr = ctr(totalViews, totalClicks);

  // Top 3 by CTR (must have at least 1 view)
  const topAds = [...ads]
    .filter((a) => (a.views ?? 0) > 0)
    .sort((a, b) => {
      const ctrA = (a.clicks ?? 0) / (a.views ?? 1);
      const ctrB = (b.clicks ?? 0) / (b.views ?? 1);
      return ctrB - ctrA;
    })
    .slice(0, 3);

  return (
    <div>
      <h1 className="text-2xl font-bold">Ads</h1>
      <p className="mt-1 text-slate-500">Manage partner banners and Google ad slots for the site.</p>

      {/* ── Metrics Overview ── */}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Total Views" value={totalViews.toLocaleString()} sub="All active ads" />
        <MetricCard label="Total Clicks" value={totalClicks.toLocaleString()} sub="All active ads" />
        <MetricCard label="Overall CTR" value={overallCtr} sub="clicks / views" />
        <MetricCard label="Active Ads" value={ads.filter((a) => a.isActive).length} sub={`of ${ads.length} total`} />
      </div>

      {/* ── Top Performing Ads ── */}
      {topAds.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-700">
            <span>🏆</span> Top Performing Ads (by CTR)
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {topAds.map((ad, i) => (
              <div
                key={ad.id}
                className="flex items-center gap-3 rounded-lg border border-amber-100 bg-white p-3 shadow-sm"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-black text-amber-600">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{ad.title}</p>
                  <p className="text-xs text-slate-500">
                    CTR: <span className="font-bold text-amber-600">{ctr(ad.views ?? 0, ad.clicks ?? 0)}</span>
                    {' · '}{(ad.views ?? 0).toLocaleString()} views · {(ad.clicks ?? 0).toLocaleString()} clicks
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Create / Edit Form ── */}
      <form
        onSubmit={onSubmit}
        className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="mb-4 text-sm font-semibold text-slate-700">{editingId ? 'Edit Ad' : 'Create New Ad'}</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-slate-500">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="e.g. Dream11 Sidebar Banner"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as AdType }))}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              <option value="CUSTOM">Custom Banner</option>
              <option value="GOOGLE">Google Ad</option>
              <option value="THIRD_PARTY">3rd Party Ad</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Placement</label>
            <select
              value={form.slotId}
              onChange={(e) => setForm((prev) => ({ ...prev, slotId: e.target.value }))}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              {placements.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Partner Name</label>
            <input
              value={form.partnerName}
              onChange={(e) => setForm((prev) => ({ ...prev, partnerName: e.target.value }))}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="Optional"
            />
          </div>
        </div>

        {form.type === 'CUSTOM' ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-500">Image URL</label>
              <input
                value={form.imageUrl}
                onChange={handleImageUrlChange}
                className="mt-1 w-full rounded-lg border px-3 py-2"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Target URL</label>
              <input
                value={form.targetUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, targetUrl: e.target.value }))}
                className="mt-1 w-full rounded-lg border px-3 py-2"
                placeholder="https://..."
              />
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <label className="block text-xs font-medium text-slate-500">Ad Script / HTML Code</label>
            <textarea
              value={form.googleCode}
              onChange={(e) => setForm((prev) => ({ ...prev, googleCode: e.target.value }))}
              className="mt-1 min-h-32 w-full rounded-lg border px-3 py-2 font-mono text-sm"
              placeholder="<script>...</script> or <div>...</div>"
            />
          </div>
        )}

        <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
          />
          Active
        </label>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[var(--admin-accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
          >
            {saving ? 'Saving...' : editingId ? 'Update Ad' : 'Add Ad'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* ── Ads Table ── */}
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {ads.length === 0 ? (
          <p className="p-8 text-slate-500">No ads created yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Slot</th>
                <th className="px-4 py-3 font-medium text-right">Views</th>
                <th className="px-4 py-3 font-medium text-right">Clicks</th>
                <th className="px-4 py-3 font-medium text-right">CTR</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => {
                const adCtr = ctr(ad.views ?? 0, ad.clicks ?? 0);
                const ctrNum = (ad.views ?? 0) > 0 ? ((ad.clicks ?? 0) / (ad.views ?? 1)) * 100 : 0;
                return (
                  <tr key={ad.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{ad.title}</p>
                      <p className="text-xs text-slate-500">{ad.partnerName ?? 'No partner name'}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{ad.type}</td>
                    <td className="px-4 py-3 text-slate-600">{ad.slotId}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">
                      {(ad.views ?? 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">
                      {(ad.clicks ?? 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-semibold ${
                          ctrNum >= 2 ? 'text-green-600' : ctrNum >= 0.5 ? 'text-amber-600' : 'text-slate-500'
                        }`}
                      >
                        {adCtr}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          ad.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {ad.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button onClick={() => startEdit(ad)} className="text-blue-600 hover:underline">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(ad)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
