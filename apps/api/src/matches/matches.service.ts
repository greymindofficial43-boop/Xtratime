import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

type HighlightlyEndpoint = {
  key: string;
  sport: string;
  league?: string;
  url: string;
};

@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);

  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.match.findMany({ orderBy: [{ date: 'asc' }, { createdAt: 'desc' }] });
  }

  create(data: CreateMatchDto) {
    return this.prisma.match.create({
      data: {
        source: data.source ?? 'manual',
        externalId: data.externalId,
        sport: data.sport,
        league: data.league,
        title: data.title,
        homeTeamName: data.homeTeamName,
        homeTeamLogo: data.homeTeamLogo,
        homeTeamScore: data.homeTeamScore,
        awayTeamName: data.awayTeamName,
        awayTeamLogo: data.awayTeamLogo,
        awayTeamScore: data.awayTeamScore,
        status: data.status,
        note: data.note,
        statusDetail: data.statusDetail,
        venue: data.venue,
        details: data.details as any,
        date: data.date,
      },
    });
  }

  async update(id: string, data: UpdateMatchDto) {
    const match = await this.prisma.match.findUnique({ where: { id } });
    if (!match) throw new NotFoundException('Match not found');
    return this.prisma.match.update({ where: { id }, data: data as any });
  }

  async remove(id: string) {
    const match = await this.prisma.match.findUnique({ where: { id } });
    if (!match) throw new NotFoundException('Match not found');
    return this.prisma.match.delete({ where: { id } });
  }

  async syncLiveMatches() {
    const apiKey = process.env.HIGHLIGHTLY_API_KEY;
    if (!apiKey) {
      this.logger.warn('HIGHLIGHTLY_API_KEY is not set. Skipping live match sync.');
      return { success: false, message: 'API key not configured' };
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const endpoints: HighlightlyEndpoint[] = [
        { key: 'football', sport: 'soccer', league: 'Football', url: `https://sports.highlightly.net/football/matches?date=${today}` },
        { key: 'basketball', sport: 'basketball', league: 'Basketball', url: `https://basketball.highlightly.net/matches?date=${today}` },
        { key: 'cricket', sport: 'cricket', league: 'Cricket', url: `https://cricket.highlightly.net/matches?date=${today}` },
        { key: 'volleyball', sport: 'volleyball', league: 'Volleyball', url: `https://volleyball.highlightly.net/matches?date=${today}` },
        { key: 'nba', sport: 'basketball', league: 'NBA', url: `https://nba.highlightly.net/matches?date=${today}` },
        { key: 'nhl', sport: 'hockey', league: 'NHL', url: `https://nhl.highlightly.net/matches?date=${today}` },
      ];

      let totalSynced = 0;

      for (const endpoint of endpoints) {
        const response = await fetch(endpoint.url, {
          headers: {
            'x-rapidapi-key': apiKey,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          this.logger.warn(`Highlightly ${endpoint.key}: ${response.status} ${response.statusText}`);
          continue;
        }

        const payload = await response.json();
        const matches = Array.isArray(payload) ? payload : (payload.data || []);

        for (const item of matches) {
          await this.upsertHighlightlyMatch(endpoint, item);
          totalSynced++;
        }
      }

      return { success: true, synced: totalSynced };
    } catch (error) {
      this.logger.error('Error syncing live matches', error instanceof Error ? error.stack : String(error));
      return { success: false, message: 'Internal error during sync' };
    }
  }

  private async upsertHighlightlyMatch(endpoint: HighlightlyEndpoint, item: any) {
    const homeTeam = item.homeTeam || item.home_team || {};
    const awayTeam = item.awayTeam || item.away_team || {};
    const statusDetail = item.state?.description || item.status || item.note || null;
    const status = this.mapStatus(statusDetail);
    const source = `highlightly:${endpoint.key}`;
    const externalId = String(item.id || item.matchId || item.slug || `${homeTeam.name}-${awayTeam.name}-${item.date ?? ''}`);
    const scores = this.extractScores(endpoint.key, item, homeTeam, awayTeam);
    const title = item.title || item.name || `${homeTeam.name || 'Unknown'} vs ${awayTeam.name || 'Unknown'}`;

    const existing = await this.prisma.match.findFirst({
      where: {
        OR: [
          { source, externalId },
          { source, title },
        ],
      },
    });

    const homeTeamScore = scores.homeScore ?? existing?.homeTeamScore ?? null;
    const awayTeamScore = scores.awayScore ?? existing?.awayTeamScore ?? null;

    const mappedMatch = {
      source,
      externalId,
      sport: endpoint.sport,
      league: item.league?.name || item.tournament?.name || endpoint.league || item.competition?.name || null,
      title,
      homeTeamName: homeTeam.name || homeTeam.shortName || 'Unknown',
      homeTeamLogo: homeTeam.logo || homeTeam.image || '',
      homeTeamScore,
      awayTeamName: awayTeam.name || awayTeam.shortName || 'Unknown',
      awayTeamLogo: awayTeam.logo || awayTeam.image || '',
      awayTeamScore,
      status,
      note: this.buildResultNote(item, status, homeTeam, awayTeam),
      statusDetail,
      venue: item.venue?.name || item.venue || item.location || null,
      details: item,
      date: item.date ? new Date(item.date) : (existing?.date ?? new Date()),
    };

    if (existing) {
      await this.prisma.match.update({ where: { id: existing.id }, data: mappedMatch });
      return;
    }

    await this.prisma.match.create({ data: mappedMatch });
  }

  private extractScores(apiKey: string, item: any, homeTeam: any, awayTeam: any) {
    let homeScore: string | null = null;
    let awayScore: string | null = null;

    if (apiKey === 'cricket' && Array.isArray(item.innings) && item.innings.length > 0) {
      const homeInnings = item.innings.filter((inning: any) =>
        inning.team === homeTeam.name || inning.battingTeam === homeTeam.name,
      );
      const awayInnings = item.innings.filter((inning: any) =>
        inning.team === awayTeam.name || inning.battingTeam === awayTeam.name,
      );

      if (homeInnings.length > 0) {
        const inning = homeInnings[homeInnings.length - 1];
        homeScore = `${inning.score ?? inning.runs ?? 0}/${inning.wickets ?? 0}`;
      }

      if (awayInnings.length > 0) {
        const inning = awayInnings[awayInnings.length - 1];
        awayScore = `${inning.score ?? inning.runs ?? 0}/${inning.wickets ?? 0}`;
      }
    } else {
      const scoreCurrent = item.state?.score?.current || item.score || {};
      homeScore = scoreCurrent.home?.toString?.() ?? scoreCurrent.home ?? null;
      awayScore = scoreCurrent.away?.toString?.() ?? scoreCurrent.away ?? null;
    }

    return { homeScore, awayScore };
  }

  private mapStatus(statusDetail?: string | null) {
    const normalized = (statusDetail || 'not started').toLowerCase();
    if (
      normalized.includes('progress') ||
      normalized.includes('live') ||
      normalized.includes('inprogress')
    ) {
      return 'live';
    }
    if (
      normalized.includes('finished') ||
      normalized.includes('ended') ||
      normalized.includes('complete') ||
      normalized.includes('final')
    ) {
      return 'result';
    }
    return 'upcoming';
  }

  private buildResultNote(item: any, status: string, homeTeam: any, awayTeam: any) {
    if (status === 'live') {
      return item.state?.description || item.note || 'Live';
    }
    if (status === 'result') {
      return item.result?.summary || item.state?.description || item.note || `${homeTeam.name || 'Home'} vs ${awayTeam.name || 'Away'} completed`;
    }
    return item.note || null;
  }
}
