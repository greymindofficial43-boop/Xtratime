export type ScorecardTab =
  | 'featured'
  | 'ipl-2026'
  | 'nba'
  | 'nfl'
  | 'cricket'
  | 'football';

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

export const SCORECARD_TABS: { id: ScorecardTab; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'ipl-2026', label: 'IPL 2026' },
  { id: 'cricket', label: 'NZ-W vs ENG-W' },
  { id: 'football', label: 'AUS vs PAK' },
  { id: 'nba', label: 'NBA' },
  { id: 'nfl', label: 'NFL' },
];

export const MOCK_SCORECARDS: Scorecard[] = [
  {
    id: 'ipl-lsg-pbks',
    tabs: ['featured', 'ipl-2026', 'cricket'],
    meta: '68th T20 • IPL 2026',
    home: { abbr: 'LSG', name: 'Lucknow', score: '178/7', overs: '20 ov', color: '#3b82f6' },
    away: { abbr: 'PBKS', name: 'Punjab', score: '181/3', overs: '18.2 ov', color: '#dc2626' },
    status: 'completed',
    result: 'PBKS won by 7 wickets',
    href: '/category/cricket',
    showPointsTable: true,
  },
  {
    id: 'ipl-mi-rr',
    tabs: ['featured', 'ipl-2026'],
    meta: '69th T20 • IPL 2026',
    home: { abbr: 'MI', name: 'Mumbai', color: '#2563eb' },
    away: { abbr: 'RR', name: 'Rajasthan', color: '#f59e0b' },
    status: 'upcoming',
    scheduledTime: '03:30 PM',
    scheduledDay: 'Tomorrow',
    href: '/category/cricket',
    showPointsTable: true,
  },
  {
    id: 'ipl-kkr-dc',
    tabs: ['featured', 'ipl-2026'],
    meta: '70th T20 • IPL 2026',
    home: { abbr: 'KKR', name: 'Kolkata', color: '#7c3aed' },
    away: { abbr: 'DC', name: 'Delhi', color: '#0ea5e9' },
    status: 'upcoming',
    scheduledTime: '07:30 PM',
    scheduledDay: 'Tomorrow',
    href: '/category/cricket',
    showPointsTable: true,
  },
  {
    id: 'nzw-engw',
    tabs: ['featured', 'cricket'],
    meta: "Women's ODI • NZ tour ENG",
    home: { abbr: 'NZ-W', name: 'New Zealand', score: '245/8', overs: '50 ov', color: '#000000' },
    away: { abbr: 'ENG-W', name: 'England', score: '198/10', overs: '47.3 ov', color: '#1d4ed8' },
    status: 'completed',
    result: 'NZ-W won by 47 runs',
    href: '/category/cricket',
  },
  {
    id: 'nba-lal-hou',
    tabs: ['featured', 'nba'],
    meta: 'NBA Playoffs • West 1st Rd',
    home: { abbr: 'LAL', name: 'Lakers', score: '98', color: '#552583' },
    away: { abbr: 'HOU', name: 'Rockets', score: '102', color: '#ce1141' },
    status: 'live',
    liveMinute: 'Q4 2:14',
    result: 'HOU leads series 2-1',
    href: '/category/nba',
  },
  {
    id: 'nba-bos-nyk',
    tabs: ['nba'],
    meta: 'NBA Playoffs • East 1st Rd',
    home: { abbr: 'BOS', name: 'Celtics', color: '#007a33' },
    away: { abbr: 'NYK', name: 'Knicks', color: '#006bb6' },
    status: 'upcoming',
    scheduledTime: '08:00 PM',
    scheduledDay: 'Today',
    href: '/category/nba',
  },
  {
    id: 'nfl-kc-buf',
    tabs: ['featured', 'nfl'],
    meta: 'NFL • Week 1 Preview',
    home: { abbr: 'KC', name: 'Chiefs', color: '#e31837' },
    away: { abbr: 'BUF', name: 'Bills', color: '#00338d' },
    status: 'upcoming',
    scheduledTime: '01:20 AM',
    scheduledDay: 'Mon',
    href: '/category/nfl',
  },
  {
    id: 'foot-aus-pak',
    tabs: ['featured', 'football'],
    meta: 'ODI Series • AUS vs PAK',
    home: { abbr: 'AUS', name: 'Australia', score: '312/6', overs: '50 ov', color: '#fbbf24' },
    away: { abbr: 'PAK', name: 'Pakistan', score: '289/10', overs: '48.1 ov', color: '#16a34a' },
    status: 'completed',
    result: 'AUS won by 23 runs',
    href: '/category/football',
  },
  {
    id: 'foot-mun-che',
    tabs: ['football'],
    meta: 'Premier League • Matchday 34',
    home: { abbr: 'MUN', name: 'Man United', color: '#da291c' },
    away: { abbr: 'CHE', name: 'Chelsea', color: '#034694' },
    status: 'upcoming',
    scheduledTime: '05:00 PM',
    scheduledDay: 'Today',
    href: '/category/football',
  },
];

export function scorecardsForTab(tab: ScorecardTab): Scorecard[] {
  return MOCK_SCORECARDS.filter((c) => c.tabs.includes(tab));
}
