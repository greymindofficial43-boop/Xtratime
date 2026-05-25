import { AdType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateAdDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsOptional()
  @IsEnum(AdType)
  type?: AdType;

  @IsOptional()
  @IsString()
  partnerName?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  imageUrl?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  targetUrl?: string;

  @IsOptional()
  @IsString()
  googleCode?: string;

  @IsString()
  @MinLength(2)
  slotId!: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
