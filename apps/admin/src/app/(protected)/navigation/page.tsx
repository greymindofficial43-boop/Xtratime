'use client';

import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { adminApi, type Category, type MenuItem, type MenuItemType } from '@/lib/api';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function NavigationBuilderPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Left sidebar states
  const [expandedSection, setExpandedSection] = useState<'categories' | 'custom'>('categories');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set());
  const [customLink, setCustomLink] = useState({ title: '', href: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [menuItems, cats] = await Promise.all([
        adminApi.getMenus(),
        adminApi.getCategories(),
      ]);
      setMenus(menuItems);
      setCategories(cats);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    load();
  }, [load]);

  const mainItems = useMemo(
    () => menus.slice().sort((a, b) => a.sortOrder - b.sortOrder),
    [menus],
  );

  async function handleAddCategories() {
    if (selectedCategoryIds.size === 0) return;
    setSaving('add-cats');
    try {
      const selectedCats = categories.filter(c => selectedCategoryIds.has(c.id));
      for (const cat of selectedCats) {
        // If it's a child category, try to find its parent in the menu to nest it automatically
        let parentMenuId: string | undefined = undefined;
        if (cat.parentId) {
          const parentMenu = mainItems.find(m => m.categoryId === cat.parentId);
          if (parentMenu) {
            parentMenuId = parentMenu.id;
          }
        }

        await adminApi.createMenu({
          title: cat.name,
          type: 'CATEGORY',
          categoryId: cat.id,
          placement: parentMenuId ? 'MEGA' : 'MAIN',
          parentId: parentMenuId,
        });
      }
      setSelectedCategoryIds(new Set());
      await load();
    } finally {
      setSaving(null);
    }
  }

  async function handleAddCustomLink() {
    if (!customLink.title || !customLink.href) return;
    setSaving('add-custom');
    try {
      await adminApi.createMenu({
        title: customLink.title,
        href: customLink.href,
        type: 'INTERNAL',
        placement: 'MAIN',
      });
      setCustomLink({ title: '', href: '' });
      await load();
    } finally {
      setSaving(null);
    }
  }

  async function removeItem(id: string) {
    if (!confirm('Remove this item from the menu?')) return;
    setSaving(id);
    try {
      await adminApi.deleteMenu(id);
      await load();
    } finally {
      setSaving(null);
    }
  }

  async function updateItemVisibility(id: string, isVisible: boolean) {
    setSaving(id);
    try {
      await adminApi.updateMenu(id, { isVisible });
      await load();
    } finally {
      setSaving(null);
    }
  }

  async function makeSubItem(item: MenuItem, previousSibling: MenuItem) {
    setSaving(item.id);
    try {
      await adminApi.updateMenu(item.id, { parentId: previousSibling.id, placement: 'MEGA' });
      await load();
    } finally {
      setSaving(null);
    }
  }

  async function makeMainItem(item: MenuItem) {
    setSaving(item.id);
    try {
      await adminApi.updateMenu(item.id, { parentId: null, placement: 'MAIN' });
      await load();
    } finally {
      setSaving(null);
    }
  }

  async function onDragEnd(result: DropResult) {
    const { source, destination, type } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    setSaving('drag');
    try {
      if (type === 'MAIN') {
        const newMainItems = Array.from(mainItems);
        const [removed] = newMainItems.splice(source.index, 1);
        newMainItems.splice(destination.index, 0, removed);
        
        await adminApi.reorderMenus(
          newMainItems.map((item, idx) => ({ id: item.id, sortOrder: idx }))
        );
      } else if (type === 'MEGA') {
        // Dragging a sub-item
        const sourceParentId = source.droppableId;
        const destParentId = destination.droppableId;
        
        const sourceParent = mainItems.find(m => m.id === sourceParentId);
        const destParent = mainItems.find(m => m.id === destParentId);
        if (!sourceParent || !destParent) return;

        if (sourceParentId === destParentId) {
          // Reorder within the same parent
          const children = Array.from(sourceParent.children || []);
          const [removed] = children.splice(source.index, 1);
          children.splice(destination.index, 0, removed);
          
          await adminApi.reorderMenus(
            children.map((item, idx) => ({ id: item.id, sortOrder: idx }))
          );
        } else {
          // Move to a different parent
          const sourceChildren = Array.from(sourceParent.children || []);
          const destChildren = Array.from(destParent.children || []);
          
          const [removed] = sourceChildren.splice(source.index, 1);
          destChildren.splice(destination.index, 0, removed);
          
          // 1. Update the parent ID of the moved item
          await adminApi.updateMenu(removed.id, { parentId: destParentId });
          
          // 2. Update sort orders for the destination list
          await adminApi.reorderMenus(
            destChildren.map((item, idx) => ({ id: item.id, sortOrder: idx }))
          );
        }
      }
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
    <div className="max-w-6xl space-y-6 pb-20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>Menu Builder</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--admin-muted)' }}>
            Add categories or custom links from the left column, then drag and drop them to arrange your site&apos;s navigation.
          </p>
        </div>
        {mainItems.length === 0 && (
          <button
            type="button"
            disabled={saving === 'seed'}
            onClick={async () => {
              setSaving('seed');
              try {
                await adminApi.seedMenus();
                await load();
              } finally {
                setSaving(null);
              }
            }}
            className="shrink-0 rounded-lg bg-[var(--admin-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving === 'seed' ? 'Loading…' : '✨ Load default menu'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[300px_1fr]">
        {/* Left Column: Add Items */}
        <div className="space-y-4">
          <div className="rounded-xl border" style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}>
            <div className="p-3 border-b" style={{ borderColor: 'var(--admin-border)' }}>
              <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--admin-text)' }}>Add menu items</h2>
            </div>
            
            {/* Categories Accordion */}
            <div className="border-b" style={{ borderColor: 'var(--admin-border)' }}>
              <button 
                onClick={() => setExpandedSection(expandedSection === 'categories' ? '' as any : 'categories')}
                className="flex w-full items-center justify-between p-4 text-sm font-semibold"
                style={{ color: 'var(--admin-text)' }}
              >
                Categories
                <span>{expandedSection === 'categories' ? '▲' : '▼'}</span>
              </button>
              {expandedSection === 'categories' && (
                <div className="p-4 pt-0">
                  <div className="max-h-48 overflow-y-auto rounded border p-2 mb-3 space-y-1" style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)' }}>
                    {categories.filter(c => !c.parentId).map(cat => (
                      <div key={cat.id}>
                        <label className="flex items-center gap-2 text-sm p-1 hover:bg-white/5 rounded cursor-pointer font-bold">
                          <input 
                            type="checkbox" 
                            checked={selectedCategoryIds.has(cat.id)}
                            onChange={(e) => {
                              const newSet = new Set(selectedCategoryIds);
                              if (e.target.checked) newSet.add(cat.id);
                              else newSet.delete(cat.id);
                              setSelectedCategoryIds(newSet);
                            }}
                            className="rounded border-slate-600 bg-transparent text-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                          />
                          <span style={{ color: 'var(--admin-text)' }}>{cat.name}</span>
                        </label>
                        {/* Sub-categories */}
                        {categories.filter(sub => sub.parentId === cat.id).map(sub => (
                          <label key={sub.id} className="flex items-center gap-2 text-sm p-1 hover:bg-white/5 rounded cursor-pointer ml-6">
                            <input 
                              type="checkbox" 
                              checked={selectedCategoryIds.has(sub.id)}
                              onChange={(e) => {
                                const newSet = new Set(selectedCategoryIds);
                                if (e.target.checked) newSet.add(sub.id);
                                else newSet.delete(sub.id);
                                setSelectedCategoryIds(newSet);
                              }}
                              className="rounded border-slate-600 bg-transparent text-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                            />
                            <span style={{ color: 'var(--admin-text)' }}>{sub.name}</span>
                          </label>
                        ))}
                      </div>
                    ))}
                    {categories.length === 0 && <p className="text-xs text-slate-500">No categories found.</p>}
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleAddCategories}
                      disabled={selectedCategoryIds.size === 0 || saving === 'add-cats'}
                      className="rounded-lg px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50"
                      style={{ background: 'var(--admin-accent)' }}
                    >
                      Add to Menu
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Links Accordion */}
            <div>
              <button 
                onClick={() => setExpandedSection(expandedSection === 'custom' ? '' as any : 'custom')}
                className="flex w-full items-center justify-between p-4 text-sm font-semibold"
                style={{ color: 'var(--admin-text)' }}
              >
                Custom Links
                <span>{expandedSection === 'custom' ? '▲' : '▼'}</span>
              </button>
              {expandedSection === 'custom' && (
                <div className="p-4 pt-0 space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--admin-muted)' }}>URL</label>
                    <input
                      value={customLink.href}
                      onChange={(e) => setCustomLink(prev => ({ ...prev, href: e.target.value }))}
                      placeholder="https://"
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--admin-muted)' }}>Link Text</label>
                    <input
                      value={customLink.title}
                      onChange={(e) => setCustomLink(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Menu Item"
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleAddCustomLink}
                      disabled={!customLink.title || !customLink.href || saving === 'add-custom'}
                      className="rounded-lg px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50"
                      style={{ background: 'var(--admin-accent)' }}
                    >
                      Add to Menu
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Menu Structure */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)' }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--admin-text)' }}>Menu Structure</h2>
          </div>

          {mainItems.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center" style={{ borderColor: 'var(--admin-border)' }}>
              <p className="text-sm" style={{ color: 'var(--admin-muted)' }}>Your menu is empty. Add items from the left column.</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="MAIN_MENU" type="MAIN">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 min-h-[50px]">
                    {mainItems.map((mainItem, mainIndex) => (
                      <Draggable key={mainItem.id} draggableId={mainItem.id} index={mainIndex}>
                        {(provided) => (
                          <div 
                            ref={provided.innerRef} 
                            {...provided.draggableProps} 
                            className="rounded-lg border bg-[var(--admin-bg)]"
                            style={{ borderColor: 'var(--admin-border)', ...provided.draggableProps.style }}
                          >
                            {/* Main Item Header */}
                            <div className="flex items-center p-3 gap-3">
                              <div {...provided.dragHandleProps} className="cursor-grab text-slate-500 hover:text-white px-1">
                                ☰
                              </div>
                              <div className="flex-1 font-semibold text-sm" style={{ color: 'var(--admin-text)' }}>
                                {mainItem.title} <span className="ml-2 text-xs font-normal" style={{ color: 'var(--admin-muted)' }}>{mainItem.type}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {mainIndex > 0 && (
                                  <button 
                                    onClick={() => makeSubItem(mainItem, mainItems[mainIndex - 1])}
                                    title="Make sub-item"
                                    className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-white/5"
                                  >
                                    → Indent
                                  </button>
                                )}
                                <button 
                                  onClick={() => updateItemVisibility(mainItem.id, !mainItem.isVisible)}
                                  className={`text-xs px-2 py-1 rounded ${mainItem.isVisible ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-400 bg-white/5'}`}
                                >
                                  {mainItem.isVisible ? 'Visible' : 'Hidden'}
                                </button>
                                <button 
                                  onClick={() => removeItem(mainItem.id)}
                                  className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded bg-red-500/10"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>

                            {/* Sub Items Droppable */}
                            <Droppable droppableId={mainItem.id} type="MEGA">
                              {(provided, snapshot) => (
                                <div 
                                  ref={provided.innerRef} 
                                  {...provided.droppableProps}
                                  className={`ml-8 mr-3 mb-3 p-2 rounded border border-dashed transition-colors ${
                                    snapshot.isDraggingOver ? 'bg-[var(--admin-accent)]/10 border-[var(--admin-accent)]' : 'border-transparent'
                                  }`}
                                  style={{ minHeight: (mainItem.children?.length ?? 0) > 0 ? 'auto' : '10px' }}
                                >
                                  {(mainItem.children ?? []).map((subItem, subIndex) => (
                                    <Draggable key={subItem.id} draggableId={subItem.id} index={subIndex}>
                                      {(provided) => (
                                        <div 
                                          ref={provided.innerRef} 
                                          {...provided.draggableProps}
                                          className="flex items-center p-2 mb-2 last:mb-0 rounded border bg-[var(--admin-surface)] gap-3"
                                          style={{ borderColor: 'var(--admin-border)', ...provided.draggableProps.style }}
                                        >
                                          <div {...provided.dragHandleProps} className="cursor-grab text-slate-500 hover:text-white px-1">
                                            ☰
                                          </div>
                                          <div className="flex-1 text-sm font-medium" style={{ color: 'var(--admin-text)' }}>
                                            {subItem.title}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <button 
                                              onClick={() => makeMainItem(subItem)}
                                              title="Make main item"
                                              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-white/5"
                                            >
                                              ← Outdent
                                            </button>
                                            <button 
                                              onClick={() => updateItemVisibility(subItem.id, !subItem.isVisible)}
                                              className={`text-xs px-2 py-1 rounded ${subItem.isVisible ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-400 bg-white/5'}`}
                                            >
                                              {subItem.isVisible ? 'Vis' : 'Hid'}
                                            </button>
                                            <button 
                                              onClick={() => removeItem(subItem.id)}
                                              className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded bg-red-500/10"
                                            >
                                              ×
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
      </div>
    </div>
  );
}
