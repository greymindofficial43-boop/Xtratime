import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticleStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/slug.util';
import { CreateArticleDto } from './dto/create-article.dto';
import { QueryArticlesDto } from './dto/query-articles.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

const categorySelect = { id: true, name: true, slug: true, color: true };

const articleInclude = {
  author: { select: { id: true, name: true, email: true } },
  category: { select: categorySelect },
  categories: { include: { category: { select: categorySelect } } },
  tags: { include: { tag: true } },
  galleryImages: { orderBy: { order: 'asc' as const } },
} satisfies Prisma.ArticleInclude;

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryArticlesDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;

    const and: Prisma.ArticleWhereInput[] = [];

    // Trash list shows only soft-deleted; every other list excludes them.
    and.push(query.trash ? { deletedAt: { not: null } } : { deletedAt: null });

    if (query.status) {
      and.push({ status: query.status });
    } else if (!query.allStatuses) {
      // Public lists (incl. search) only ever return published articles.
      and.push({ status: ArticleStatus.PUBLISHED });
    }

    if (query.category) {
      // Match the primary category OR any of the article's extra categories.
      and.push({
        OR: [
          { category: { slug: query.category } },
          { categories: { some: { category: { slug: query.category } } } },
        ],
      });
    }

    if (query.categoryId) {
      and.push({
        OR: [
          { categoryId: query.categoryId },
          { categories: { some: { categoryId: query.categoryId } } },
        ],
      });
    }

    if (query.tag) {
      and.push({ tags: { some: { tag: { slug: query.tag } } } });
    }

    if (query.featured) and.push({ isFeatured: true });
    if (query.trending) and.push({ isTrending: true });
    if (query.type) and.push({ type: query.type });

    if (query.search) {
      // Tokenize: every word must match somewhere (title/excerpt/content/
      // category name/tag name). Fixes multi-word queries that previously
      // required the exact phrase to appear verbatim.
      const terms = query.search.split(/\s+/).filter(Boolean);
      for (const term of terms) {
        and.push({
          OR: [
            { title: { contains: term, mode: 'insensitive' } },
            { excerpt: { contains: term, mode: 'insensitive' } },
            { content: { contains: term, mode: 'insensitive' } },
            { category: { name: { contains: term, mode: 'insensitive' } } },
            { tags: { some: { tag: { name: { contains: term, mode: 'insensitive' } } } } },
          ],
        });
      }
    }

    const where: Prisma.ArticleWhereInput = { AND: and };

    const [items, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        include: articleInclude,
      }),
      this.prisma.article.count({ where }),
    ]);

    return {
      items: items.map(this.formatArticle),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySlug(slug: string, incrementView = false) {
    const article = await this.prisma.article.findFirst({
      where: { slug, deletedAt: null },
      include: articleInclude,
    });

    if (!article) throw new NotFoundException('Article not found');

    if (incrementView && article.status === ArticleStatus.PUBLISHED) {
      await this.prisma.article.update({
        where: { id: article.id },
        data: { viewCount: { increment: 1 } },
      });
      article.viewCount += 1;
    }

    return this.formatArticle(article);
  }

  async create(authorId: string, dto: CreateArticleDto) {
    const slug = await this.ensureUniqueSlug(slugify(dto.slug ?? dto.title));
    const publishedAt = dto.publishedAt
      ? new Date(dto.publishedAt)
      : dto.status === ArticleStatus.PUBLISHED
        ? new Date()
        : null;

    const categoryIds = this.resolveCategoryIds(dto.categoryId, dto.categoryIds);

    const article = await this.prisma.article.create({
      data: {
        title: dto.title,
        type: dto.type,
        slug,
        excerpt: dto.excerpt,
        content: dto.content ?? '',
        featuredImage: dto.featuredImage,
        videoUrl: dto.videoUrl,
        status: dto.status ?? ArticleStatus.DRAFT,
        isFeatured: dto.isFeatured ?? false,
        isTrending: dto.isTrending ?? false,
        publishedAt,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        metaKeywords: dto.metaKeywords,
        authorId,
        categoryId: dto.categoryId,
        categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
        tags: dto.tagIds?.length
          ? { create: dto.tagIds.map((tagId) => ({ tagId })) }
          : undefined,
        galleryImages: dto.galleryImages?.length
          ? { create: dto.galleryImages.map((img) => ({ url: img.url, caption: img.caption, order: img.order })) }
          : undefined,
      },
      include: articleInclude,
    });

    return this.formatArticle(article);
  }

  async update(id: string, dto: UpdateArticleDto) {
    const existing = await this.prisma.article.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Article not found');

    let slug = existing.slug;
    if (dto.slug) {
      slug = await this.ensureUniqueSlug(slugify(dto.slug), id);
    } else if (dto.title) {
      slug = await this.ensureUniqueSlug(slugify(dto.title), id);
    }

    let publishedAt = existing.publishedAt;
    if (dto.publishedAt !== undefined) {
      publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : null;
    } else if (dto.status === ArticleStatus.PUBLISHED && !existing.publishedAt) {
      publishedAt = new Date();
    }

    if (dto.tagIds) {
      await this.prisma.articleTag.deleteMany({ where: { articleId: id } });
    }

    if (dto.galleryImages !== undefined) {
      await this.prisma.galleryImage.deleteMany({ where: { articleId: id } });
    }

    // Resync category memberships whenever the primary or the set changes.
    const primaryId = dto.categoryId ?? existing.categoryId;
    const categoryIds =
      dto.categoryIds !== undefined || dto.categoryId !== undefined
        ? this.resolveCategoryIds(primaryId, dto.categoryIds)
        : undefined;
    if (categoryIds) {
      await this.prisma.articleCategory.deleteMany({ where: { articleId: id } });
    }

    const article = await this.prisma.article.update({
      where: { id },
      data: {
        title: dto.title,
        type: dto.type,
        slug,
        excerpt: dto.excerpt,
        content: dto.content,
        featuredImage: dto.featuredImage,
        videoUrl: dto.videoUrl,
        status: dto.status,
        isFeatured: dto.isFeatured,
        isTrending: dto.isTrending,
        publishedAt,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        metaKeywords: dto.metaKeywords,
        categoryId: dto.categoryId,
        categories: categoryIds
          ? { create: categoryIds.map((categoryId) => ({ categoryId })) }
          : undefined,
        tags: dto.tagIds
          ? { create: dto.tagIds.map((tagId) => ({ tagId })) }
          : undefined,
        galleryImages: dto.galleryImages
          ? { create: dto.galleryImages.map((img) => ({ url: img.url, caption: img.caption, order: img.order })) }
          : undefined,
      },
      include: articleInclude,
    });

    return this.formatArticle(article);
  }

  // Soft delete — moves the article to the trash so it can be recovered.
  async remove(id: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('Article not found');
    await this.prisma.article.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }

  async bulkRemove(ids: string[]) {
    const result = await this.prisma.article.updateMany({
      where: { id: { in: ids }, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return { success: true, count: result.count };
  }

  async restore(id: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('Article not found');
    const restored = await this.prisma.article.update({
      where: { id },
      data: { deletedAt: null },
      include: articleInclude,
    });
    return this.formatArticle(restored);
  }

  async bulkRestore(ids: string[]) {
    const result = await this.prisma.article.updateMany({
      where: { id: { in: ids }, deletedAt: { not: null } },
      data: { deletedAt: null },
    });
    return { success: true, count: result.count };
  }

  // Permanently delete — removes the article from the database for good.
  async permanentRemove(id: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('Article not found');
    await this.prisma.article.delete({ where: { id } });
    return { success: true };
  }

  async bulkPermanentRemove(ids: string[]) {
    const result = await this.prisma.article.deleteMany({
      where: { id: { in: ids }, deletedAt: { not: null } },
    });
    return { success: true, count: result.count };
  }

  async emptyTrash() {
    const result = await this.prisma.article.deleteMany({
      where: { deletedAt: { not: null } },
    });
    return { success: true, count: result.count };
  }

  /** Union of the primary category and any extra categories, primary first. */
  private resolveCategoryIds(primaryId: string, extra?: string[]): string[] {
    return Array.from(new Set([primaryId, ...(extra ?? [])])).filter(Boolean);
  }

  private async ensureUniqueSlug(baseSlug: string, excludeId?: string) {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.article.findUnique({ where: { slug } });
      if (!existing || existing.id === excludeId) return slug;
      slug = `${baseSlug}-${counter++}`;
    }
  }

  private formatArticle(article: {
    tags: { tag: { id: string; name: string; slug: string } }[];
    categories?: { category: { id: string; name: string; slug: string; color: string | null } }[];
    [key: string]: unknown;
  }) {
    return {
      ...article,
      tags: article.tags.map((t) => t.tag),
      categories: (article.categories ?? []).map((c) => c.category),
    };
  }
}
