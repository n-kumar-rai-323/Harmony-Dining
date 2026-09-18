import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
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

/** The public "Get in touch" form — a general message, not tied to a
 * reservation date or event type (see EventEnquiry for those). */
export class CreateContactMessageDto {
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName!: string;

  @Transform(trim)
  @IsEmail()
  @MaxLength(200)
  email!: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(150)
  subject?: string;

  @Transform(trim)
  @IsString()
  @MinLength(4)
  @MaxLength(2000)
  message!: string;
}

export class ContactMessageQueryDto extends PaginationQuery {
  @IsOptional()
  @Transform(boolParam)
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(120)
  search?: string;
}
