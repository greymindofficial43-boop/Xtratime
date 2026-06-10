'use client';

import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { adminApi, type Category, type HomeSection } from '@/lib/api';
import { useCallback, useEffect, useMemo, useState } from 'react';

const FIXED_POSITION: Record<string, string> = {
  'live-scores': 'Top of page',
  trending: 'Right sidebar',
};

const DESCRIPTIONS: Record<string, string> = {
  'live-scores': 'Live match scores strip across the top.',
  'top-stories': 'The 4 lead cards at the top of the page.',
  'more-stories': 'Secondary lead block (hero + list).',
  promo: 'Promotional banner between sections.',
  'category-sections': 'Automatic category blocks managed under Categories.',
  'espn-news': 'Latest headlines pulled from ESPN.',
  trending: 'Most-read stories list in the sidebar.',
};

type Draft = {
  title: string;
  categoryId: string;
  articleLimit: number;
};

const emptyDraft: Draft = { title: '', categoryId: '', articleLimit: 6 };

export default function HomepageBuilderPage() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const selectableCategories = useMemo(
    () => categories.filter((category) => !category.parentId),
    [categories],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sectionData, categoryData] = await Promise.all([
        adminApi.getHomeSections(),
        adminApi.getCategories(),
      ]);
      const sorted = sectionData.slice().sort((a, b) => a.sortOrder - b.sortOrder);
      setSections(sorted);
      setCategories(categoryData);
      setTitles(Object.fromEntries(sorted.map((s) => [s.id, s.title])));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    load();
  }, [load]);

  async function toggle(section: HomeSection) {
    setSaving(section.id);
    try {
      await adminApi.updateHomeSection(section.id, { enabled: !section.enabled });
      await load();
    } finally {
      setSaving(null);
    }
  }

  async function saveTitle(section: HomeSection) {
    const next = (titles[section.id] ?? '').trim();
    if (!next || next === section.title) return;
    setSaving(section.id);
    try {
      await adminApi.updateHomeSection(section.id, { title: next });
      await load();
    } finally {
      setSaving(null);
    }
  }

  async function updateCustomSection(section: HomeSection, data: Partial<HomeSection>) {
    setSaving(section.id);
    try {
      await adminApi.updateHomeSectionDetails(section.id, data);
      await load();
    } finally {
      setSaving(null);
    }
  }

  async function createCustomSection() {
    const title = draft.title.trim();
    if (!title || !draft.categoryId) {
      alert('Add a title and choose a category.');
      return;
    }

    setSaving('create');
    try {
      await adminApi.createHomeSection({
        title,
        type: 'CUSTOM_CATEGORY',
        categoryId: draft.categoryId,
        articleLimit: draft.articleLimit,
        enabled: true,
      });
      setDraft(emptyDraft);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not create section');
    } finally {
      setSaving(null);
    }
  }

  async function deleteCustomSection(section: HomeSection) {
    if (!confirm(`Delete "${section.title}" from the homepage layout?`)) return;
    setSaving(section.id);
    try {
      await adminApi.deleteHomeSection(section.id);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not delete section');
    } finally {
      setSaving(null);
    }
  }

  async function onDragEnd(result: DropResult) {
    const { source, destination } = result;
    if (!destination || source.index === destination.index) return;

    const next = Array.from(sections);
    const [moved] = next.splice(source.index, 1);
    next.splice(destination.index, 0, moved);
    setSections(next);

    setSaving('drag');
    try {
      await adminApi.reorderHomeSections(next.map((s, idx) => ({ id: s.id, sortOrder: idx })));
      await load();
    } finally {
      setSaving(null);
    }
  }

  if (!isMounted || loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[var(--admin-accent)]" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6 pb-20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>Homepage Layout</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--admin-muted)' }}>
            Reorder, hide, rename, and add category sections to the public homepage.
          </p>
        </div>
        {sections.length === 0 && (
          <button
            type="button"
            disabled={saving === 'seed'}
            onClick={async () => {
              setSaving('seed');
              try {
                await adminApi.seedHomeSections();
                await load();
              } finally {
                setSaving(null);
              }
            }}
            className="shrink-0 rounded-lg bg-[var(--admin-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving === 'seed' ? 'Loading...' : 'Load default sections'}
          </button>
        )}
      </div>

      <div
        className="rounded-xl border p-4"
        style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}
      >
        <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>
          Add Homepage Section
        </h2>
        <div className="mt-3 grid gap-3 md:grid-cols-[1.4fr_1fr_120px_auto]">
          <input
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            placeholder="Section title"
            className="rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
          />
          <select
            value={draft.categoryId}
            onChange={(event) => setDraft((current) => ({ ...current, categoryId: event.target.value }))}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
          >
            <option value="">Choose category</option>
            {selectableCategories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            max={20}
            value={draft.articleLimit}
            onChange={(event) => setDraft((current) => ({ ...current, articleLimit: Number(event.target.value) || 6 }))}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
            aria-label="Article limit"
          />
          <button
            type="button"
            onClick={createCustomSection}
            disabled={saving === 'create'}
            className="rounded-lg bg-[var(--admin-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving === 'create' ? 'Adding...' : 'Add Section'}
          </button>
        </div>
      </div>

      {sections.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center" style={{ borderColor: 'var(--admin-border)' }}>
          <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>No homepage sections yet. Load the defaults or add a custom section.</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="HOME_SECTIONS">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {sections.map((section, index) => {
                  const isCustom = section.type === 'CUSTOM_CATEGORY';
                  return (
                    <Draggable key={section.id} draggableId={section.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="rounded-lg border p-3"
                          style={{ background: 'var(--admin-bg)', borderColor: 'var(--admin-border)', ...provided.draggableProps.style }}
                        >
                          <div className="flex items-start gap-3">
                            <div {...provided.dragHandleProps} className="cursor-grab px-1 pt-2 text-slate-500 hover:text-white" title="Drag to reorder">
                              =
                            </div>

                            <div className="min-w-0 flex-1 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <input
                                  value={titles[section.id] ?? ''}
                                  onChange={(e) => setTitles((t) => ({ ...t, [section.id]: e.target.value }))}
                                  onBlur={() => saveTitle(section)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                  disabled={saving === section.id}
                                  className="w-full max-w-xs rounded-md border bg-transparent px-2 py-1 text-sm font-semibold"
                                  style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}
                                />
                                <span
                                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                                  style={{ background: 'var(--admin-surface)', color: 'var(--admin-muted)' }}
                                >
                                  {isCustom ? 'Custom category' : 'Default'}
                                </span>
                                {FIXED_POSITION[section.key] && (
                                  <span
                                    className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                                    style={{ background: 'var(--admin-surface)', color: 'var(--admin-muted)' }}
                                  >
                                    {FIXED_POSITION[section.key]}
                                  </span>
                                )}
                              </div>

                              <p className="px-2 text-xs" style={{ color: 'var(--admin-muted)' }}>
                                {isCustom
                                  ? `Shows latest articles from ${section.category?.name ?? 'selected category'}.`
                                  : DESCRIPTIONS[section.key] ?? section.key}
                              </p>

                              {isCustom && (
                                <div className="grid gap-2 px-2 sm:grid-cols-[1fr_120px_auto]">
                                  <select
                                    value={section.categoryId ?? ''}
                                    onChange={(event) => updateCustomSection(section, { categoryId: event.target.value })}
                                    disabled={saving === section.id}
                                    className="rounded-lg border px-3 py-2 text-sm"
                                    style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-surface)', color: 'var(--admin-text)' }}
                                  >
                                    {selectableCategories.map((category) => (
                                      <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                  </select>
                                  <input
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={section.articleLimit ?? 6}
                                    onChange={(event) => updateCustomSection(section, { articleLimit: Number(event.target.value) || 6 })}
                                    disabled={saving === section.id}
                                    className="rounded-lg border px-3 py-2 text-sm"
                                    style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-surface)', color: 'var(--admin-text)' }}
                                    aria-label="Article limit"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => deleteCustomSection(section)}
                                    disabled={saving === section.id}
                                    className="rounded-lg px-3 py-2 text-sm font-semibold text-red-500 disabled:opacity-60"
                                    style={{ background: 'var(--admin-surface)' }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => toggle(section)}
                              disabled={saving === section.id}
                              className={`shrink-0 rounded px-2.5 py-1 text-xs font-semibold disabled:opacity-50 ${
                                section.enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-slate-400'
                              }`}
                            >
                              {section.enabled ? 'Visible' : 'Hidden'}
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
