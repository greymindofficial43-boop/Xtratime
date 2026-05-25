import { Type } from 'class-transformer';
import { IsDate, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateMatchDto {
  @IsString()
  @MinLength(2)
  sport!: string;

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
  @Type(() => Date)
  @IsDate()
  date?: Date;
}
