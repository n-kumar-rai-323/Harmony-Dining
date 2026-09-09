import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ReservationStatus } from '@prisma/client';
import { PaginationQuery } from '../common/pagination';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
// Nepal mobile, same rule the site's yup schema uses.
const PHONE_RE = /^(?:\+977[-\s]?)?(?:96|97|98)\d{8}$/;

export class AvailabilityQueryDto {
  @Matches(DATE_RE, { message: 'date must be YYYY-MM-DD' })
  date!: string;
}

export class CreateReservationDto {
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
  @IsString()
  @MaxLength(200)
  email?: string;

  @Matches(DATE_RE, { message: 'date must be YYYY-MM-DD' })
  date!: string;

  @Matches(TIME_RE, { message: 'time must be HH:mm' })
  time!: string;

  @IsInt()
  @Min(1)
  @Max(500)
  guests!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class UpdateReservationSettingsDto {
  @IsOptional()
  @Matches(TIME_RE)
  openingTime?: string;

  @IsOptional()
  @Matches(TIME_RE)
  closingTime?: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(240)
  slotDurationMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  maxGuestsPerReservation?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100000)
  capacityPerSlot?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(168)
  leadTimeHours?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  maxAdvanceDays?: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;
}

export class DisabledDateDto {
  @Matches(DATE_RE, { message: 'date must be YYYY-MM-DD' })
  date!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;
}

export class ReservationQueryDto extends PaginationQuery {
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

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

export class ReservationStatusDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
