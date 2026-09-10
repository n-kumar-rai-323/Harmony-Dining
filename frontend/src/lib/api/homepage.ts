import type { HeroContent } from '@/components/home/hero-section';
import type { DiningExperienceContent } from '@/components/home/dining-experience';
import type { AnimatedExperienceContent } from '@/components/home/animated-experience';
import type { EventsShowcaseData } from '@/components/home/events-showcase';
import type { ReservationCtaContent } from '@/components/home/reservation-cta';
import type { ReviewsShowcaseContent } from '@/components/home/reviews-showcase.content';
import type { LocationContactContent } from '@/components/home/location-contact';
import { apiGet } from './client';

/**
 * Admin-managed homepage content from GET /api/public/homepage.
 *
 * Every section is nullable: the API returns `null` for a section that has no
 * saved content or has been unpublished, and each home component already ships
 * with its own default `content`, so callers pass `section ?? undefined` and
 * the component falls back on its own.
 *
 * The `reviews` section carries copy only — the review cards come from the
 * Reviews API and are merged in by the page.
 */
export type HomepageReviewsCopy = Omit<ReviewsShowcaseContent, 'reviews'>;

export type HomepageContent = {
  hero: HeroContent | null;
  dining: DiningExperienceContent | null;
  animated: AnimatedExperienceContent | null;
  eventsShowcase: EventsShowcaseData | null;
  reservationCta: ReservationCtaContent | null;
  reviews: HomepageReviewsCopy | null;
  location: LocationContactContent | null;
};

const EMPTY: HomepageContent = {
  hero: null,
  dining: null,
  animated: null,
  eventsShowcase: null,
  reservationCta: null,
  reviews: null,
  location: null,
};

type RawBundle = Partial<Record<keyof HomepageContent, unknown>>;

function section<T>(value: unknown): T | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  // Every homepage section requires a non-empty `title`; anything else is
  // treated as unusable and the component keeps its built-in default.
  const title = (value as { title?: unknown }).title;
  if (typeof title !== 'string' || title.trim().length === 0) return null;
  return value as T;
}

export async function getHomepageContent(): Promise<HomepageContent> {
  const data = await apiGet<RawBundle>('/public/homepage', { revalidate: 300 });
  if (!data) return EMPTY;

  return {
    hero: section<HeroContent>(data.hero),
    dining: section<DiningExperienceContent>(data.dining),
    animated: section<AnimatedExperienceContent>(data.animated),
    eventsShowcase: section<EventsShowcaseData>(data.eventsShowcase),
    reservationCta: section<ReservationCtaContent>(data.reservationCta),
    reviews: section<HomepageReviewsCopy>(data.reviews),
    location: section<LocationContactContent>(data.location),
  };
}
