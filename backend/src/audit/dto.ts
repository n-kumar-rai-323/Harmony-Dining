import { IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQuery } from '../common/pagination';

/** Filters for GET /admin/audit. All optional; combine with AND. */
export class AuditQueryDto extends PaginationQuery {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  actorId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  actorEmail?: string;

  /** Exact action, e.g. "menu_item.update". */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  action?: string;

  /** Action prefix, e.g. "menu_" or "homepage_section.". */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  actionPrefix?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  entityType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  entityId?: string;

  /** Inclusive lower bound on createdAt (ISO-8601). */
  @IsOptional()
  @IsISO8601()
  from?: string;

  /** Exclusive upper bound on createdAt (ISO-8601). */
  @IsOptional()
  @IsISO8601()
  to?: string;

  /** Free text over action / entityType / entityId / actorEmail. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
