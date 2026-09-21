import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsISO8601,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

/**
 * Site Promo — a single admin-managed popup shown once per browser session
 * on the public site. One row (key "default"), same validated-JSON pattern
 * as Page Headers.
 */

// Relative asset path ("/images/...") or an absolute http(s) URL.
const ASSET_RE = /^(\/|https?:\/\/).+/i;
const HREF_RE = /^(\/|#|https?:\/\/|mailto:|tel:).+/i;

class PromoCtaDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  label!: string;

  @Matches(HREF_RE, { message: 'href must be a path, anchor or URL' })
  @MaxLength(300)
  href!: string;
}

export class SitePromoDto {
  @IsOptional()
  @IsISO8601()
  startAt?: string;

  @IsOptional()
  @IsISO8601()
  endAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  eyebrow?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  badge?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  accentTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  description?: string;

  @IsOptional()
  @Matches(ASSET_RE, { message: 'image must be a path or http(s) URL' })
  @MaxLength(300)
  image?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  imageAlt?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PromoCtaDto)
  primaryCta?: PromoCtaDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PromoCtaDto)
  secondaryCta?: PromoCtaDto;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}

export class PublishSitePromoDto {
  @IsBoolean()
  isPublished!: boolean;
}
