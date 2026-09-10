import { IsBooleanString, IsIn, IsOptional } from 'class-validator';
import { PaginationQuery } from '../common/pagination';

export const NOTIFICATION_TYPES = [
  'RESERVATION_CREATED',
  'RESERVATION_CANCELLED',
  'ENQUIRY_CREATED',
  'REVIEW_CREATED',
  'SYSTEM',
] as const;

export class NotificationQueryDto extends PaginationQuery {
  @IsOptional()
  @IsIn(NOTIFICATION_TYPES)
  type?: (typeof NOTIFICATION_TYPES)[number];

  /** "true" -> only notifications this admin has not read yet. */
  @IsOptional()
  @IsBooleanString()
  unreadOnly?: string;
}
