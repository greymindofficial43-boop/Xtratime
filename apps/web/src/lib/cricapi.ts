import type { Scorecard, ScorecardTab, TeamLine } from './scorecards';

const CRIC_BASE = 'https://api.cricapi.com/v1';
const CRIC_KEY = process.env.CRICAPI_KEY ?? '';

// ─── Internal CricAPI shapes ──────────────────────────────────────────────────

interface CricScore {
  r: number;
  w: number;
  o: number;
  inning: string;
}

interface CricMatch {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue?: string;
  date?: string;
  dateTimeGMT?: string;
  teams: [string, string];
  score?: CricScore[];
  matchWinner?: string;
  matchStarted: boolean;
  matchEnded: boolean;
}

interface CricApiResponse {
  status: string;
  data?: CricMatch[];
  info?: { totalRows: number };
}

// ─── Public types ─────────────────────────────────────────────────────────────

export interface CricketMatchScore {
  team: string;
  runs: number;
  wickets: number;
  overs: number;
}

export interface CricketMatch {
  id: string;
  name: string;
  matchType: string;
  status: 'live' | 'upcoming' | 'completed';
  statusText: string;
  teams: [string, string];
  scores: CricketMatchScore[];
  venue?: string;
  date?: string;
  matchWinner?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ABBR_MAP: Record<string, string> = {
  India: 'IND', Australia: 'AUS', England: 'ENG', Pakistan: 'PAK',
  'South Africa': 'SA', 'New Zealand': 'NZ', 'West Indies': 'WI',
  'Sri Lanka': 'SL', Bangladesh: 'BAN', Afghanistan: 'AFG',
  Zimbabwe: 'ZIM', Ireland: 'IRE', Scotland: 'SCO', Netherlands: 'NED',
  Namibia: 'NAM', UAE: 'UAE', Nepal: 'NEP', Oman: 'OMA',
  'Chennai Super Kings': 'CSK', 'Royal Challengers Bengaluru': 'RCB', 'Royal Challengers Bangalore': 'RCB',
  'Mumbai Indians': 'MI', 'Kolkata Knight Riders': 'KKR', 'Sunrisers Hyderabad': 'SRH',
  'Rajasthan Royals': 'RR', 'Delhi Capitals': 'DC', 'Punjab Kings': 'PBKS',
  'Gujarat Titans': 'GT', 'Lucknow Super Giants': 'LSG',
};

const TEAM_COLORS: Record<string, string> = {
  India: '#003366', Australia: '#ffcc00', England: '#002147',
  Pakistan: '#01411c', 'South Africa': '#007a4d', 'New Zealand': '#000000',
  'West Indies': '#7b0000', 'Sri Lanka': '#003580', Bangladesh: '#006a4e',
  Afghanistan: '#1a4699', 
  'Chennai Super Kings': '#F9CD05', 'Royal Challengers Bengaluru': '#EC1C24', 'Royal Challengers Bangalore': '#EC1C24',
  'Mumbai Indians': '#004BA0', 'Kolkata Knight Riders': '#3A225D', 'Sunrisers Hyderabad': '#F26522',
  'Rajasthan Royals': '#EA1A85', 'Delhi Capitals': '#00008B', 'Punjab Kings': '#ED1B24',
  'Gujarat Titans': '#1B2133', 'Lucknow Super Giants': '#005087',
  default: '#166534',
};

function abbr(name: string): string {
  return ABBR_MAP[name] ?? name.slice(0, 3).toUpperCase();
}

function color(name: string): string {
  return TEAM_COLORS[name] ?? TEAM_COLORS.default;
}

function matchState(m: CricMatch): 'live' | 'upcoming' | 'completed' {
  if (!m.matchStarted) return 'upcoming';
  if (m.matchEnded) return 'completed';
  return 'live';
}

function scoreForTeam(scores: CricScore[] | undefined, teamName: string): CricScore | undefined {
  return scores?.find((s) => s.inning.toLowerCase().startsWith(teamName.toLowerCase()));
}

function formatStartTime(iso: string): { scheduledTime: string; scheduledDay: string } {
  const date = new Date(iso);
  const now = new Date();
  const todayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const gameDayMs = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diff = gameDayMs - todayMs;

  const scheduledTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC',
  });
  const scheduledDay =
    diff === 0 ? 'Today' :
    diff === 86_400_000 ? 'Tomorrow' :
    date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return { scheduledTime, scheduledDay };
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchCricApi<T>(endpoint: string, revalidate = 60): Promise<T | null> {
  if (!CRIC_KEY) return null;
  try {
    const url = `${CRIC_BASE}/${endpoint}?apikey=${CRIC_KEY}&offset=0`;
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

// ─── Public: rich match objects (for category page) ───────────────────────────

export async function fetchCricketMatches(limit = 12): Promise<CricketMatch[]> {
  const data = await fetchCricApi<CricApiResponse>('currentMatches');
  if (!data || data.status !== 'success' || !data.data) return [];

  // Prioritize major teams
  const sortedData = data.data.sort((a, b) => {
    const aMajor = (ABBR_MAP[a.teams[0]] || ABBR_MAP[a.teams[1]]) ? 1 : 0;
    const bMajor = (ABBR_MAP[b.teams[0]] || ABBR_MAP[b.teams[1]]) ? 1 : 0;
    return bMajor - aMajor;
  });

  return sortedData.slice(0, limit).map((m): CricketMatch => {
    const t1 = m.teams[0];
    const t2 = m.teams[1];
    const s1 = scoreForTeam(m.score, t1);
    const s2 = scoreForTeam(m.score, t2);

    return {
      id: m.id,
      name: m.name,
      matchType: m.matchType.toUpperCase(),
      status: matchState(m),
      statusText: m.status,
      teams: [t1, t2],
      scores: [
        ...(s1 ? [{ team: t1, runs: s1.r, wickets: s1.w, overs: s1.o }] : []),
        ...(s2 ? [{ team: t2, runs: s2.r, wickets: s2.w, overs: s2.o }] : []),
      ],
      venue: m.venue,
      date: m.dateTimeGMT ?? m.date,
      matchWinner: m.matchWinner,
    };
  });
}

// ─── Public: scorecard format (for live scores widget) ────────────────────────

export async function fetchCricketScorecards(limit = 12): Promise<Scorecard[]> {
  const data = await fetchCricApi<CricApiResponse>('currentMatches');
  if (!data || data.status !== 'success' || !data.data) return [];

  // Prioritize major teams
  const sortedData = data.data.sort((a, b) => {
    const aMajor = (ABBR_MAP[a.teams[0]] || ABBR_MAP[a.teams[1]]) ? 1 : 0;
    const bMajor = (ABBR_MAP[b.teams[0]] || ABBR_MAP[b.teams[1]]) ? 1 : 0;
    return bMajor - aMajor;
  });

  const results: Scorecard[] = [];

  for (const m of sortedData.slice(0, limit)) {
    const t1 = m.teams[0];
    const t2 = m.teams[1];
    const s1 = scoreForTeam(m.score, t1);
    const s2 = scoreForTeam(m.score, t2);
    const state = matchState(m);

    const makeTeam = (name: string, sc?: CricScore): TeamLine => ({
      abbr: abbr(name),
      name,
      score: sc && state !== 'upcoming' ? `${sc.r}/${sc.w}` : undefined,
      overs: sc && state !== 'upcoming' ? `(${sc.o})` : undefined,
      color: color(name),
    });

    const card: Scorecard = {
      id: m.id,
      tabs: ['cricket'] as ScorecardTab[],
      meta: m.matchType.toUpperCase(),
      home: makeTeam(t1, s1),
      away: makeTeam(t2, s2),
      status: state,
      href: `/match/${m.id}`,
      showPointsTable: true,
    };

    if (state === 'live') {
      card.liveMinute = 'LIVE';
      card.result = m.status;
    }
    if (state === 'completed') {
      card.result = m.status;
    }
    if (state === 'upcoming' && (m.dateTimeGMT ?? m.date)) {
      const { scheduledTime, scheduledDay } = formatStartTime((m.dateTimeGMT ?? m.date)!);
      card.scheduledTime = scheduledTime;
      card.scheduledDay = scheduledDay;
    }

    results.push(card);
  }

  return results;
}

// ─── Public: player search ────────────────────────────────────────────────────

export interface PlayerSearchResult {
  id: string;
  name: string;
  country: string;
}

interface PlayersApiResponse {
  status: string;
  data?: PlayerSearchResult[];
}

export async function searchPlayers(query: string): Promise<PlayerSearchResult[]> {
  if (!CRIC_KEY || !query.trim()) return [];
  try {
    const url = `${CRIC_BASE}/players?apikey=${CRIC_KEY}&offset=0&search=${encodeURIComponent(query)}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data: PlayersApiResponse = await res.json();
    if (data.status !== 'success' || !data.data) return [];
    return data.data;
  } catch {
    return [];
  }
}

// ─── Public: player full info & stats ─────────────────────────────────────────

interface RawStat {
  fn: string;       // "batting" | "bowling"
  matchtype: string; // "test" | "odi" | "t20" | "ipl"
  stat: string;     // " m ", " runs ", etc.
  value: string;    // " 123 "
}

interface PlayerInfoApiResponse {
  status: string;
  data?: {
    id: string;
    name: string;
    dateOfBirth?: string;
    role?: string;
    battingStyle?: string;
    bowlingStyle?: string;
    country?: string;
    playerImg?: string;
    stats?: RawStat[];
  };
}

export interface PlayerStatRow {
  stat: string;
  value: string;
}

export interface PlayerFormatStats {
  batting: PlayerStatRow[];
  bowling: PlayerStatRow[];
}

export interface PlayerInfo {
  id: string;
  name: string;
  country?: string;
  role?: string;
  battingStyle?: string;
  bowlingStyle?: string;
  dateOfBirth?: string;
  playerImg?: string;
  stats: {
    test: PlayerFormatStats;
    odi: PlayerFormatStats;
    t20: PlayerFormatStats;
    ipl: PlayerFormatStats;
  };
}

export async function fetchPlayerInfo(id: string): Promise<PlayerInfo | null> {
  if (!CRIC_KEY) return null;
  try {
    const url = `${CRIC_BASE}/players_info?apikey=${CRIC_KEY}&id=${id}`;
    const res = await fetch(url, { cache: 'no-store' }); // Ensure fresh fetch on search
    if (!res.ok) return null;
    const data: PlayerInfoApiResponse = await res.json();
    if (data.status !== 'success' || !data.data) return null;

    const raw = data.data;
    const formats = ['test', 'odi', 't20', 'ipl'] as const;

    const stats = Object.fromEntries(
      formats.map((fmt) => {
        const fmtStats = raw.stats?.filter((s) => s.matchtype === fmt) ?? [];
        const batting = fmtStats
          .filter((s) => s.fn === 'batting')
          .map((s) => ({ stat: s.stat.trim(), value: s.value.trim() }));
        const bowling = fmtStats
          .filter((s) => s.fn === 'bowling')
          .map((s) => ({ stat: s.stat.trim(), value: s.value.trim() }));
        return [fmt, { batting, bowling }];
      })
    ) as PlayerInfo['stats'];

    return {
      id: raw.id,
      name: raw.name,
      country: raw.country,
      role: raw.role,
      battingStyle: raw.battingStyle,
      bowlingStyle: raw.bowlingStyle,
      dateOfBirth: raw.dateOfBirth,
      playerImg: raw.playerImg,
      stats,
    };
  } catch {
    return null;
  }
}
