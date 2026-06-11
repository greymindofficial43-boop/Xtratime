import type { Scorecard, ScorecardTab, MatchStatus, TeamLine } from './scorecards';

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

// ─── Internal ESPN API shapes ─────────────────────────────────────────────────

interface EspnTeam {
  abbreviation: string;
  shortDisplayName: string;
  displayName: string;
  color?: string;
  logo?: string;
}

interface EspnCompetitor {
  homeAway: 'home' | 'away';
  winner?: boolean;
  team: EspnTeam;
  score?: string;
}

interface EspnStatusType {
  state: 'pre' | 'in' | 'post';
  shortDetail?: string;
}

interface EspnStatus {
  displayClock?: string;
  period?: number;
  type: EspnStatusType;
}

interface EspnCompetition {
  status: EspnStatus;
  competitors: EspnCompetitor[];
  venue?: { fullName?: string };
}

interface EspnEvent {
  id: string;
  name: string;
  date?: string;
  competitions: EspnCompetition[];
}

interface EspnScoreboard {
  events?: EspnEvent[];
  season?: { displayName?: string };
  week?: { number?: number };
}

interface EspnNewsImage {
  url: string;
}

interface EspnNewsArticle {
  id: string | number;
  headline: string;
  description?: string;
  published?: string;
  byline?: string;
  images?: EspnNewsImage[];
  links?: { web?: { href: string } };
}

interface EspnNewsResponse {
  articles?: EspnNewsArticle[];
}

// ─── Public exported types ────────────────────────────────────────────────────

export interface EspnNewsItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  publishedAt?: string;
  byline?: string;
  url: string;
  sport: string;
  sportSlug: string;
}

export interface EspnScheduleTeam {
  abbr: string;
  name: string;
  fullName: string;
  logo?: string;
  color: string;
  score?: string;
  winner?: boolean;
}

export interface EspnScheduleGame {
  id: string;
  sport: string;
  sportSlug: Exclude<ScorecardTab, 'featured'>;
  meta: string;
  home: EspnScheduleTeam;
  away: EspnScheduleTeam;
  status: MatchStatus;
  statusDetail: string;
  liveMinute?: string;
  date?: string;
  venue?: string;
  href: string;
}

// Map from internal category slug → ESPN sport path info
export const CATEGORY_SPORT_MAP: Record<
  string,
  { path: string; sportLabel: string; sportSlug: Exclude<ScorecardTab, 'featured'> }
> = {
  nfl: { path: '/football/nfl', sportLabel: 'NFL', sportSlug: 'nfl' },
  nba: { path: '/basketball/nba', sportLabel: 'NBA', sportSlug: 'nba' },
  mlb: { path: '/baseball/mlb', sportLabel: 'MLB', sportSlug: 'mlb' },
  nhl: { path: '/hockey/nhl', sportLabel: 'NHL', sportSlug: 'nhl' },
  football: { path: '/soccer/eng.1', sportLabel: 'Soccer', sportSlug: 'soccer' },
  soccer: { path: '/soccer/eng.1', sportLabel: 'Soccer', sportSlug: 'soccer' },
};

// ─── Fetch primitives ─────────────────────────────────────────────────────────

async function fetchEspn<T>(path: string, revalidate = 60): Promise<T | null> {
  try {
    const res = await fetch(`${ESPN_BASE}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

// ─── Normalizer helpers ───────────────────────────────────────────────────────

function teamColor(hex?: string): string {
  if (!hex) return '#374151';
  return hex.startsWith('#') ? hex : `#${hex}`;
}

function stateToStatus(state: 'pre' | 'in' | 'post'): MatchStatus {
  if (state === 'in') return 'live';
  if (state === 'post') return 'completed';
  return 'upcoming';
}

function liveClock(status: EspnStatus, sport: string): string {
  const period = status.period ?? 1;
  const clock = status.displayClock ?? '';
  if (sport === 'soccer') return `${clock}'`;
  if (sport === 'mlb') return status.type.shortDetail ?? `Inn ${period}`;
  if (sport === 'nhl') return `P${period} ${clock}`;
  return `Q${period} ${clock}`;
}

function formatStartTime(iso: string): { scheduledTime: string; scheduledDay: string } {
  const date = new Date(iso);
  const now = new Date();
  const todayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const gameDayMs = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diff = gameDayMs - todayMs;

  const scheduledTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York',
  });

  const scheduledDay =
    diff === 0 ? 'Today' :
    diff === 86_400_000 ? 'Tomorrow' :
    date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return { scheduledTime, scheduledDay };
}

// ─── Scoreboard normalizers (for live-scores widget) ─────────────────────────

