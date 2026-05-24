'use client';

import { adminApi, type Category } from '@/lib/api';
import { FormEvent, useEffect, useState } from 'react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🏆');
  const [color, setColor] = useState('#e10600');

  async function load() {
    const data = await adminApi.getCategories();
    setCategories(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    await adminApi.createCategory({ name, icon, color, sortOrder: categories.length });
    setName('');
    load();
  }

  async function onDelete(id: string, catName: string) {
    if (!confirm(`Delete category "${catName}"? Articles in it may be affected.`)) return;
    await adminApi.deleteCategory(id);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Categories</h1>
      <p className="mt-1 text-slate-500">Sports sections (WWE, NBA, Cricket, etc.)</p>

      <form
        onSubmit={onCreate}
        className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4"
      >
        <div>
          <label className="block text-xs font-medium text-slate-500">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 rounded-lg border px-3 py-2"
            placeholder="e.g. F1"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">Icon</label>
          <input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="mt-1 w-16 rounded-lg border px-3 py-2 text-center"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">Color</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mt-1 h-10 w-16 rounded border"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-[var(--admin-accent)] px-4 py-2 text-sm font-medium text-white"
        >
          Add Category
        </button>
      </form>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{cat.icon}</span>
              <div>
                <p className="font-semibold">{cat.name}</p>
                <p className="text-xs text-slate-400">/{cat.slug}</p>
              </div>
            </div>
            <button
              onClick={() => onDelete(cat.id, cat.name)}
              className="text-sm text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
