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
      const sports = ['football', 'basketball', 'cricket']; // Add more as needed
      const baseUrl = 'https://sports.highlightly.net'; // Generic base URL
      
      let totalSynced = 0;

      for (const sport of sports) {
        // Just an example, update the endpoint to the exact Highlightly matches endpoint
        const response = await fetch(`${baseUrl}/${sport}/matches`, {
          headers: {
            'x-rapidapi-key': apiKey,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          this.logger.error(`Failed to fetch ${sport} matches: ${response.statusText}`);
          continue;
        }

        const data = await response.json();
        const matches = data?.data || [];

        for (const item of matches) {
          // Map Highlightly API data to our Prisma Match model
          const mappedMatch = {
            sport: sport,
            title: `${item.home_team?.name || 'Unknown'} vs ${item.away_team?.name || 'Unknown'}`,
            homeTeamName: item.home_team?.name || 'Unknown',
            homeTeamLogo: item.home_team?.logo || '',
            homeTeamScore: item.score?.home?.toString() || null,
            awayTeamName: item.away_team?.name || 'Unknown',
            awayTeamLogo: item.away_team?.logo || '',
            awayTeamScore: item.score?.away?.toString() || null,
            status: item.status === 'IN_PROGRESS' ? 'live' : item.status === 'FINISHED' ? 'result' : 'upcoming',
            date: item.start_time ? new Date(item.start_time) : new Date(),
          };

          // Upsert based on external ID if we had one, or simply create/update
          // For now, we'll try to find by title and date (approximate) or just insert
          // In a real scenario, use an externalId field
          const existing = await this.prisma.match.findFirst({
            where: { title: mappedMatch.title, sport: mappedMatch.sport }
          });

          if (existing) {
            await this.prisma.match.update({
              where: { id: existing.id },
              data: mappedMatch
            });
          } else {
            await this.prisma.match.create({
              data: mappedMatch
            });
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
