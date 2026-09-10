import type { Metadata } from 'next';

import AnimatedExperience from '@/components/home/animated-experience';
import DiningExperience from '@/components/home/dining-experience';
import EventsShowcase from '@/components/home/events-showcase';
import FeaturedMenu from '@/components/home/featured-menu';
import GalleryShowcase from '@/components/home/gallery-showcase';
import HeroSection from '@/components/home/hero-section';
import LocationContact from '@/components/home/location-contact';
import ReservationCta from '@/components/home/reservation-cta';
import ReviewsShowcase, {
  initialReviewsContent,
} from '@/components/home/reviews-showcase';
import { getMenuCategories } from '@/lib/api/menu';
import { getHomeGalleryItems } from '@/lib/api/gallery';
import { getFeaturedReviews } from '@/lib/api/reviews';

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
  const [menuCategories, galleryItems, featuredReviews] = await Promise.all([
    getMenuCategories(),
    getHomeGalleryItems(6),
    getFeaturedReviews(7),
  ]);

  const galleryPhotos = galleryItems.map((item) => ({
    src: item.image,
    alt: item.alt,
  }));

  // Use admin-managed reviews when the API returns any; otherwise the showcase
  // falls back to its built-in sample content.
  const reviewsContent =
    featuredReviews.length > 0
      ? { ...initialReviewsContent, reviews: featuredReviews }
      : undefined;

  return (
    <main>
      <HeroSection />

      <DiningExperience />

      <AnimatedExperience />

      <FeaturedMenu menuSource={menuCategories} />

      <EventsShowcase />

      <ReservationCta />

      <GalleryShowcase photos={galleryPhotos} />

      <ReviewsShowcase content={reviewsContent} />

      <LocationContact />
    </main>
  );
}