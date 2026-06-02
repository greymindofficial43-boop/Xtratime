import type { Match } from './api';
import type { Scorecard, ScorecardTab } from './scorecards';

function toSportTab(sport: string): ScorecardTab {
  const normalized = sport.toLowerCase().trim();
  switch (normalized) {
    case 'cricket':
      return 'cricket';
    case 'nba':
    case 'basketball':
      return 'nba';
    case 'nfl':
    case 'football-american':
      return 'nfl';
    case 'mlb':
    case 'baseball':
      return 'mlb';
    case 'nhl':
    case 'hockey':
      return 'nhl';
    case 'soccer':
    case 'football':
      return 'soccer';
    default:
      return 'featured';
  }
}

function teamAbbr(name: string) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

export function storedMatchToScorecard(match: Match): Scorecard {
  const date = new Date(match.date);
  const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
  const sportTab = toSportTab(match.sport);

  return {
    id: `admin-${match.id}`,
    tabs: sportTab === 'featured' ? ['featured'] : ['featured', sportTab],
    meta: match.league || match.title,
    home: {
      abbr: teamAbbr(match.homeTeamName),
      name: match.homeTeamName,
      logo: match.homeTeamLogo || undefined,
      score: match.homeTeamScore || undefined,
      color: 'var(--sk-accent)',
    },
    away: {
      abbr: teamAbbr(match.awayTeamName),
      name: match.awayTeamName,
      logo: match.awayTeamLogo || undefined,
      score: match.awayTeamScore || undefined,
      color: 'var(--sk-text)',
    },
    status: (match.status === 'result' ? 'completed' : match.status) as Scorecard['status'],
    result: match.note || match.statusDetail || undefined,
    scheduledTime: hasTime
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
    scheduledDay: hasTime
      ? date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      : undefined,
    href: `/match/admin-${match.id}`,
    showPointsTable: true,
  };
}
