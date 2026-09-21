import type { Metadata } from 'next';

import ReviewsExperience from '@/components/reviews/reviews-experience';
import { getPublishedReviews, getReviewStats } from '@/lib/api/reviews';
import { getPageHeaders } from '@/lib/api/page-headers';

// See frontend/src/app/layout.tsx for why this is forced dynamic.
export const dynamic = 'force-dynamic';

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
  const [initial, stats, { reviews: hero }] = await Promise.all([
    getPublishedReviews(1, 12),
    getReviewStats(),
    getPageHeaders(),
  ]);
  return (
    <ReviewsExperience
      initial={initial}
      initialStats={stats}
      hero={hero ?? undefined}
    />
  );
}
