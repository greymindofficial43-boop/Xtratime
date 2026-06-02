'use client';

import { adminApi, type Category } from '@/lib/api';
import { FormEvent, Fragment, useEffect, useMemo, useState } from 'react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#e10600');
  const [parentId, setParentId] = useState('');

  async function load() {
    const data = await adminApi.getCategories();
    setCategories(data);
  }

  useEffect(() => {
    load();
  }, []);

  const rootCategories = useMemo(
    () => categories.filter((category) => !category.parentId).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [categories],
  );

  const childCategories = (parent: string) =>
    categories.filter((category) => category.parentId === parent).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    await adminApi.createCategory({
      name,
      color,
      sortOrder: categories.length,
      parentId: parentId || undefined,
    });
    setName('');
    setParentId('');
    await load();
  }

  async function onDelete(id: string, categoryName: string) {
    if (!confirm(`Delete category "${categoryName}"? Articles in it may be affected.`)) return;
    await adminApi.deleteCategory(id);
    await load();
  }

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--admin-text)' }}>
          Categories
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--admin-muted)' }}>
          Manage sports taxonomy here. Header ordering and mega menu setup now live under <strong>Menus</strong>.
        </p>
      </div>

      <div
        className="rounded-xl border p-5"
        style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)', boxShadow: 'var(--admin-shadow)' }}
      >
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>
          Add New Category
        </h2>
        <form onSubmit={onCreate} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--admin-muted)' }}>Name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]"
              style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
              placeholder="e.g. Cricket"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--admin-muted)' }}>Parent Category</label>
            <select
              value={parentId}
              onChange={(event) => setParentId(event.target.value)}
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]"
              style={{ borderColor: 'var(--admin-border)', background: 'var(--admin-bg)', color: 'var(--admin-text)' }}
            >
              <option value="">None (Top Level)</option>
              {rootCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--admin-muted)' }}>Color</label>
            <input
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              className="h-10 w-16 cursor-pointer rounded-lg border"
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

      <div
        className="overflow-hidden rounded-xl border"
        style={{ background: 'var(--admin-surface)', borderColor: 'var(--admin-border)', boxShadow: 'var(--admin-shadow)' }}
      >
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--admin-border)' }}>
          <h2 className="text-sm font-bold" style={{ color: 'var(--admin-text)' }}>
            All Categories ({categories.length})
          </h2>
          <span className="text-xs" style={{ color: 'var(--admin-muted)' }}>
            Taxonomy only. Use <strong>Menus</strong> for header order and mega menu links.
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
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>Level</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>Children</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--admin-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rootCategories.map((category) => (
                <Fragment key={category.id}>
                  <tr className="border-b last:border-0" style={{ borderColor: 'var(--admin-border)' }}>
                    <td className="px-5 py-3 font-semibold" style={{ color: 'var(--admin-text)' }}>
                      {category.icon ? `${category.icon} ` : ''}{category.name}
                    </td>
                    <td className="px-5 py-3">
                      <code className="rounded px-2 py-0.5 text-xs" style={{ background: 'var(--admin-border)', color: 'var(--admin-text)' }}>
                        /{category.slug}
                      </code>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: 'var(--admin-muted)' }}>Top Level</td>
                    <td className="px-5 py-3 text-xs" style={{ color: 'var(--admin-muted)' }}>{childCategories(category.id).length}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => onDelete(category.id, category.name)}
                        className="text-sm font-semibold text-red-500 transition hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {childCategories(category.id).map((child) => (
                    <tr key={child.id} className="border-b last:border-0" style={{ borderColor: 'var(--admin-border)' }}>
                      <td className="px-5 py-3 pl-12" style={{ color: 'var(--admin-text)' }}>
                        <span className="mr-2 text-slate-400">↳</span>
                        {child.icon ? `${child.icon} ` : ''}{child.name}
                      </td>
                      <td className="px-5 py-3">
                        <code className="rounded px-2 py-0.5 text-xs opacity-80" style={{ background: 'var(--admin-bg)', color: 'var(--admin-muted)' }}>
                          /{child.slug}
                        </code>
                      </td>
                      <td className="px-5 py-3 text-xs" style={{ color: 'var(--admin-muted)' }}>Subcategory</td>
                      <td className="px-5 py-3 text-xs" style={{ color: 'var(--admin-muted)' }}>0</td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => onDelete(child.id, child.name)}
                          className="text-sm text-red-500 transition hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
