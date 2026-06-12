import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ArticleStatus, ArticleType } from '@prisma/client';

export class GalleryImageDto {
  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsInt()
  order!: number;
}

export class CreateArticleDto {
  @IsString()
  @MinLength(5)
  title!: string;

  @IsOptional()
  @IsEnum(ArticleType)
  type?: ArticleType;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GalleryImageDto)
  galleryImages?: GalleryImageDto[];

  @IsOptional()
  @IsString()
  featuredImage?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  // ISO datetime; when set, overrides the auto "now" publish timestamp.
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  // SEO meta (per-post). Empty = fall back to title/excerpt on the site.
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  metaKeywords?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isTrending?: boolean;

  // Primary category — drives the article URL.
  @IsString()
  categoryId!: string;

  // Full set of categories (incl. the primary). When omitted, only the
  // primary category is linked.
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];
}
