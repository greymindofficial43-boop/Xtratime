import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/slug.util';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { articles: true } },
        children: {
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
      },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      include: {
        _count: { select: { articles: true } },
        children: {
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
      },
    });
  }

  async create(dto: CreateCategoryDto) {
    // Always normalize to an English/ASCII slug, even if one was supplied.
    const slug = slugify(dto.slug ?? dto.name);
    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) throw new ConflictException('Category slug already exists');

    return this.prisma.category.create({
      data: { ...dto, slug },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.ensureExists(id);
    const data = { ...dto };
    if (dto.slug) {
      data.slug = slugify(dto.slug);
    } else if (dto.name) {
      data.slug = slugify(dto.name);
    }
    return this.prisma.category.update({ where: { id }, data });
  }

  async reorder(updates: { id: string; sortOrder?: number; navOrder?: number }[]) {
    // Run all updates in a transaction
    const transactions = updates.map((u) =>
      this.prisma.category.update({
        where: { id: u.id },
        data: {
          ...(u.sortOrder !== undefined && { sortOrder: u.sortOrder }),
          ...(u.navOrder !== undefined && { navOrder: u.navOrder }),
        }
      })
    );
    return this.prisma.$transaction(transactions);
  }

  // Deleting a category no longer destroys its articles. If the category is the
  // primary category for any article, deletion is blocked until those articles
  // are reassigned to another category (passed as `reassignTo`).
  async remove(id: string, reassignTo?: string) {
    await this.ensureExists(id);

    const primaryArticles = await this.prisma.article.findMany({
      where: { categoryId: id },
      select: { id: true },
    });

    if (primaryArticles.length > 0) {
      if (!reassignTo) {
        throw new ConflictException(
          `This category is the main category for ${primaryArticles.length} article(s). ` +
            `Choose another category to move them to before deleting.`,
        );
      }
      if (reassignTo === id) {
        throw new BadRequestException('Choose a different category to move the articles to.');
      }
      const target = await this.prisma.category.findUnique({ where: { id: reassignTo } });
      if (!target) throw new NotFoundException('Target category not found');

      const articleIds = primaryArticles.map((a) => a.id);
      // Move the primary category, then ensure each moved article keeps a
      // membership row for the target (the old memberships cascade away on delete).
      await this.prisma.$transaction([
        this.prisma.article.updateMany({
          where: { categoryId: id },
          data: { categoryId: reassignTo },
        }),
        this.prisma.articleCategory.createMany({
          data: articleIds.map((articleId) => ({ articleId, categoryId: reassignTo })),
          skipDuplicates: true,
        }),
      ]);
    }

    // Any remaining memberships pointing at this category cascade away on delete.
    return this.prisma.category.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }
}
