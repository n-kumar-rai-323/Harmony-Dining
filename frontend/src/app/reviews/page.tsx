import type { Metadata } from 'next';

import ReviewsExperience from '@/components/reviews/reviews-experience';
import { getPublishedReviews } from '@/lib/api/reviews';

export const metadata: Metadata = {
  title: 'Reviews',
  description:
    'Read reviews from guests who have dined and celebrated at Harmony Dining & Event Center, and share your own experience.',
  alternates: {
    canonical: '/reviews',
  },
  openGraph: {
    title: 'Reviews | Harmony Dining & Event Center',
    description:
      'Read reviews from guests who have dined and celebrated at Harmony Dining & Event Center, and share your own experience.',
    url: '/reviews',
  },
};

export default async function ReviewsPage() {
  const initial = await getPublishedReviews(1, 12);
  return <ReviewsExperience initial={initial} />;
}
