import type { ReviewItem } from '@/components/home/reviews-showcase.content';
import { apiGet } from './client';

type ApiPublicReview = {
  id: string;
  name: string;
  role: string | null;
  rating: number;
  comment: string;
  createdAt: string;
};

function toShowcaseItem(r: ApiPublicReview): ReviewItem {
  return {
    id: r.id,
    name: r.name,
    occasion: r.role ?? undefined,
    rating: r.rating,
    review: r.comment,
    avatarUrl: null,
  };
}

/**
 * Featured, approved & published reviews for the homepage showcase.
 * Returns an empty array when the API is unavailable — the showcase then
 * falls back to its built-in sample content.
 */
export async function getFeaturedReviews(limit = 7): Promise<ReviewItem[]> {
  const data = await apiGet<ApiPublicReview[]>(
    `/public/reviews/featured?limit=${limit}`,
    { revalidate: 300 },
  );
  if (!data || data.length === 0) return [];
  return data.map(toShowcaseItem);
}
