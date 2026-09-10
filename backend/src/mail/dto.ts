import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQuery } from '../common/pagination';

export const MAIL_STATUSES = ['QUEUED', 'SENT', 'FAILED'] as const;

export class MailLogQueryDto extends PaginationQuery {
  @IsOptional()
  @IsIn(MAIL_STATUSES)
  status?: (typeof MAIL_STATUSES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(80)
  template?: string;

  /** Free text over the recipient and subject. */
  @IsOptional()
  @IsString()
  @MaxLength(160)
  search?: string;
}
