import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreatePopupAdDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  @MinLength(1)
  imageUrl!: string;

  @IsString()
  @MinLength(1)
  linkUrl!: string;

  @IsOptional()
  @IsBoolean()
  openInNewTab?: boolean;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  // ISO datetime strings. Omit/empty to leave that bound open.
  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