function normalizeToScorecard(
  event: EspnEvent,
  sport: string,
  metaLabel: string,
  href: string,
): Scorecard | null {
  const comp = event.competitions?.[0];
  if (!comp) return null;
  const homeComp = comp.competitors.find((c) => c.homeAway === 'home');
  const awayComp = comp.competitors.find((c) => c.homeAway === 'away');
  if (!homeComp || !awayComp) return null;

  const status = stateToStatus(comp.status.type.state);
  const makeTeam = (c: EspnCompetitor): TeamLine => ({
    abbr: c.team.abbreviation,
    name: c.team.shortDisplayName,
    logo: c.team.logo,
    score: status !== 'upcoming' ? (c.score ?? undefined) : undefined,
    color: teamColor(c.team.color),
  });

  const card: Scorecard = {
    id: event.id,
    tabs: [],
    meta: metaLabel,
    home: makeTeam(homeComp),
    away: makeTeam(awayComp),
    status,
    href: `/match/${event.id}`,
    showPointsTable: true,
  };

  if (status === 'live') {
    card.liveMinute = liveClock(comp.status, sport);
    const hs = parseInt(homeComp.score ?? '0', 10);
    const as_ = parseInt(awayComp.score ?? '0', 10);
    if (hs !== as_) card.result = `${(hs > as_ ? homeComp : awayComp).team.abbreviation} leads`;
  }

  if (status === 'completed') {
    const winner = comp.competitors.find((c) => c.winner);
    card.result = winner
      ? `${winner.team.abbreviation} won ${winner.score ?? ''}–${comp.competitors.find((c) => !c.winner)?.score ?? ''}`
      : (comp.status.type.shortDetail ?? 'Final');
  }

  if (status === 'upcoming' && event.date) {
    const { scheduledTime, scheduledDay } = formatStartTime(event.date);
    card.scheduledTime = scheduledTime;
    card.scheduledDay = scheduledDay;
  }

  return card;
}

function boardToScorecards(
  board: EspnScoreboard | null,
  sport: string,
  tab: Exclude<ScorecardTab, 'featured'>,
  metaLabel: string,
  href: string,
  limit = 10,
): Scorecard[] {
  return (board?.events ?? [])
    .slice(0, limit)
    .map((e) => normalizeToScorecard(e, sport, metaLabel, href))
    .filter((c): c is Scorecard => c !== null)
    .map((c) => ({ ...c, tabs: [tab] as ScorecardTab[] }));
}

// ─── Schedule normalizers (richer type with logos) ────────────────────────────

function normalizeToScheduleGame(
  event: EspnEvent,
  sport: string,
  sportSlug: Exclude<ScorecardTab, 'featured'>,
  sportLabel: string,
  metaLabel: string,
  href: string,
): EspnScheduleGame | null {
  const comp = event.competitions?.[0];
  if (!comp) return null;
  const homeComp = comp.competitors.find((c) => c.homeAway === 'home');
  const awayComp = comp.competitors.find((c) => c.homeAway === 'away');
  if (!homeComp || !awayComp) return null;

  const status = stateToStatus(comp.status.type.state);
  const makeTeam = (c: EspnCompetitor): EspnScheduleTeam => ({
    abbr: c.team.abbreviation,
    name: c.team.shortDisplayName,
    fullName: c.team.displayName,
    logo: c.team.logo,
    color: teamColor(c.team.color),
    score: status !== 'upcoming' ? (c.score ?? undefined) : undefined,
    winner: c.winner,
  });

  let statusDetail = '';
  let liveMinute: string | undefined;

  if (status === 'live') {
    liveMinute = liveClock(comp.status, sport);
    statusDetail = liveMinute;
  } else if (status === 'completed') {
    statusDetail = comp.status.type.shortDetail ?? 'Final';
  } else if (event.date) {
    const { scheduledTime, scheduledDay } = formatStartTime(event.date);
    statusDetail = `${scheduledDay} · ${scheduledTime} ET`;
  }

  return {
    id: event.id,
    sport: sportLabel,
    sportSlug,
    meta: metaLabel,
    home: makeTeam(homeComp),
    away: makeTeam(awayComp),
    status,
    statusDetail,
    liveMinute,
    date: event.date,
    venue: comp.venue?.fullName,
    href,
  };
}

// ─── Public: live-scores scoreboard ──────────────────────────────────────────

export interface SportCards {
  featured: Scorecard[];
  cricket: Scorecard[];
  nfl: Scorecard[];
  nba: Scorecard[];
  mlb: Scorecard[];
  soccer: Scorecard[];
  nhl: Scorecard[];
}

export async function fetchAllScoreboards(): Promise<SportCards> {
  const [nflB, nbaB, mlbB, eplB, nhlB] = await Promise.all([
    fetchEspn<EspnScoreboard>('/football/nfl/scoreboard'),
    fetchEspn<EspnScoreboard>('/basketball/nba/scoreboard'),
    fetchEspn<EspnScoreboard>('/baseball/mlb/scoreboard'),
    fetchEspn<EspnScoreboard>('/soccer/eng.1/scoreboard'),
    fetchEspn<EspnScoreboard>('/hockey/nhl/scoreboard'),
  ]);

  const nfl = boardToScorecards(nflB, 'football', 'nfl', `NFL${nflB?.week?.number ? ` • Week ${nflB.week.number}` : ''}`, '/category/nfl');
  const nba = boardToScorecards(nbaB, 'basketball', 'nba', 'NBA', '/category/nba');
  const mlb = boardToScorecards(mlbB, 'baseball', 'mlb', 'MLB', '/category/mlb');
  const soccer = boardToScorecards(eplB, 'soccer', 'soccer', 'Premier League', '/category/football');
  const nhl = boardToScorecards(nhlB, 'hockey', 'nhl', 'NHL', '/category/nhl');

  const all = [...nfl, ...nba, ...mlb, ...soccer, ...nhl];
  const featured = [
    ...all.filter((c) => c.status === 'live'),
    ...all.filter((c) => c.status === 'upcoming'),
    ...all.filter((c) => c.status === 'completed'),
  ]
    .slice(0, 12)
    .map((c) => ({ ...c, tabs: [...c.tabs, 'featured' as ScorecardTab] }));

  return { featured, cricket: [], nfl, nba, mlb, soccer, nhl };
}

