import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/slug.util';
import { CreateHomeSectionDto } from './dto/create-home-section.dto';
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
      include: { category: true },
    });
  }

  async create(dto: CreateHomeSectionDto) {
    const type = dto.type ?? 'CUSTOM_CATEGORY';
    if (type !== 'CUSTOM_CATEGORY') {
      throw new BadRequestException('Only custom category sections can be created from the admin');
    }
    if (!dto.categoryId) {
      throw new BadRequestException('Choose a category for this homepage section');
    }
    const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
    if (!category) throw new NotFoundException('Category not found');

    const key = await this.ensureUniqueKey(`custom-${slugify(dto.title) || 'section'}`);
    const sortOrder = await this.prisma.homeSection.count();

    return this.prisma.homeSection.create({
      data: {
        key,
        title: dto.title,
        type,
        categoryId: dto.categoryId,
        articleLimit: dto.articleLimit ?? 6,
        enabled: dto.enabled ?? true,
        sortOrder,
      },
      include: { category: true },
    });
  }

  async update(id: string, dto: UpdateHomeSectionDto) {
    const existing = await this.ensureExists(id);
    if (dto.type && dto.type !== 'CUSTOM_CATEGORY' && existing.type !== 'SYSTEM') {
      throw new BadRequestException('Invalid homepage section type');
    }
    if ((dto.type === 'CUSTOM_CATEGORY' || existing.type === 'CUSTOM_CATEGORY') && dto.categoryId) {
      const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
      if (!category) throw new NotFoundException('Category not found');
    }
    return this.prisma.homeSection.update({
      where: { id },
      data: {
        title: dto.title,
        enabled: dto.enabled,
        type: dto.type,
        categoryId: dto.categoryId,
        articleLimit: dto.articleLimit,
        sortOrder: dto.sortOrder,
      },
      include: { category: true },
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

  async remove(id: string) {
    const section = await this.ensureExists(id);
    if (section.type === 'SYSTEM') {
      throw new BadRequestException('Default homepage sections cannot be deleted; hide them instead.');
    }
    await this.prisma.homeSection.delete({ where: { id } });
    return { success: true };
  }

  private async ensureUniqueKey(baseKey: string) {
    let key = baseKey;
    let counter = 1;
    while (true) {
      const existing = await this.prisma.homeSection.findUnique({ where: { key } });
      if (!existing) return key;
      key = `${baseKey}-${counter++}`;
    }
  }

  private async ensureExists(id: string) {
    const section = await this.prisma.homeSection.findUnique({ where: { id } });
    if (!section) throw new NotFoundException('Home section not found');
    return section;
  }
}
