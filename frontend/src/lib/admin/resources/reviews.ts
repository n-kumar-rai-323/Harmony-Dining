import { adminApi } from '../api';

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type AdminReview = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  role: string | null;
  status: ReviewStatus;
  isPublished: boolean;
  isFeatured: boolean;
  source: 'WEBSITE' | 'IMPORT';
  moderatedById: string | null;
  moderatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  photos: { id: string; url: string }[];
  reply: string | null;
  repliedById: string | null;
  repliedAt: string | null;
};

export const REVIEWS_PATH = '/admin/reviews';

export type AdminCreateReviewInput = {
  name: string;
  rating: number;
  comment: string;
  role?: string;
  approve?: boolean;
  feature?: boolean;
  mediaIds?: string[];
};

export const reviewsApi = {
  create: (body: AdminCreateReviewInput) =>
    adminApi.post<AdminReview>(REVIEWS_PATH, body),
  approve: (id: string) => adminApi.post(`${REVIEWS_PATH}/${id}/approve`),
  reject: (id: string) => adminApi.post(`${REVIEWS_PATH}/${id}/reject`),
  publish: (id: string) => adminApi.post(`${REVIEWS_PATH}/${id}/publish`),
  unpublish: (id: string) => adminApi.post(`${REVIEWS_PATH}/${id}/unpublish`),
  feature: (id: string) => adminApi.post(`${REVIEWS_PATH}/${id}/feature`),
  unfeature: (id: string) => adminApi.post(`${REVIEWS_PATH}/${id}/unfeature`),
  /** Blank/whitespace-only text clears the reply. */
  reply: (id: string, reply: string) =>
    adminApi.post<AdminReview>(`${REVIEWS_PATH}/${id}/reply`, { reply }),
  remove: (id: string) => adminApi.delete(`${REVIEWS_PATH}/${id}`),
};
