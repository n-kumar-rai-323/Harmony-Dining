import type { Metadata } from 'next';

import ReservationExperience from '@/components/reservation/reservation-experience';
import { getPageHeaders } from '@/lib/api/page-headers';

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

export default async function ReservationPage() {
  const { reservation: hero } = await getPageHeaders();
  return <ReservationExperience hero={hero ?? undefined} />;
}
