'use client';

import { adminApi, type ManagedUser } from '@/lib/api';
import { FormEvent, useEffect, useState } from 'react';

const EMPTY = { email: '', name: '', password: '', role: 'EDITOR' };

export default function UsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [meId, setMeId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      const [list, me] = await Promise.all([adminApi.getUsers(), adminApi.me()]);
      setUsers(list);
      setMeId(me.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users');
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setForm(EMPTY);
    setEditingId(null);
    setError('');
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (editingId) {
        const data: Record<string, string> = {
          email: form.email,
          name: form.name,
          role: form.role,
        };
        if (form.password) data.password = form.password; // only change if provided
        await adminApi.updateUser(editingId, data);
      } else {
        await adminApi.createUser(form);
      }
      resetForm();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function onEdit(u: ManagedUser) {
    setEditingId(u.id);
    setForm({ email: u.email, name: u.name, password: '', role: u.role });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function onDelete(u: ManagedUser) {
    if (!confirm(`Delete user "${u.name}" (${u.email})?`)) return;
    setError('');
    try {
      await adminApi.deleteUser(u.id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Users</h1>
      <p className="mt-1 text-slate-500">
        Manage admins and editors. Admins can manage everything; editors manage content.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Create / Edit form */}
      <form onSubmit={onSubmit} className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">
          {editingId ? 'Edit User' : 'Add New User'}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Full name"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Password {editingId && <span className="text-slate-400">(leave blank to keep)</span>}
            </label>
            <input
              type="text"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2"
              placeholder={editingId ? '••••••' : 'Min 6 characters'}
              minLength={editingId ? undefined : 6}
              required={!editingId}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="w-full rounded-lg border bg-white px-3 py-2"
            >
              <option value="EDITOR">Editor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-[var(--admin-accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? 'Saving…' : editingId ? 'Save Changes' : 'Add User'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Users table */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-800">
                  {u.name}
                  {u.id === meId && <span className="ml-2 text-xs text-slate-400">(you)</span>}
                </td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      u.role === 'ADMIN'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onEdit(u)}
                    className="mr-3 text-xs font-medium text-slate-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(u)}
                    disabled={u.id === meId}
                    className="text-xs font-medium text-red-500 hover:underline disabled:cursor-not-allowed disabled:text-slate-300 disabled:no-underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
