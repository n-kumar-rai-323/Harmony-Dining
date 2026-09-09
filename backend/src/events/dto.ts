import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventLifecycle, EventMediaType, PublishStatus } from '@prisma/client';
import { PaginationQuery } from '../common/pagination';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export class EventMediaInputDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  mediaId!: string;

  @IsEnum(EventMediaType)
  type!: EventMediaType;

  @IsOptional()
  @IsString()
  posterMediaId?: string | null;

  @IsString()
  @MinLength(2)
  @MaxLength(300)
  altText!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class CreateEventDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  category!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(500)
  summary!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsDateString()
  eventDate!: string;

  @IsOptional()
  @Matches(TIME_RE, { message: 'startTime must be HH:mm' })
  startTime?: string;

  @IsOptional()
  @Matches(TIME_RE, { message: 'endTime must be HH:mm' })
  endTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  guestsLabel?: string;

  @IsOptional()
  @IsString()
  coverMediaId?: string | null;

  @IsOptional()
  @IsEnum(EventLifecycle)
  lifecycle?: EventLifecycle;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(60)
  @ValidateNested({ each: true })
  @Type(() => EventMediaInputDto)
  media?: EventMediaInputDto[];
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  category?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(500)
  summary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsDateString()
  eventDate?: string;

  @IsOptional()
  @Matches(TIME_RE, { message: 'startTime must be HH:mm' })
  startTime?: string | null;

  @IsOptional()
  @Matches(TIME_RE, { message: 'endTime must be HH:mm' })
  endTime?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  guestsLabel?: string | null;

  @IsOptional()
  @IsString()
  coverMediaId?: string | null;

  @IsOptional()
  @IsEnum(EventLifecycle)
  lifecycle?: EventLifecycle;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(60)
  @ValidateNested({ each: true })
  @Type(() => EventMediaInputDto)
  media?: EventMediaInputDto[];
}

export class EventQueryDto extends PaginationQuery {
  @IsOptional()
  @IsEnum(PublishStatus)
  status?: PublishStatus;

  @IsOptional()
  @IsEnum(EventLifecycle)
  lifecycle?: EventLifecycle;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
