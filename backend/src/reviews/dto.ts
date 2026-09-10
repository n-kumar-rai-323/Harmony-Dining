import {
  IsBoolean,
  IsEnum,
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

export class ModerateNoteDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(500)
  note?: string;
}
