// ─── Types (used by espn.ts and ScorecardCarousel) ───────────────────────────

export type ScorecardTab = 'featured' | 'nfl' | 'nba' | 'mlb' | 'soccer' | 'nhl' | 'cricket';

export type MatchStatus = 'completed' | 'live' | 'upcoming';

export type TeamLine = {
  abbr: string;
  name: string;
  score?: string;
  overs?: string;
  color: string;
};

export type Scorecard = {
  id: string;
  tabs: ScorecardTab[];
  meta: string;
  home: TeamLine;
  away: TeamLine;
  status: MatchStatus;
  result?: string;
  liveMinute?: string;
  scheduledTime?: string;
  scheduledDay?: string;
  href: string;
  showPointsTable?: boolean;
};

// ─── Tab config ───────────────────────────────────────────────────────────────

export const SCORECARD_TABS: { id: ScorecardTab; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'cricket', label: 'Cricket' },
  { id: 'nfl', label: 'NFL' },
  { id: 'nba', label: 'NBA' },
  { id: 'mlb', label: 'MLB' },
  { id: 'soccer', label: 'Soccer' },
  { id: 'nhl', label: 'NHL' },
];
