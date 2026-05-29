import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);

  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.match.findMany({ orderBy: { date: 'asc' } });
  }

  create(data: CreateMatchDto) {
    return this.prisma.match.create({ data });
  }

  async update(id: string, data: UpdateMatchDto) {
    const match = await this.prisma.match.findUnique({ where: { id } });
    if (!match) throw new NotFoundException('Match not found');
    return this.prisma.match.update({ where: { id }, data });
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
      // Example implementation for cross-sport Highlightly API
      // Since the exact format depends on the specific Highlightly endpoint,
      // we'll fetch from a generic endpoint or multiple endpoints.
      const today = new Date().toISOString().split('T')[0];
      
      const endpoints = [
        { key: 'football', sport: 'soccer', url: `https://sports.highlightly.net/football/matches?date=${today}` },
        { key: 'basketball', sport: 'basketball', url: `https://basketball.highlightly.net/matches?date=${today}` },
        { key: 'cricket', sport: 'cricket', url: `https://cricket.highlightly.net/matches?date=${today}` },
        { key: 'volleyball', sport: 'volleyball', url: `https://volleyball.highlightly.net/matches?date=${today}` },
        { key: 'nba', sport: 'basketball', url: `https://nba.highlightly.net/matches?date=${today}` },
        { key: 'nhl', sport: 'hockey', url: `https://nhl.highlightly.net/matches?date=${today}` },
      ];

      let totalSynced = 0;

      for (const { key, sport, url } of endpoints) {
        const response = await fetch(url, {
          headers: {
            'x-rapidapi-key': apiKey,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          this.logger.warn(`Highlightly ${key}: ${response.status} ${response.statusText}`);
          continue;
        }

        const data = await response.json();
        const matches = Array.isArray(data) ? data : (data.data || []);

        for (const item of matches) {
          const homeTeam = item.homeTeam || item.home_team || {};
          const awayTeam = item.awayTeam || item.away_team || {};

          // Cricket uses innings array; football uses state.score.current
          let homeScore: string | null = null;
          let awayScore: string | null = null;

          if (key === 'cricket' && item.innings && item.innings.length > 0) {
            // Each innings has team, score, wickets, overs
            const homeInnings = item.innings.filter((inn: any) =>
              inn.team === homeTeam.name || inn.battingTeam === homeTeam.name
            );
            const awayInnings = item.innings.filter((inn: any) =>
              inn.team === awayTeam.name || inn.battingTeam === awayTeam.name
            );
            if (homeInnings.length > 0) {
              const inn = homeInnings[homeInnings.length - 1];
              homeScore = `${inn.score ?? inn.runs ?? ''}/${inn.wickets ?? ''}`;
            }
            if (awayInnings.length > 0) {
              const inn = awayInnings[awayInnings.length - 1];
              awayScore = `${inn.score ?? inn.runs ?? ''}/${inn.wickets ?? ''}`;
            }
          } else {
            const scoreCurrent = item.state?.score?.current || item.score || {};
            homeScore = scoreCurrent.home?.toString() || null;
            awayScore = scoreCurrent.away?.toString() || null;
          }

          const statusDesc = (item.state?.description || item.status || 'not started').toLowerCase();
          let matchStatus = 'upcoming';
          if (statusDesc.includes('progress') || statusDesc.includes('live') || statusDesc.includes('inprogress')) matchStatus = 'live';
          else if (statusDesc.includes('finished') || statusDesc.includes('ended') || statusDesc.includes('complete')) matchStatus = 'result';

          const mappedMatch = {
            sport,
            title: `${homeTeam.name || 'Unknown'} vs ${awayTeam.name || 'Unknown'}`,
            homeTeamName: homeTeam.name || 'Unknown',
            homeTeamLogo: homeTeam.logo || homeTeam.image || '',
            homeTeamScore: homeScore,
            awayTeamName: awayTeam.name || 'Unknown',
            awayTeamLogo: awayTeam.logo || awayTeam.image || '',
            awayTeamScore: awayScore,
            status: matchStatus,
            note: item.state?.description || item.note || null,
            date: item.date ? new Date(item.date) : new Date(),
          };

          const existing = await this.prisma.match.findFirst({
            where: { title: mappedMatch.title, sport: mappedMatch.sport },
          });

          if (existing) {
            await this.prisma.match.update({ where: { id: existing.id }, data: mappedMatch });
          } else {
            await this.prisma.match.create({ data: mappedMatch });
          }
          totalSynced++;
        }
      }

      return { success: true, synced: totalSynced };
    } catch (error) {
      this.logger.error('Error syncing live matches', error);
      return { success: false, message: 'Internal error during sync' };
    }
  }
}
