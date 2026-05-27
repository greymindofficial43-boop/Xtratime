'use client';

import { adminApi, type Category } from '@/lib/api';
import React, { FormEvent, useEffect, useState } from 'react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🏆');
  const [color, setColor] = useState('#e10600');
  const [parentId, setParentId] = useState<string>('');
  const [saving, setSaving] = useState<string | null>(null);

  async function load() {
    const data = await adminApi.getCategories();
    setCategories(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    await adminApi.createCategory({
      name,
      icon,
      color,
      sortOrder: categories.length,
      parentId: parentId || undefined
    });
    setName('');
    load();
  }

  async function onDelete(id: string, catName: string) {
    if (!confirm(`Delete category "${catName}"? Articles in it may be affected.`)) return;
    await adminApi.deleteCategory(id);
    load();
  }

  async function toggleNav(cat: Category) {
    setSaving(cat.id);
    try {
      await adminApi.updateCategory(cat.id, { showInNav: !cat.showInNav });
      await load();
    } finally {
      setSaving(null);
    }
  }

  async function updateNavOrder(cat: Category, value: string) {
    const order = parseInt(value, 10);
    if (isNaN(order)) return;
    setSaving(cat.id);
    try {
      await adminApi.updateCategory(cat.id, { navOrder: order });
      await load();
    } finally {
      setSaving(null);
    }
  }

  // Build tree for table display
  const rootCats = categories.filter(c => !c.parentId);
  const getChildren = (parentId: string) => categories.filter(c => c.parentId === parentId);
  const navCats = categories.filter((c) => c.showInNav && !c.parentId).sort((a, b) => a.navOrder - b.navOrder);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>
          Categories &amp; Menu Nav
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--admin-muted)' }}>
          Manage sport categories, sub-categories, and control menu.
        </p>
      </div>

      {/* Nav preview */}
      {navCats.length > 0 && (
        <div
          className="rounded-xl border p-5"
          style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)', boxShadow: 'var(--admin-shadow)' }}
        >
          <p className="mb-3 text-xs font-black uppercase tracking-wider" style={{ color: 'var(--admin-muted)' }}>
            Live Nav Preview
          </p>
          <div
            className="flex items-center gap-1 rounded-lg px-4 py-3"
            style={{ background: '#0a0c10', border: '1px solid #1e2028' }}
          >
            <span className="mr-3 text-sm font-black italic text-white">
              sporty<span style={{ color: 'var(--admin-accent)' }}>newz</span>
            </span>
            {navCats.map((c) => {
              const children = getChildren(c.id);
              return (
                <span
                  key={c.id}
                  className="rounded px-2.5 py-1 text-xs font-semibold text-slate-300 flex items-center gap-1"
                >
                  {c.name}
                  {children.length > 0 && <span className="opacity-50">▾</span>}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Add category form */}
      <div
        className="rounded-xl border p-5"
        style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)', boxShadow: 'var(--admin-shadow)' }}
      >
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>
          Add New Category
        </h2>
        <form onSubmit={onCreate} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--admin-muted)' }}>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]"
              style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
              placeholder="e.g. F1"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--admin-muted)' }}>Parent Category (Optional)</label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]"
              style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
            >
              <option value="">None (Top Level)</option>
              {rootCats.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--admin-muted)' }}>Icon</label>
            <input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-16 rounded-lg border px-3 py-2 text-center text-sm"
              style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--admin-muted)' }}>Color</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-16 rounded-lg border cursor-pointer"
              style={{ borderColor: 'var(--admin-border)' }}
            />
          </div>
          <button
            type="submit"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: 'var(--admin-accent)' }}
          >
            + Add Category
          </button>
        </form>
      </div>

      {/* Categories table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)', boxShadow: 'var(--admin-shadow)' }}
      >
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--admin-border)' }}>
          <h2 className="text-sm font-bold" style={{ color: 'var(--admin-text)' }}>
            All Categories ({categories.length})
          </h2>
          <span className="text-xs" style={{ color: 'var(--admin-muted)' }}>
            Toggle the switch to show/hide a category in the site navbar
          </span>
        </div>

        {categories.length === 0 ? (
          <p className="p-8 text-sm" style={{ color: 'var(--admin-muted)' }}>No categories yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b" style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)' }}>
              <tr>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>Category</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>Slug</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-center" style={{ color: 'var(--admin-muted)' }}>Show in Nav</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-center" style={{ color: 'var(--admin-muted)' }}>Nav Order</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rootCats.map((cat) => {
                const children = getChildren(cat.id);
                return (
                  <React.Fragment key={cat.id}>
                    <tr className="border-b last:border-0" style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)' }}>
                      <td className="px-5 py-3 font-bold">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{cat.icon}</span>
                          <span style={{ color: 'var(--admin-text)' }}>{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <code className="rounded px-2 py-0.5 text-xs" style={{ background: 'var(--admin-border)', color: 'var(--admin-text)' }}>
                          /{cat.slug}
                        </code>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <label className="sn-toggle mx-auto">
                          <input
                            type="checkbox"
                            checked={cat.showInNav}
                            disabled={saving === cat.id}
                            onChange={() => toggleNav(cat)}
                          />
                          <span className="sn-toggle-slider" />
                        </label>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <input
                          type="number"
                          defaultValue={cat.navOrder}
                          disabled={!cat.showInNav || saving === cat.id}
                          onBlur={(e) => updateNavOrder(cat, e.target.value)}
                          className="w-16 rounded-lg border px-2 py-1 text-center text-sm disabled:opacity-40"
                          style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-surface)', color: 'var(--admin-text)' }}
                        />
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => onDelete(cat.id, cat.name)}
                          className="text-sm text-red-500 transition hover:text-red-700 font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    {children.map(child => (
                      <tr key={child.id} className="border-b last:border-0" style={{ borderColor: 'var(--admin-border)' }}>
                        <td className="px-5 py-2 pl-12">
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400">↳</span>
                            <span className="text-lg opacity-70">{child.icon}</span>
                            <span style={{ color: 'var(--admin-text)' }}>{child.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-2">
                          <code className="rounded px-2 py-0.5 text-xs opacity-70" style={{ background: 'var(--admin-bg)', color: 'var(--admin-muted)' }}>
                            /{child.slug}
                          </code>
                        </td>
                        <td className="px-5 py-2 text-center text-xs opacity-50" style={{ color: 'var(--admin-muted)' }}>
                          Shown in Menu
                        </td>
                        <td className="px-5 py-2 text-center text-xs opacity-50" style={{ color: 'var(--admin-muted)' }}>
                          -
                        </td>
                        <td className="px-5 py-2">
                          <button
                            onClick={() => onDelete(child.id, child.name)}
                            className="text-sm text-red-500 transition hover:text-red-700"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
