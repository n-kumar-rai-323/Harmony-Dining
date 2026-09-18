import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { EnquiryStatus } from '@prisma/client';
import { PaginationQuery } from '../common/pagination';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
// Nepal mobile, same rule the site's yup schema uses.
const PHONE_RE = /^(?:\+977[-\s]?)?(?:96|97|98)\d{8}$/;

export class CreateEventEnquiryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName!: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\s+/g, '') : value,
  )
  @Matches(PHONE_RE, { message: 'Enter a valid Nepal mobile number' })
  phone!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  eventType!: string;

  @Matches(DATE_RE, { message: 'preferredDate must be YYYY-MM-DD' })
  preferredDate!: string;

  @IsOptional()
  @Matches(DATE_RE, { message: 'alternativeDate must be YYYY-MM-DD' })
  alternativeDate?: string;

  @IsOptional()
  @Matches(TIME_RE, { message: 'startTime must be HH:mm' })
  startTime?: string;

  @IsOptional()
  @Matches(TIME_RE, { message: 'endTime must be HH:mm' })
  endTime?: string;

  @IsInt()
  @Min(1)
  @Max(5000)
  guests!: number;

  // Decimal in the DB; accepted as a numeric string to avoid float drift.
  @IsOptional()
  @IsNumberString({ no_symbols: false })
  budget?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  requirements?: string;
}

export class EnquiryQueryDto extends PaginationQuery {
  @IsOptional()
  @IsEnum(EnquiryStatus)
  status?: EnquiryStatus;

  @IsOptional()
  @Matches(DATE_RE)
  from?: string;

  @IsOptional()
  @Matches(DATE_RE)
  to?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}

export class EnquiryStatusDto {
  @IsEnum(EnquiryStatus)
  status!: EnquiryStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class EnquiryConflictQueryDto {
  @Matches(DATE_RE, { message: 'date must be YYYY-MM-DD' })
  date!: string;
}
