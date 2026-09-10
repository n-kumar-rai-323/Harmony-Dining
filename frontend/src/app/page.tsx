import type { Metadata } from 'next';

import AnimatedExperience from '@/components/home/animated-experience';
import DiningExperience from '@/components/home/dining-experience';
import EventsShowcase from '@/components/home/events-showcase';
import FeaturedMenu from '@/components/home/featured-menu';
import GalleryShowcase from '@/components/home/gallery-showcase';
import HeroSection from '@/components/home/hero-section';
import LocationContact from '@/components/home/location-contact';
import ReservationCta from '@/components/home/reservation-cta';
import ReviewsShowcase from '@/components/home/reviews-showcase';
import {
  initialReviewsContent,
  type ReviewsShowcaseContent,
} from '@/components/home/reviews-showcase.content';
import { getMenuCategories } from '@/lib/api/menu';
import { getHomeGalleryItems } from '@/lib/api/gallery';
import { getFeaturedReviews } from '@/lib/api/reviews';
import { getHomepageContent } from '@/lib/api/homepage';

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
  const [menuCategories, galleryItems, featuredReviews, home] =
    await Promise.all([
      getMenuCategories(),
      getHomeGalleryItems(6),
      getFeaturedReviews(7),
      getHomepageContent(),
    ]);

  const galleryPhotos = galleryItems.map((item) => ({
    src: item.image,
    alt: item.alt,
  }));

  // Homepage CMS supplies the reviews section copy; the cards come from the
  // Reviews API, falling back to the showcase's built-in samples.
  const reviewsContent: ReviewsShowcaseContent = {
    ...initialReviewsContent,
    ...(home.reviews ?? {}),
    reviews:
      featuredReviews.length > 0
        ? featuredReviews
        : initialReviewsContent.reviews,
  };

  return (
    <main>
      <HeroSection content={home.hero ?? undefined} />

      <DiningExperience content={home.dining ?? undefined} />

      <AnimatedExperience content={home.animated ?? undefined} />

      <FeaturedMenu menuSource={menuCategories} />

      <EventsShowcase content={home.eventsShowcase ?? undefined} />

      <ReservationCta content={home.reservationCta ?? undefined} />

      <GalleryShowcase photos={galleryPhotos} />

      <ReviewsShowcase content={reviewsContent} />

      <LocationContact content={home.location ?? undefined} />
    </main>
  );
}
