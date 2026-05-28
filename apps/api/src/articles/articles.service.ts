import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ArticleStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/slug.util';
import { CreateArticleDto } from './dto/create-article.dto';
import { QueryArticlesDto } from './dto/query-articles.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

const articleInclude = {
  author: { select: { id: true, name: true, email: true } },
  category: { select: { id: true, name: true, slug: true, color: true } },
  tags: { include: { tag: true } },
} satisfies Prisma.ArticleInclude;

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryArticlesDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;

    const where: Prisma.ArticleWhereInput = {};

    if (query.status) {
      where.status = query.status;
    } else if (!query.allStatuses && !query.search) {
      where.status = ArticleStatus.PUBLISHED;
    }

    if (query.category) {
      where.category = { slug: query.category };
    }

    if (query.tag) {
      where.tags = { some: { tag: { slug: query.tag } } };
    }

    if (query.featured) where.isFeatured = true;
    if (query.trending) where.isTrending = true;

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { excerpt: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];
    }

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
    const article = await this.prisma.article.findUnique({
      where: { slug },
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
    const slug = await this.ensureUniqueSlug(dto.slug ?? slugify(dto.title));
    const publishedAt =
      dto.status === ArticleStatus.PUBLISHED ? new Date() : null;

    const article = await this.prisma.article.create({
      data: {
        title: dto.title,
        slug,
        excerpt: dto.excerpt,
        content: dto.content,
        featuredImage: dto.featuredImage,
        videoUrl: dto.videoUrl,
        status: dto.status ?? ArticleStatus.DRAFT,
        isFeatured: dto.isFeatured ?? false,
        isTrending: dto.isTrending ?? false,
        publishedAt,
        authorId,
        categoryId: dto.categoryId,
        tags: dto.tagIds?.length
          ? {
              create: dto.tagIds.map((tagId) => ({ tagId })),
            }
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
      slug = await this.ensureUniqueSlug(dto.slug, id);
    } else if (dto.title) {
      slug = await this.ensureUniqueSlug(slugify(dto.title), id);
    }

    let publishedAt = existing.publishedAt;
    if (dto.status === ArticleStatus.PUBLISHED && !existing.publishedAt) {
      publishedAt = new Date();
    }

    if (dto.tagIds) {
      await this.prisma.articleTag.deleteMany({ where: { articleId: id } });
    }

    const article = await this.prisma.article.update({
      where: { id },
      data: {
        title: dto.title,
        slug,
        excerpt: dto.excerpt,
        content: dto.content,
        featuredImage: dto.featuredImage,
        videoUrl: dto.videoUrl,
        status: dto.status,
        isFeatured: dto.isFeatured,
        isTrending: dto.isTrending,
        publishedAt,
        categoryId: dto.categoryId,
        tags: dto.tagIds
          ? { create: dto.tagIds.map((tagId) => ({ tagId })) }
          : undefined,
      },
      include: articleInclude,
    });

    return this.formatArticle(article);
  }

  async remove(id: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('Article not found');
    await this.prisma.article.delete({ where: { id } });
    return { success: true };
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
    [key: string]: unknown;
  }) {
    return {
      ...article,
      tags: article.tags.map((t) => t.tag),
    };
  }
}
