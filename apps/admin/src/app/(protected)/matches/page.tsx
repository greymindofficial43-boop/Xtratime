'use client';

import { adminApi, type Match, type MatchStatus, type Category } from '@/lib/api';
import { FormEvent, useEffect, useState } from 'react';

const emptyForm = {
  sport: 'Cricket',
  title: '',
  homeTeamName: '',
  homeTeamLogo: '',
  homeTeamScore: '',
  awayTeamName: '',
  awayTeamLogo: '',
  awayTeamScore: '',
  status: 'upcoming' as MatchStatus,
  note: '',
  statusDetail: '',
  venue: '',
  matchDate: '',
  matchTime: '',
};

function formatDateInput(value: string) {
  const d = new Date(value);
  return {
    date: d.toISOString().split('T')[0],
    time: d.toTimeString().slice(0, 5),
  };
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  async function load() {
    const [matchesData, categoriesData] = await Promise.all([
      adminApi.getMatches(),
      adminApi.getCategories()
    ]);
    setMatches(matchesData);
    setCategories(categoriesData);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSync() {
    try {
      setSyncing(true);
      const res = await adminApi.syncMatches();
      if (res.success) {
        alert(`Synced ${res.synced} matches from Highlightly API.`);
        await load();
      } else {
        alert(`Sync failed: ${res.message}`);
      }
    } catch (err: any) {
      alert(`Error syncing: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      sport: form.sport,
      title: form.title,
      homeTeamName: form.homeTeamName,
      homeTeamLogo: form.homeTeamLogo,
      homeTeamScore: form.homeTeamScore || undefined,
      awayTeamName: form.awayTeamName,
      awayTeamLogo: form.awayTeamLogo,
      awayTeamScore: form.awayTeamScore || undefined,
      status: form.status,
      note: form.note || undefined,
      statusDetail: form.statusDetail || undefined,
      venue: form.venue || undefined,
      date: form.matchDate ? new Date(`${form.matchDate}T${form.matchTime || '00:00'}`).toISOString() : undefined,
    };

    try {
      if (editingId) {
        await adminApi.updateMatch(editingId, payload);
      } else {
        await adminApi.createMatch(payload);
      }
      resetForm();
      await load();
    } finally {
      setSaving(false);
    }
  }

  function startEdit(match: Match) {
    setEditingId(match.id);
    setForm({
      sport: match.sport,
      title: match.title,
      homeTeamName: match.homeTeamName,
      homeTeamLogo: match.homeTeamLogo,
      homeTeamScore: match.homeTeamScore ?? '',
      awayTeamName: match.awayTeamName,
      awayTeamLogo: match.awayTeamLogo,
      awayTeamScore: match.awayTeamScore ?? '',
      status: match.status,
      note: match.note ?? '',
      statusDetail: match.statusDetail ?? '',
      venue: match.venue ?? '',
      matchDate: formatDateInput(match.date).date,
      matchTime: formatDateInput(match.date).time,
    });
  }

  async function handleDelete(match: Match) {
    if (!confirm(`Delete "${match.title}"?`)) return;
    await adminApi.deleteMatch(match.id);
    if (editingId === match.id) resetForm();
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Matches</h1>
          <p className="mt-1 text-slate-500">Add fixtures, update live scores, and publish results manually.</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-70"
        >
          {syncing ? 'Syncing...' : 'Sync from Highlightly'}
        </button>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-slate-500">Sport</label>
            <select
              value={form.sport}
              onChange={(e) => setForm((prev) => ({ ...prev, sport: e.target.value }))}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              required
            >
              <option value="" disabled>Select Sport</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="xl:col-span-2">
            <label className="block text-xs font-medium text-slate-500">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="e.g. 1st T20I • India tour of England"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as MatchStatus }))}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              <option value="live">Live</option>
              <option value="upcoming">Upcoming</option>
              <option value="result">Result</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Home Team</label>
            <input
              value={form.homeTeamName}
              onChange={(e) => setForm((prev) => ({ ...prev, homeTeamName: e.target.value }))}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Home Logo / Flag</label>
            <input
              value={form.homeTeamLogo}
              onChange={(e) => setForm((prev) => ({ ...prev, homeTeamLogo: e.target.value }))}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="e.g. 🇮🇳"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Home Score</label>
            <input
              value={form.homeTeamScore}
              onChange={(e) => setForm((prev) => ({ ...prev, homeTeamScore: e.target.value }))}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Away Team</label>
            <input
              value={form.awayTeamName}
              onChange={(e) => setForm((prev) => ({ ...prev, awayTeamName: e.target.value }))}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Away Logo / Flag</label>
            <input
              value={form.awayTeamLogo}
              onChange={(e) => setForm((prev) => ({ ...prev, awayTeamLogo: e.target.value }))}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="e.g. 🇦🇺"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Away Score</label>
            <input
              value={form.awayTeamScore}
              onChange={(e) => setForm((prev) => ({ ...prev, awayTeamScore: e.target.value }))}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Match Date</label>
            <input
              type="date"
              value={form.matchDate}
              onChange={(e) => setForm((prev) => ({ ...prev, matchDate: e.target.value }))}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Match Time</label>
            <input
              type="time"
              value={form.matchTime}
              onChange={(e) => setForm((prev) => ({ ...prev, matchTime: e.target.value }))}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Venue</label>
            <input
              value={form.venue}
              onChange={(e) => setForm((prev) => ({ ...prev, venue: e.target.value }))}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="Stadium / venue"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-500">Status Detail</label>
            <input
              value={form.statusDetail}
              onChange={(e) => setForm((prev) => ({ ...prev, statusDetail: e.target.value }))}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="e.g. India won by 6 wickets"
            />
          </div>
          <label className="block text-xs font-medium text-slate-500">Note</label>
          <textarea
            value={form.note}
            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
            className="mt-1 min-h-24 w-full rounded-lg border px-3 py-2"
            placeholder="Optional match note or summary"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[var(--admin-accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
          >
            {saving ? 'Saving...' : editingId ? 'Update Match' : 'Add Match'}
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

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {matches.length === 0 ? (
          <p className="p-8 text-slate-500">No matches added yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Match</th>
                <th className="px-4 py-3 font-medium">Sport</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => (
                <tr key={match.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{match.title}</p>
                    <p className="text-xs text-slate-500">
                      {match.homeTeamLogo} {match.homeTeamName}
                      {match.homeTeamScore ? ` ${match.homeTeamScore}` : ''} vs {match.awayTeamLogo}{' '}
                      {match.awayTeamName}
                      {match.awayTeamScore ? ` ${match.awayTeamScore}` : ''}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{match.sport}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase text-slate-700">
                      {match.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(match.date).toLocaleString()}
                    {match.venue && <p className="mt-1 text-xs text-slate-500">{match.venue}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => startEdit(match)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(match)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
