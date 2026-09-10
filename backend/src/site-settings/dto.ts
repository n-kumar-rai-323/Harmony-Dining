import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

// The three structured, singleton settings groups managed here. The CMS-style
// blobs (footer / promo / reservationCta) are handled by the homepage CMS.
export const SITE_SETTING_KEYS = ['business', 'hours', 'social'] as const;
export type SiteSettingKey = (typeof SITE_SETTING_KEYS)[number];

export const SOCIAL_PLATFORMS = [
  'facebook',
  'instagram',
  'tiktok',
  'youtube',
  'x',
  'linkedin',
] as const;

const HREF_RE = /^https?:\/\/.+/i;
const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export class BusinessDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsString()
  @MaxLength(40)
  phone!: string;

  @IsString()
  @MaxLength(160)
  email!: string;

  @IsArray()
  @ArrayMaxSize(6)
  @IsString({ each: true })
  @MaxLength(160, { each: true })
  addressLines!: string[];

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @IsString()
  @MaxLength(300)
  mapHref!: string;
}

export class HoursEntryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  label!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  value!: string;
}

export class UpdateHoursDto {
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => HoursEntryDto)
  entries!: HoursEntryDto[];
}

export class SocialLinkDto {
  @IsIn(SOCIAL_PLATFORMS)
  platform!: (typeof SOCIAL_PLATFORMS)[number];

  @IsString()
  @MinLength(1)
  @MaxLength(40)
  label!: string;

  @Matches(HREF_RE, { message: 'href must be an http(s) URL' })
  @MaxLength(300)
  href!: string;

  @IsOptional()
  @Matches(HEX_RE, { message: 'brandColor must be a hex colour' })
  brandColor?: string;
}

export class UpdateSocialDto {
  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  links!: SocialLinkDto[];
}
