import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateHomeSectionDto } from './dto/update-home-section.dto';

// The canonical set of homepage blocks and their default order/labels. Used to
// seed the table and to backfill any block missing from the database, so the
// homepage always has a complete, sensibly-ordered config to render from.
export const DEFAULT_HOME_SECTIONS: { key: string; title: string }[] = [
  { key: 'live-scores', title: 'Live Scores' },
  { key: 'top-stories', title: 'Top Stories' },
  { key: 'more-stories', title: 'More Stories' },
  { key: 'promo', title: 'Promo Banner' },
  { key: 'category-sections', title: 'Category Sections' },
  { key: 'espn-news', title: 'Latest from ESPN' },
  { key: 'trending', title: 'Trending Now' },
];

@Injectable()
export class HomeSectionsService {
  constructor(private readonly prisma: PrismaService) {}

  // Returns every block, ensuring the defaults exist first so a fresh install
  // (or a newly added block) is always present and ordered.
  async findAll() {
    await this.ensureSeeded();
    return this.prisma.homeSection.findMany({
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    });
  }

  async update(id: string, dto: UpdateHomeSectionDto) {
    await this.ensureExists(id);
    return this.prisma.homeSection.update({
      where: { id },
      data: {
        title: dto.title,
        enabled: dto.enabled,
        sortOrder: dto.sortOrder,
      },
    });
  }

  reorder(updates: { id: string; sortOrder: number }[]) {
    return this.prisma.$transaction(
      updates.map((update) =>
        this.prisma.homeSection.update({
          where: { id: update.id },
          data: { sortOrder: update.sortOrder },
        }),
      ),
    );
  }

  // Insert any default blocks that aren't in the table yet (idempotent).
  async ensureSeeded() {
    const existing = await this.prisma.homeSection.findMany({ select: { key: true } });
    const have = new Set(existing.map((s) => s.key));
    const missing = DEFAULT_HOME_SECTIONS.filter((s) => !have.has(s.key));
    if (missing.length === 0) return { created: 0 };

    const base = have.size;
    await this.prisma.$transaction(
      missing.map((section, index) =>
        this.prisma.homeSection.create({
          data: {
            key: section.key,
            title: section.title,
            sortOrder: base + index,
          },
        }),
      ),
    );
    return { created: missing.length };
  }

  private async ensureExists(id: string) {
    const section = await this.prisma.homeSection.findUnique({ where: { id } });
    if (!section) throw new NotFoundException('Home section not found');
    return section;
  }
}
