import type { ReviewItem } from '@/components/home/reviews-showcase.content';
import { apiGet } from './client';
import { env } from '@/lib/env';

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

/* ============================================================
   Public reviews page — list + submission
============================================================ */

export type PublicReview = {
  id: string;
  name: string;
  role: string | null;
  rating: number;
  comment: string;
  createdAt: string;
};

export type PublicReviewPage = {
  items: PublicReview[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

/** One page of approved & published reviews for the /reviews page (server). */
export async function getPublishedReviews(
  page = 1,
  pageSize = 12,
): Promise<PublicReviewPage> {
  const data = await apiGet<PublicReviewPage>(
    `/public/reviews?page=${page}&pageSize=${pageSize}`,
    { revalidate: 120 },
  );
  return (
    data ?? { items: [], total: 0, page, pageSize, pageCount: 1 }
  );
}

export type SubmitReviewInput = {
  name: string;
  rating: number;
  comment: string;
  role?: string;
};

export type SubmitReviewResult =
  | { ok: true; connected: true }
  | { ok: true; connected: false }
  | { ok: false; connected: true; error: string };

/** Submits a guest review. Never throws; lands as PENDING for moderation. */
export async function submitReview(
  payload: SubmitReviewInput,
): Promise<SubmitReviewResult> {
  if (!env.apiUrl) return { ok: true, connected: false };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${env.apiUrl}/public/reviews`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        name: payload.name,
        rating: payload.rating,
        comment: payload.comment,
        ...(payload.role ? { role: payload.role } : {}),
      }),
      signal: controller.signal,
    });

    const body = (await res.json().catch(() => null)) as
      | Record<string, unknown>
      | null;

    if (!res.ok) {
      const message =
        body && typeof body.message === 'string'
          ? body.message
          : Array.isArray(body?.message)
            ? String(body?.message[0])
            : res.status === 429
              ? 'You have submitted a few reviews recently. Please try again later.'
              : 'We could not submit your review. Please try again.';
      return { ok: false, connected: true, error: message };
    }

    return { ok: true, connected: true };
  } catch {
    return { ok: true, connected: false };
  } finally {
    clearTimeout(timer);
  }
}
