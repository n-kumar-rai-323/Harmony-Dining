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
  photos: { id: string; url: string }[];
};

function toShowcaseItem(r: ApiPublicReview): ReviewItem {
  return {
    id: r.id,
    name: r.name,
    occasion: r.role ?? undefined,
    rating: r.rating,
    review: r.comment,
    // The guest's own uploaded photo, if any — the Avatar component falls
    // back to initials automatically when this is null. A guest can upload
    // up to 3; only the first is shown, photoCount lets the UI hint there
    // are more.
    avatarUrl: r.photos[0]?.url ?? null,
    photoCount: r.photos.length,
    createdAt: r.createdAt,
  };
}

/**
 * Featured, approved & published reviews for the homepage showcase.
 * Returns an empty array when the API is unavailable — the showcase then
 * falls back to its built-in sample content.
 */
export async function getFeaturedReviews(limit = 50): Promise<ReviewItem[]> {
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

export type ReviewPhoto = { id: string; url: string };

export type PublicReview = {
  id: string;
  name: string;
  role: string | null;
  rating: number;
  comment: string;
  createdAt: string;
  photos: ReviewPhoto[];
  reply: string | null;
  repliedAt: string | null;
};

export type PublicReviewPage = {
  items: PublicReview[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type PublicReviewSort = 'recent' | 'highest' | 'lowest';

export type PublicReviewStats = {
  total: number;
  average: number;
  breakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  topRoles: string[];
};

/** One page of approved & published reviews for the /reviews page (server or client). */
export async function getPublishedReviews(
  page = 1,
  pageSize = 12,
  opts: { role?: string; sort?: PublicReviewSort } = {},
): Promise<PublicReviewPage> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (opts.role) params.set('role', opts.role);
  if (opts.sort) params.set('sort', opts.sort);
  const data = await apiGet<PublicReviewPage>(
    `/public/reviews?${params.toString()}`,
    { revalidate: 120 },
  );
  return (
    data ?? { items: [], total: 0, page, pageSize, pageCount: 1 }
  );
}

/** Rating breakdown + top occasion labels for the /reviews summary card. */
export async function getReviewStats(): Promise<PublicReviewStats> {
  const data = await apiGet<PublicReviewStats>('/public/reviews/stats', {
    revalidate: 120,
  });
  return (
    data ?? { total: 0, average: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, topRoles: [] }
  );
}

export type SubmitReviewInput = {
  name: string;
  rating: number;
  comment: string;
  role?: string;
  mediaIds?: string[];
};

export type SubmitReviewResult =
  | { ok: true; connected: true }
  | { ok: true; connected: false }
  | { ok: false; connected: true; error: string };

/** Uploads one guest photo for an in-progress review submission. */
export async function uploadReviewPhoto(file: File): Promise<ReviewPhoto> {
  if (!env.apiUrl) throw new Error('The API is not configured.');

  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${env.apiUrl}/public/reviews/photos`, {
    method: 'POST',
    body: form,
  });

  const body = (await res.json().catch(() => null)) as
    | { id?: string; url?: string; message?: string | string[] }
    | null;

  if (!res.ok || !body?.id || !body.url) {
    const message = Array.isArray(body?.message)
      ? body.message[0]
      : (body?.message ?? 'Could not upload that photo.');
    throw new Error(message);
  }

  return { id: body.id, url: body.url };
}

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
        ...(payload.mediaIds && payload.mediaIds.length > 0
          ? { mediaIds: payload.mediaIds }
          : {}),
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
