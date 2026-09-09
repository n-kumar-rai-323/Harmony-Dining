import type { Metadata } from 'next';

import ReservationExperience from '@/components/reservation/reservation-experience';

export const metadata: Metadata = {
  title: 'Reserve a Table',
  description:
    'Request a table at Harmony Dining & Event Center. Choose your date, time and party size and our team will confirm availability with you.',
  alternates: {
    canonical: '/reservation',
  },
  openGraph: {
    title: 'Reserve a Table | Harmony Dining & Event Center',
    description:
      'Request a table at Harmony Dining & Event Center. Choose your date, time and party size and our team will confirm availability with you.',
    url: '/reservation',
  },
};

export default function ReservationPage() {
  return <ReservationExperience />;
}
