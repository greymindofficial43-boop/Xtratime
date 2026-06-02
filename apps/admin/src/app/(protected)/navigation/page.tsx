'use client';

import { adminApi, type Category } from '@/lib/api';
import { useEffect, useState, useCallback } from 'react';

type Tab = 'main' | 'mega';

function Badge({ children, color = 'slate' }: { children: React.ReactNode; color?: string }) {
  const cls = color === 'red'
    ? 'bg-red-100 text-red-700'
    : 'bg-slate-100 text-slate-600';
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cls}`}>{children}</span>;
}

export default function NavigationPage() {
  const [tab, setTab] = useState<Tab>('main');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [selectedNav, setSelectedNav] = useState<Category | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const cats = await adminApi.getCategories();
      setCategories(cats);
      const navCats = cats.filter((c) => c.showInNav && !c.parentId).sort((a, b) => a.navOrder - b.navOrder);
      if (navCats.length > 0 && !selectedNav) setSelectedNav(navCats[0]);
    } finally {
      setLoading(false);
    }
  }, [selectedNav]);

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const topLevel = categories.filter((c) => !c.parentId).sort((a, b) => a.sortOrder - b.sortOrder);
  const navItems = categories.filter((c) => c.showInNav && !c.parentId).sort((a, b) => a.navOrder - b.navOrder);

  async function toggleNav(cat: Category) {
    setSaving(cat.id);
    try {
      const newNavOrder = cat.showInNav ? cat.navOrder : navItems.length + 1;
      await adminApi.updateCategory(cat.id, { showInNav: !cat.showInNav, navOrder: newNavOrder });
      await load();
    } finally {
      setSaving(null);
    }
  }

  async function moveNav(cat: Category, dir: -1 | 1) {
    const sorted = [...navItems];
    const idx = sorted.findIndex((c) => c.id === cat.id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= sorted.length) return;
    const other = sorted[newIdx];
    setSaving(cat.id);
    try {
      await adminApi.reorderCategories([
        { id: cat.id, navOrder: other.navOrder },
        { id: other.id, navOrder: cat.navOrder },
      ]);
      await load();
    } finally {
      setSaving(null);
    }
  }

  async function toggleSubNav(sub: Category) {
    setSaving(sub.id);
    try {
      await adminApi.updateCategory(sub.id, { showInNav: !sub.showInNav });
      await load();
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[var(--admin-accent)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>Navigation Manager</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--admin-muted)' }}>
          Configure which categories appear in the main navigation and what shows inside the mega menu dropdowns.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1" style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)' }}>
        {(['main', 'mega'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
              tab === t
                ? 'bg-[var(--admin-accent)] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t === 'main' ? '☰ Main Menu' : '⊟ Mega Menu'}
          </button>
        ))}
      </div>

      {/* ── MAIN MENU TAB ── */}
      {tab === 'main' && (
        <div className="space-y-4">
          <div className="rounded-xl p-1" style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)' }}>
            {/* Current Nav Order */}
            <div className="mb-4 rounded-lg p-4" style={{ background: 'var(--admin-bg)' }}>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--admin-muted)' }}>
                Current Nav Order (visible on website header)
              </p>
              {navItems.length === 0 ? (
                <p className="text-sm text-slate-500">No categories in navigation yet. Enable some below.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {navItems.map((cat, idx) => (
                    <div key={cat.id} className="flex items-center gap-1 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-1.5">
                      <span className="text-xs font-bold text-slate-500">{idx + 1}.</span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>{cat.icon} {cat.name}</span>
                      <div className="ml-2 flex gap-0.5">
                        <button
                          type="button"
                          onClick={() => moveNav(cat, -1)}
                          disabled={idx === 0 || saving === cat.id}
                          className="rounded px-1 text-xs text-slate-400 hover:text-white disabled:opacity-30"
                        >←</button>
                        <button
                          type="button"
                          onClick={() => moveNav(cat, 1)}
                          disabled={idx === navItems.length - 1 || saving === cat.id}
                          className="rounded px-1 text-xs text-slate-400 hover:text-white disabled:opacity-30"
                        >→</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* All categories toggle */}
            <p className="mb-3 px-1 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--admin-muted)' }}>
              All Categories — Toggle Nav Visibility
            </p>
            <div className="divide-y" style={{ borderColor: 'var(--admin-border)' }}>
              {topLevel.map((cat) => {
                const inNav = cat.showInNav;
                const isSaving = saving === cat.id;
                const childCount = categories.filter((c) => c.parentId === cat.id).length;
                return (
                  <div key={cat.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="text-xl">{cat.icon || '📁'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--admin-text)' }}>{cat.name}</p>
                      <p className="text-xs" style={{ color: 'var(--admin-muted)' }}>
                        /{cat.slug} · {childCount} sub-categories
                      </p>
                    </div>
                    {inNav && <Badge color="red">In Nav</Badge>}
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => toggleNav(cat)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${inNav ? 'bg-[var(--admin-accent)]' : 'bg-slate-300'} disabled:opacity-50`}
                    >
                      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${inNav ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info box */}
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', color: 'var(--admin-muted)' }}>
            <strong style={{ color: 'var(--admin-text)' }}>Tip:</strong> The first 5 nav items show directly in the header. Additional items appear under a <em>More</em> dropdown. Use the arrows above to reorder.
          </div>
        </div>
      )}

      {/* ── MEGA MENU TAB ── */}
      {tab === 'mega' && (
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>
            Select a main menu item to configure what sub-categories appear in its mega dropdown.
          </p>

          <div className="grid grid-cols-[240px_1fr] gap-4">
            {/* Left: nav item selector */}
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)' }}>
              <p className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest" style={{ borderBottom: '1px solid var(--admin-border)', color: 'var(--admin-muted)' }}>
                Nav Items
              </p>
              {navItems.length === 0 ? (
                <p className="p-4 text-xs text-slate-500">No nav items. Add some in Main Menu tab.</p>
              ) : (
                navItems.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedNav(cat)}
                    className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold transition ${
                      selectedNav?.id === cat.id
                        ? 'bg-[var(--admin-accent)] text-white'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                    <span className="ml-auto text-[10px] opacity-60">
                      {categories.filter((c) => c.parentId === cat.id).length} sub
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Right: mega menu preview + sub-category config */}
            <div className="space-y-4">
              {selectedNav ? (
                <>
                  {/* Live preview */}
                  <div className="rounded-xl p-4" style={{ background: '#13151c', border: '1px solid #2a2c35' }}>
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Mega Menu Preview</p>
                    <div className="rounded-lg p-4" style={{ background: '#1a1c23', border: '1px solid #2a2c35' }}>
                      <div className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--admin-accent)' }}>
                        All {selectedNav.name}
                      </div>
                      <div className="h-px mb-3" style={{ background: '#2a2c35' }} />
                      <div className="grid grid-cols-3 gap-2">
                        {categories
                          .filter((c) => c.parentId === selectedNav.id && c.showInNav)
                          .map((sub) => (
                            <div key={sub.id} className="rounded-lg px-3 py-2 text-sm font-semibold text-[#a0a5b1]">
                              {sub.icon} {sub.name}
                            </div>
                          ))}
                        {categories.filter((c) => c.parentId === selectedNav.id && c.showInNav).length === 0 && (
                          <p className="col-span-3 text-xs text-slate-600 italic">No sub-categories enabled for this menu item.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sub-category toggles */}
                  <div className="rounded-xl overflow-hidden" style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)' }}>
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--admin-border)' }}>
                      <p className="text-sm font-bold" style={{ color: 'var(--admin-text)' }}>
                        {selectedNav.icon} {selectedNav.name} — Sub-categories
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--admin-muted)' }}>
                        Toggle which sub-categories appear in the dropdown
                      </p>
                    </div>

                    {categories.filter((c) => c.parentId === selectedNav.id).length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <p className="text-sm text-slate-500">No sub-categories under <strong>{selectedNav.name}</strong>.</p>
                        <p className="text-xs text-slate-400 mt-1">Go to Categories to add sub-categories.</p>
                      </div>
                    ) : (
                      <div className="divide-y" style={{ borderColor: 'var(--admin-border)' }}>
                        {categories
                          .filter((c) => c.parentId === selectedNav.id)
                          .sort((a, b) => a.sortOrder - b.sortOrder)
                          .map((sub) => {
                            const isSaving = saving === sub.id;
                            return (
                              <div key={sub.id} className="flex items-center gap-3 px-4 py-3">
                                <span className="text-lg">{sub.icon || '▸'}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold" style={{ color: 'var(--admin-text)' }}>{sub.name}</p>
                                  <p className="text-xs" style={{ color: 'var(--admin-muted)' }}>/{sub.slug}</p>
                                </div>
                                {sub.showInNav && <Badge color="red">Visible</Badge>}
                                <button
                                  type="button"
                                  disabled={isSaving}
                                  onClick={() => toggleSubNav(sub)}
                                  className={`relative h-6 w-11 rounded-full transition-colors ${sub.showInNav ? 'bg-[var(--admin-accent)]' : 'bg-slate-300'} disabled:opacity-50`}
                                >
                                  <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${sub.showInNav ? 'translate-x-5' : ''}`} />
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex h-48 items-center justify-center rounded-xl text-slate-500" style={{ border: '1px dashed var(--admin-border)' }}>
                  Select a nav item on the left to configure its mega menu
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', color: 'var(--admin-muted)' }}>
            <strong style={{ color: 'var(--admin-text)' }}>How it works:</strong> When a visitor hovers over a main nav item that has sub-categories enabled, a mega dropdown appears showing those sub-categories as links. Sub-categories are managed in the <em>Categories</em> section.
          </div>
        </div>
      )}
    </div>
  );
}
