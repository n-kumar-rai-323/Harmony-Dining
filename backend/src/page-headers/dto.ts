import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

/**
 * Page Headers CMS — one validated JSON blob per public page's hero/banner.
 * Every page shares the same shape; fields a given page doesn't use (e.g.
 * `image` on the Contact heading, `badges` on anything but Menu) are simply
 * left empty and the component falls back to its own default.
 */
export const PAGE_HEADER_KEYS = [
  'about',
  'contact',
  'events',
  'gallery',
  'menu',
  'reservation',
  'reviews',
] as const;

export type PageHeaderKey = (typeof PAGE_HEADER_KEYS)[number];

// Relative asset path ("/images/...") or an absolute http(s) URL.
const ASSET_RE = /^(\/|https?:\/\/).+/i;
const HREF_RE = /^(\/|#|https?:\/\/|mailto:|tel:).+/i;

class PageHeaderBadgeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  label!: string;
}

class PageHeaderCtaDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  label!: string;

  @Matches(HREF_RE, { message: 'href must be a path, anchor or URL' })
  @MaxLength(300)
  href!: string;
}

export class PageHeaderDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  eyebrow?: string;

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
  @IsArray()
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => PageHeaderBadgeDto)
  badges?: PageHeaderBadgeDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PageHeaderCtaDto)
  primaryCta?: PageHeaderCtaDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PageHeaderCtaDto)
  secondaryCta?: PageHeaderCtaDto;
}

export class PublishPageHeaderDto {
  @IsBoolean()
  isPublished!: boolean;
}
