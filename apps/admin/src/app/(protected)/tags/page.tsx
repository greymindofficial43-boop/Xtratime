'use client';

import { adminApi, type Tag } from '@/lib/api';
import { FormEvent, useEffect, useState } from 'react';

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [name, setName] = useState('');

  async function load() {
    setTags(await adminApi.getTags());
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    await adminApi.createTag(name);
    setName('');
    load();
  }

  async function onDelete(id: string, tagName: string) {
    if (!confirm(`Delete tag "${tagName}"?`)) return;
    await adminApi.deleteTag(id);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Tags</h1>
      <p className="mt-1 text-slate-500">Labels for articles (Breaking News, Rumors, etc.)</p>

      <form
        onSubmit={onCreate}
        className="mt-6 flex gap-3 rounded-xl border border-slate-200 bg-white p-4"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tag name"
          className="flex-1 rounded-lg border px-3 py-2"
          required
        />
        <button
          type="submit"
          className="rounded-lg bg-[var(--admin-accent)] px-4 py-2 text-sm font-medium text-white"
        >
          Add Tag
        </button>
      </form>

      <div className="mt-6 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2"
          >
            <span className="text-sm font-medium">{tag.name}</span>
            <button
              onClick={() => onDelete(tag.id, tag.name)}
              className="text-xs text-red-500 hover:underline"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
