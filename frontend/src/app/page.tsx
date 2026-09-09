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
import { getMenuCategories } from '@/lib/api/menu';

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
  const menuCategories = await getMenuCategories();

  return (
    <main>
      <HeroSection />

      <DiningExperience />

      <AnimatedExperience />

      <FeaturedMenu menuSource={menuCategories} />

      <EventsShowcase />

      <ReservationCta />

      <GalleryShowcase />

      <ReviewsShowcase />

      <LocationContact />
    </main>
  );
}