export async function fetchCategoryScorecards(slug: string, limit = 12): Promise<Scorecard[]> {
  const sport = CATEGORY_SPORT_MAP[slug];
  if (!sport) return [];

  const board = await fetchEspn<EspnScoreboard>(`${sport.path}/scoreboard`);
  return boardToScorecards(
    board,
    sport.path.split('/')[1] || 'football',
    sport.sportSlug,
    sport.sportLabel,
    `/category/${slug}`,
    limit
  );
}

// ─── Public: full schedule ────────────────────────────────────────────────────

export async function fetchAllScheduleGames(): Promise<EspnScheduleGame[]> {
  const [nflB, nbaB, mlbB, eplB, nhlB] = await Promise.all([
    fetchEspn<EspnScoreboard>('/football/nfl/scoreboard'),
    fetchEspn<EspnScoreboard>('/basketball/nba/scoreboard'),
    fetchEspn<EspnScoreboard>('/baseball/mlb/scoreboard'),
    fetchEspn<EspnScoreboard>('/soccer/eng.1/scoreboard'),
    fetchEspn<EspnScoreboard>('/hockey/nhl/scoreboard'),
  ]);

  const make = (
    board: EspnScoreboard | null,
    sport: string,
    slug: Exclude<ScorecardTab, 'featured'>,
    label: string,
    meta: string,
    href: string,
  ) =>
    (board?.events ?? [])
      .map((e) => normalizeToScheduleGame(e, sport, slug, label, meta, href))
      .filter((g): g is EspnScheduleGame => g !== null);

  return [
    ...make(nflB, 'football', 'nfl', 'NFL', `NFL${nflB?.week?.number ? ` • Week ${nflB.week.number}` : ''}`, '/category/nfl'),
    ...make(nbaB, 'basketball', 'nba', 'NBA', 'NBA', '/category/nba'),
    ...make(mlbB, 'baseball', 'mlb', 'MLB', 'MLB', '/category/mlb'),
    ...make(eplB, 'soccer', 'soccer', 'Soccer', 'Premier League', '/category/football'),
    ...make(nhlB, 'hockey', 'nhl', 'NHL', 'NHL', '/category/nhl'),
  ];
}

// ─── Public: news ─────────────────────────────────────────────────────────────

function normalizeNewsItem(a: EspnNewsArticle, sport: string, sportSlug: string): EspnNewsItem {
  return {
    id: String(a.id),
    title: a.headline,
    description: a.description ?? '',
    imageUrl: a.images?.[0]?.url,
    publishedAt: a.published,
    byline: a.byline,
    url: a.links?.web?.href ?? '#',
    sport,
    sportSlug,
  };
}

export async function fetchSportNews(
  _sportPath: string,
  _sportLabel: string,
  _sportSlug: string,
  _limit = 8,
): Promise<EspnNewsItem[]> {
  // ESPN content has been removed from the site entirely. Return nothing so any
  // remaining caller (homepage/category sections, promo fallback) renders no
  // ESPN news on either edition.
  return [];
  // Previous implementation kept for reference:
  // const data = await fetchEspn<EspnNewsResponse>(`${sportPath}/news`, 300);
  // return (data?.articles ?? []).slice(0, limit).map((a) => normalizeNewsItem(a, sportLabel, sportSlug));
}

export async function fetchHomepageNews(perSport = 4): Promise<EspnNewsItem[]> {
  const [nfl, nba, mlb, soccer, nhl] = await Promise.all([
    fetchSportNews('/football/nfl', 'NFL', 'nfl', perSport),
    fetchSportNews('/basketball/nba', 'NBA', 'nba', perSport),
    fetchSportNews('/baseball/mlb', 'MLB', 'mlb', perSport),
    fetchSportNews('/soccer/eng.1', 'Soccer', 'soccer', perSport),
    fetchSportNews('/hockey/nhl', 'NHL', 'nhl', perSport),
  ]);
  return [...nfl, ...nba, ...mlb, ...soccer, ...nhl];
}

export async function fetchCategoryNews(categorySlug: string, limit = 8): Promise<EspnNewsItem[]> {
  const sport = CATEGORY_SPORT_MAP[categorySlug];
  if (!sport) return [];
  return fetchSportNews(sport.path, sport.sportLabel, sport.sportSlug, limit);
}
