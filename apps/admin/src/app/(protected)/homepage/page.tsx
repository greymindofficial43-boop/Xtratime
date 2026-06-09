'use client';

import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { adminApi, type HomeSection } from '@/lib/api';
import { useCallback, useEffect, useState } from 'react';

// Blocks whose on-page position is fixed regardless of order: Live Scores is a
// full-width strip at the very top, Trending lives in the right sidebar. For
// these, only show/hide and rename take effect (drag order is ignored).
const FIXED_POSITION: Record<string, string> = {
  'live-scores': 'Top of page',
  trending: 'Right sidebar',
};

const DESCRIPTIONS: Record<string, string> = {
  'live-scores': 'Live match scores strip across the top.',
  'top-stories': 'The 4 lead cards at the top of the page.',
  'more-stories': 'Secondary lead block (hero + list).',
  promo: 'Promotional banner between sections.',
  'category-sections': 'Per-category story blocks (managed under Categories).',
  'espn-news': 'Latest headlines pulled from ESPN.',
  trending: 'Most-read stories list in the sidebar.',
};

export default function HomepageBuilderPage() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getHomeSections();
      const sorted = data.slice().sort((a, b) => a.sortOrder - b.sortOrder);
      setSections(sorted);
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

  async function onDragEnd(result: DropResult) {
    const { source, destination } = result;
    if (!destination || source.index === destination.index) return;

    const next = Array.from(sections);
    const [moved] = next.splice(source.index, 1);
    next.splice(destination.index, 0, moved);
    setSections(next); // optimistic

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
    <div className="max-w-3xl space-y-6 pb-20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>Homepage Layout</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--admin-muted)' }}>
            Drag to reorder homepage sections, toggle them on/off, and rename their headings.
            Tip: which sport blocks appear under “Category Sections” is set on the Categories page.
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
            {saving === 'seed' ? 'Loading…' : '✨ Load default sections'}
          </button>
        )}
      </div>

      {sections.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center" style={{ borderColor: 'var(--admin-border)' }}>
          <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>No homepage sections yet. Click “Load default sections”.</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="HOME_SECTIONS">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {sections.map((section, index) => (
                  <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="rounded-lg border p-3"
                        style={{ background: 'var(--admin-bg)', borderColor: 'var(--admin-border)', ...provided.draggableProps.style }}
                      >
                        <div className="flex items-center gap-3">
                          <div {...provided.dragHandleProps} className="cursor-grab px-1 text-slate-500 hover:text-white" title="Drag to reorder">
                            ☰
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <input
                                value={titles[section.id] ?? ''}
                                onChange={(e) => setTitles((t) => ({ ...t, [section.id]: e.target.value }))}
                                onBlur={() => saveTitle(section)}
                                onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                disabled={saving === section.id}
                                className="w-full max-w-xs rounded-md border bg-transparent px-2 py-1 text-sm font-semibold"
                                style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}
                              />
                              {FIXED_POSITION[section.key] && (
                                <span
                                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                                  style={{ background: 'var(--admin-surface)', color: 'var(--admin-muted)' }}
                                  title="This block has a fixed position; reordering won't move it."
                                >
                                  📌 {FIXED_POSITION[section.key]}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 px-2 text-xs" style={{ color: 'var(--admin-muted)' }}>
                              {DESCRIPTIONS[section.key] ?? section.key}
                            </p>
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
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
