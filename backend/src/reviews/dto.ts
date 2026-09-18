import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ReviewStatus } from '@prisma/client';
import { PaginationQuery } from '../common/pagination';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

// Query-string booleans: "true"/"1" -> true, "false"/"0" -> false, else undefined.
const boolParam = ({ value }: { value: unknown }) => {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return undefined;
};

/** Public submission — always lands as PENDING, never trusted for status. */
export class CreateReviewDto {
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @Transform(trim)
  @IsString()
  @MinLength(4)
  @MaxLength(1500)
  comment!: string;

  /** Optional "Birthday guest" style label. */
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(80)
  role?: string;

  /** Media ids from POST /public/reviews/photos, up to 3. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @IsString({ each: true })
  mediaIds?: string[];
}

/** Admin-entered review (e.g. copied from Google/Facebook). */
export class AdminCreateReviewDto extends CreateReviewDto {
  /** Pre-approve and publish in one step. Defaults to false (stays PENDING). */
  @IsOptional()
  @IsBoolean()
  approve?: boolean;

  @IsOptional()
  @IsBoolean()
  feature?: boolean;
}

export class ReviewQueryDto extends PaginationQuery {
  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;

  @IsOptional()
  @Transform(boolParam)
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @Transform(boolParam)
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(120)
  search?: string;
}

export const PUBLIC_REVIEW_SORTS = ['recent', 'highest', 'lowest'] as const;
export type PublicReviewSort = (typeof PUBLIC_REVIEW_SORTS)[number];

/** Filters for the public /reviews page list. */
export class PublicReviewQueryDto extends PaginationQuery {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(80)
  role?: string;

  @IsOptional()
  @IsIn(PUBLIC_REVIEW_SORTS)
  sort?: PublicReviewSort;
}

export class ModerateNoteDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(500)
  note?: string;
}

/** Admin's public reply to a review. An empty/blank reply clears it. */
export class ReplyToReviewDto {
  @Transform(trim)
  @IsString()
  @MaxLength(1000)
  reply!: string;
}
