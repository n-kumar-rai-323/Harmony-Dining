import type { Metadata } from 'next';

import AnimatedExperience from '@/components/home/animated-experience';
import DiningExperience from '@/components/home/dining-experience';
import EventsShowcase from '@/components/home/events-showcase';
import FeaturedMenu from '@/components/home/featured-menu';
import GalleryShowcase from '@/components/home/gallery-showcase';
import HeroSection from '@/components/home/hero-section';
import LocationContact from '@/components/home/location-contact';
import ReservationCta from '@/components/home/reservation-cta';
import GuestbookCarousel from '@/components/home/guestbook-carousel';
import {
  initialReviewsContent,
  type ReviewsShowcaseContent,
} from '@/components/home/reviews-showcase.content';
import { getMenuCategories } from '@/lib/api/menu';
import { getHomeGalleryItems } from '@/lib/api/gallery';
import { getFeaturedReviews } from '@/lib/api/reviews';
import { getHomepageContent } from '@/lib/api/homepage';
import { getSiteSettings } from '@/lib/api/site';

// See frontend/src/app/layout.tsx for why this is forced dynamic.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  description:
    'Harmony Dining & Event Center — premium dining, private events and celebrations. Explore the menu, browse the gallery and reserve your table.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Harmony Dining & Event Center',
    description:
      'Premium dining, private events and celebrations at Harmony Dining & Event Center.',
    url: '/',
  },
};

export default async function Home() {
  const [menuCategories, galleryItems, featuredReviews, home, siteSettings] =
    await Promise.all([
      getMenuCategories(),
      getHomeGalleryItems(6),
      getFeaturedReviews(50),
      getHomepageContent(),
      getSiteSettings(),
    ]);

  const galleryPhotos = galleryItems.map((item) => ({
    src: item.image,
    alt: item.alt,
  }));

  // Homepage CMS supplies the reviews section copy; the cards always come
  // from the real Reviews API. Never substitute the built-in sample
  // reviews here — they'd be indistinguishable from real guest
  // testimonials. If there are zero real featured reviews yet,
  // GuestbookCarousel renders nothing until the first one is approved.
  const reviewsContent: ReviewsShowcaseContent = {
    ...initialReviewsContent,
    ...(home.reviews ?? {}),
    reviews: featuredReviews,
  };

  // The homepage "Location" card has its own opening-hours text field, kept
  // separate from Site Settings' hours (different card, admin can phrase it
  // differently). But if an admin only ever filled in Site Settings — the
  // more obvious place to put business hours — the location card shouldn't
  // show a "not set up yet" placeholder when real hours already exist.
  const siteHoursText =
    siteSettings.contact.hours.length > 0
      ? siteSettings.contact.hours.map((h) => `${h.label}: ${h.value}`).join(' · ')
      : undefined;

  const locationContent = home.location
    ? {
        ...home.location,
        location: {
          ...home.location.location,
          openingHours: home.location.location.openingHours || siteHoursText,
        },
      }
    : undefined;

  return (
    <main>
      <HeroSection content={home.hero ?? undefined} />

      <DiningExperience content={home.dining ?? undefined} />

      <AnimatedExperience content={home.animated ?? undefined} />

      <FeaturedMenu menuSource={menuCategories} />

      <EventsShowcase content={home.eventsShowcase ?? undefined} />

      <ReservationCta content={home.reservationCta ?? undefined} />

      <GalleryShowcase photos={galleryPhotos} />

      <GuestbookCarousel content={reviewsContent} />

      <LocationContact content={locationContent} />
    </main>
  );
}
