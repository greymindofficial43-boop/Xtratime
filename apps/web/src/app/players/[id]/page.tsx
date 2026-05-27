import { fetchPlayerInfo, type PlayerFormatStats, type PlayerStatRow } from '@/lib/cricapi';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

const FLAG_MAP: Record<string, string> = {
  India: '🇮🇳', Pakistan: '🇵🇰', Australia: '🇦🇺', England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'New Zealand': '🇳🇿', 'South Africa': '🇿🇦', 'West Indies': '🏝️',
  'Sri Lanka': '🇱🇰', Bangladesh: '🇧🇩', Afghanistan: '🇦🇫',
  Zimbabwe: '🇿🇼', Ireland: '🇮🇪', Scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', Netherlands: '🇳🇱',
};

const BATTING_STAT_LABELS: Record<string, string> = {
  m: 'Matches', inn: 'Innings', no: 'Not Outs', runs: 'Runs',
  hs: 'Highest Score', avg: 'Average', bf: 'Balls Faced', sr: 'Strike Rate',
  '100': '100s', '50': '50s', '4s': 'Fours', '6s': 'Sixes', '0s': 'Ducks',
};

const BOWLING_STAT_LABELS: Record<string, string> = {
  m: 'Matches', inn: 'Innings', b: 'Balls', runs: 'Runs',
  wkts: 'Wickets', avg: 'Average', econ: 'Economy', sr: 'Strike Rate',
  bbi: 'Best Innings', bbm: 'Best Match', '5w': '5 Wicket Hauls', '10w': '10 Wicket Hauls',
};

function StatTable({ rows, labelMap }: { rows: PlayerStatRow[]; labelMap: Record<string, string> }) {
  const display = rows.filter((r) => r.value && r.value !== '-' && r.value !== '');
  if (display.length === 0) return (
    <p className="text-sm text-center text-[var(--sn-muted)] py-6">No data available</p>
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <tbody>
          {display.map((row) => (
            <tr key={row.stat} className="border-b border-[var(--sn-border)] last:border-0">
              <td className="py-2.5 pr-4 text-[var(--sn-muted)] font-medium capitalize text-xs">
                {labelMap[row.stat] ?? row.stat.toUpperCase()}
              </td>
              <td className="py-2.5 text-right font-bold text-[var(--sn-text)]">
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FormatCard({ label, data, color }: { label: string; data: PlayerFormatStats; color: string }) {
  const hasBatting = data.batting.some((r) => r.value && r.value !== '-');
  const hasBowling = data.bowling.some((r) => r.value && r.value !== '-');

  if (!hasBatting && !hasBowling) return null;

  return (
    <div
      className="rounded-2xl border border-[var(--sn-border)] bg-[var(--sn-surface)] overflow-hidden"
    >
      {/* Format header */}
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{ background: `${color}20`, borderBottom: `2px solid ${color}` }}
      >
        <span className="text-sm font-black uppercase tracking-wider" style={{ color }}>
          {label}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[var(--sn-border)]">
        {/* Batting */}
        {hasBatting && (
          <div className="p-5">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[var(--sn-muted)]">
              <span>🏏</span> Batting
            </p>
            <StatTable rows={data.batting} labelMap={BATTING_STAT_LABELS} />
          </div>
        )}
        {/* Bowling */}
        {hasBowling && (
          <div className="p-5">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[var(--sn-muted)]">
              <span>⚡</span> Bowling
            </p>
            <StatTable rows={data.bowling} labelMap={BOWLING_STAT_LABELS} />
          </div>
        )}
      </div>
    </div>
  );
}

const FORMAT_CONFIG = [
  { key: 'test' as const, label: 'Test', color: '#c084fc' },
  { key: 'odi' as const, label: 'ODI', color: '#38bdf8' },
  { key: 't20' as const, label: 'T20I', color: '#4ade80' },
  { key: 'ipl' as const, label: 'IPL', color: '#f97316' },
];

export default async function PlayerPage({ params }: { params: { id: string } }) {
  const player = await fetchPlayerInfo(params.id);

  if (!player) notFound();

  const flag = FLAG_MAP[player.country ?? ''] ?? '🏏';

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      {/* Back button */}
      <Link
        href="/players"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--sn-muted)] hover:text-[var(--sn-accent)] transition"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Back to Player Search
      </Link>

      {/* Player profile card */}
      <div className="mb-8 rounded-2xl border border-[var(--sn-border)] bg-[var(--sn-surface)] overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-[var(--sn-accent)]/20 to-purple-900/20">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 40px)' }}
          />
        </div>

        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="flex items-end gap-5 -mt-10 mb-4">
            <div
              className="h-20 w-20 rounded-2xl border-4 border-[var(--sn-surface)] bg-gradient-to-br from-[var(--sn-accent)] to-purple-700 flex items-center justify-center text-3xl shadow-lg overflow-hidden shrink-0"
            >
              {player.playerImg ? (
                <Image
                  src={player.playerImg}
                  alt={player.name}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              ) : (
                <span>{flag}</span>
              )}
            </div>
            <div className="mb-1 min-w-0">
              <h1 className="text-2xl font-black text-[var(--sn-text)] leading-tight truncate">
                {player.name}
              </h1>
              <p className="text-sm text-[var(--sn-muted)]">
                {flag} {player.country}
              </p>
            </div>
          </div>

          {/* Meta tags */}
          <div className="flex flex-wrap gap-2">
            {player.role && (
              <span className="rounded-full border border-[var(--sn-border)] bg-[var(--sn-bg)] px-3 py-1 text-xs font-semibold text-[var(--sn-text)]">
                🧤 {player.role}
              </span>
            )}
            {player.battingStyle && (
              <span className="rounded-full border border-[var(--sn-border)] bg-[var(--sn-bg)] px-3 py-1 text-xs font-semibold text-[var(--sn-text)]">
                🏏 {player.battingStyle}
              </span>
            )}
            {player.bowlingStyle && (
              <span className="rounded-full border border-[var(--sn-border)] bg-[var(--sn-bg)] px-3 py-1 text-xs font-semibold text-[var(--sn-text)]">
                ⚡ {player.bowlingStyle}
              </span>
            )}
            {player.dateOfBirth && (
              <span className="rounded-full border border-[var(--sn-border)] bg-[var(--sn-bg)] px-3 py-1 text-xs font-semibold text-[var(--sn-text)]">
                🎂 {new Date(player.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats heading */}
      <h2 className="mb-5 text-lg font-black text-[var(--sn-text)]">Career Statistics</h2>

      {/* Format cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {FORMAT_CONFIG.map(({ key, label, color }) => (
          <FormatCard
            key={key}
            label={label}
            data={player.stats[key]}
            color={color}
          />
        ))}
      </div>

      {FORMAT_CONFIG.every(({ key }) => {
        const d = player.stats[key];
        return !d.batting.some(r => r.value && r.value !== '-') &&
               !d.bowling.some(r => r.value && r.value !== '-');
      }) && (
        <div className="rounded-2xl border border-[var(--sn-border)] bg-[var(--sn-surface)] p-8 text-center">
          <p className="text-[var(--sn-muted)]">No career statistics available for this player yet.</p>
        </div>
      )}
    </div>
  );
}
