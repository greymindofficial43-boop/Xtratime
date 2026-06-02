import { Type } from 'class-transformer';
import { IsDate, IsIn, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateMatchDto {
  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsString()
  @MinLength(2)
  sport!: string;

  @IsOptional()
  @IsString()
  league?: string;

  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(1)
  homeTeamName!: string;

  @IsString()
  @MinLength(1)
  homeTeamLogo!: string;

  @IsOptional()
  @IsString()
  homeTeamScore?: string;

  @IsString()
  @MinLength(1)
  awayTeamName!: string;

  @IsString()
  @MinLength(1)
  awayTeamLogo!: string;

  @IsOptional()
  @IsString()
  awayTeamScore?: string;

  @IsString()
  @IsIn(['live', 'upcoming', 'result'])
  status!: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  statusDetail?: string;

  @IsOptional()
  @IsString()
  venue?: string;

  @IsOptional()
  @IsObject()
  details?: Record<string, unknown>;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;
}
