import { IsBoolean, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  showInNav?: boolean;

  @IsOptional()
  @IsInt()
  navOrder?: number;

  @IsOptional()
  @IsBoolean()
  showOnHomepage?: boolean;

  @IsOptional()
  @IsInt()
  homepageOrder?: number;

  @IsOptional()
  @IsString()
  parentId?: string;
}
