import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
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

/**
 * Homepage CMS — one validated JSON blob per section. The keys mirror the
 * `content` props the public home components already accept, minus anything
 * non-serialisable (React icon components are stored as string `iconKey`s and
 * resolved in the UI). The `reviews` section carries copy only; the review
 * cards themselves come from the Reviews module.
 */
export const HOMEPAGE_SECTION_KEYS = [
  'hero',
  'dining',
  'animated',
  'eventsShowcase',
  'reservationCta',
  'reviews',
  'location',
] as const;

export type HomepageSectionKey = (typeof HOMEPAGE_SECTION_KEYS)[number];

// Relative asset path ("/images/...") or an absolute http(s) URL.
const ASSET_RE = /^(\/|https?:\/\/).+/i;
const HREF_RE = /^(\/|#|https?:\/\/|mailto:|tel:).+/i;

class ImageSlideDto {
  @Matches(ASSET_RE, { message: 'src must be a path or http(s) URL' })
  @MaxLength(300)
  src!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  alt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  position?: string;
}

class LinkDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  label!: string;

  @Matches(HREF_RE, { message: 'href must be a path, anchor or URL' })
  @MaxLength(300)
  href!: string;
}

class ToggleLinkDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  label!: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

/* ------------------------------------------------------------------ hero */

class HeroActionDto extends LinkDto {
  @IsOptional()
  @IsIn(['celebration', 'calendar', 'menu'])
  iconKey?: string;

  @IsIn(['primary', 'secondary', 'tertiary'])
  variant!: string;
}

export class HeroSectionDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  eyebrow?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  accentTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  description?: string;

  @Matches(ASSET_RE, { message: 'image must be a path or http(s) URL' })
  @MaxLength(300)
  image!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  imageAlt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  imagePosition?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => ImageSlideDto)
  images?: ImageSlideDto[];

  @IsOptional()
  @IsString()
  @MaxLength(80)
  imageLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  imageCaption?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @ValidateNested({ each: true })
  @Type(() => HeroActionDto)
  actions?: HeroActionDto[];
}

/* --------------------------------------------------------------- dining */

class DiningDetailDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  subtitle?: string;

  @IsOptional()
  @IsIn(['restaurant'])
  iconKey?: string;
}

export class DiningSectionDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  eyebrow?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  description?: string;

  @Matches(ASSET_RE, { message: 'image must be a path or http(s) URL' })
  @MaxLength(300)
  image!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  imageAlt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  imagePosition?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => ImageSlideDto)
  images?: ImageSlideDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => DiningDetailDto)
  detail?: DiningDetailDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LinkDto)
  cta?: LinkDto;
}

/* ------------------------------------------------------------ animated */

class ExperienceStoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  eyebrow?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  description?: string;

  @Matches(ASSET_RE, { message: 'image must be a path or http(s) URL' })
  @MaxLength(300)
  image!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  imageAlt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  imagePosition?: string;
}

export class AnimatedSectionDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  eyebrow?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  description?: string;

  @IsArray()
  @ArrayMaxSize(8)
  @ValidateNested({ each: true })
  @Type(() => ExperienceStoryDto)
  stories!: ExperienceStoryDto[];
}

/* ------------------------------------------------------ eventsShowcase */

class EventFeatureDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  id!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @IsIn(['celebration', 'groups', 'restaurant', 'tune'])
  iconKey!: string;
}

export class EventsSectionDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  eyebrow?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  accentTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  closingTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  description?: string;

  @Matches(ASSET_RE, { message: 'image must be a path or http(s) URL' })
  @MaxLength(300)
  image!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  imageAlt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  imagePosition?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  imageLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  imageMeta?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @MaxLength(60, { each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @ValidateNested({ each: true })
  @Type(() => EventFeatureDto)
  features?: EventFeatureDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => LinkDto)
  primaryCta?: LinkDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LinkDto)
  secondaryCta?: LinkDto;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  supportingNote?: string;
}

/* --------------------------------------------------- reservationCta */

const RESERVATION_ICON_KEYS = [
  'calendar',
  'celebration',
  'clock',
  'groups',
  'restaurant',
] as const;

class ReservationBadgeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  id!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  label!: string;

  @IsIn(RESERVATION_ICON_KEYS)
  iconKey!: string;
}

class ReservationCardCtaDto extends LinkDto {
  @IsIn(['contained', 'outlined'])
  variant!: string;
}

class ReservationActionCardDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  id!: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  eyebrow?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  description?: string;

  @IsIn(RESERVATION_ICON_KEYS)
  iconKey!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @ValidateNested({ each: true })
  @Type(() => ReservationBadgeDto)
  badges?: ReservationBadgeDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ReservationCardCtaDto)
  cta?: ReservationCardCtaDto;
}

export class ReservationCtaSectionDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  eyebrow?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  accentTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @ValidateNested({ each: true })
  @Type(() => ReservationActionCardDto)
  cards?: ReservationActionCardDto[];

  @IsOptional()
  @IsString()
  @MaxLength(400)
  supportingNote?: string;
}

/* ------------------------------------------------------------ reviews */

// Copy only — the review cards are served by the Reviews module.
export class ReviewsSectionDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  eyebrow?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  accentTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  footerText?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LinkDto)
  cta?: LinkDto;
}

/* ----------------------------------------------------------- location */

class LocationDataDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  id!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  address!: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  openingHours?: string | null;
}

class NearbyPlaceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  id!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(60)
  shortName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(60)
  category!: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;
}

export class LocationSectionDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  eyebrow?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  accentTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  description?: string;

  @ValidateNested()
  @Type(() => LocationDataDto)
  location!: LocationDataDto;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => NearbyPlaceDto)
  nearbyPlaces?: NearbyPlaceDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ToggleLinkDto)
  directionsCta?: ToggleLinkDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ToggleLinkDto)
  mapCta?: ToggleLinkDto;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  helperText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  estimateNote?: string;
}

/* ------------------------------------------------------------- shared */

export class PublishSectionDto {
  @IsBoolean()
  isPublished!: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Ctor = new () => any;

export const SECTION_DTO: Record<HomepageSectionKey, Ctor> = {
  hero: HeroSectionDto,
  dining: DiningSectionDto,
  animated: AnimatedSectionDto,
  eventsShowcase: EventsSectionDto,
  reservationCta: ReservationCtaSectionDto,
  reviews: ReviewsSectionDto,
  location: LocationSectionDto,
};
