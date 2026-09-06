import AnimatedExperience from '@/components/home/animated-experience';
import DiningExperience from '@/components/home/dining-experience';
import EventsShowcase from '@/components/home/events-showcase';
import FeaturedMenu from '@/components/home/featured-menu';
import GalleryShowcase from '@/components/home/gallery-showcase';
import HeroSection from '@/components/home/hero-section';
import LocationContact from '@/components/home/location-contact';
import ReservationCta from '@/components/home/reservation-cta';
import ReviewsShowcase from '@/components/home/reviews-showcase';

export default function Home() {
  return (
    <main>
      <HeroSection />

      <DiningExperience />

      <AnimatedExperience />

      <FeaturedMenu />

      <EventsShowcase />

      <ReservationCta />

      <GalleryShowcase />

      <ReviewsShowcase />

      <LocationContact />
    </main>
  );
}