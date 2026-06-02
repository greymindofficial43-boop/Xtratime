import { MenuItemPlacement, MenuItemType } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  href?: string;

  @IsOptional()
  @IsEnum(MenuItemType)
  type?: MenuItemType;

  @IsOptional()
  @IsEnum(MenuItemPlacement)
  placement?: MenuItemPlacement;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  badge?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  groupName?: string;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsBoolean()
  opensInNewTab?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}
