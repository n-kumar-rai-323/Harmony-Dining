import { adminApi } from '../api';
import type { Paginated } from '../types';

export const EVENTS_PATH = '/admin/events';

export type PublishStatus = 'DRAFT' | 'PUBLISHED';
export type EventLifecycle = 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
export const LIFECYCLES: EventLifecycle[] = ['UPCOMING', 'COMPLETED', 'CANCELLED'];

export type EventMediaRow = {
  id: string;
  mediaId: string;
  type: 'IMAGE' | 'VIDEO';
  posterMediaId: string | null;
  altText: string;
  sortOrder: number;
  media: { id: string; url: string; mimeType?: string };
};

export type AdminEvent = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string | null;
  eventDate: string;
  startTime: string | null;
  endTime: string | null;
  guestsLabel: string | null;
  coverMediaId: string | null;
  status: PublishStatus;
  lifecycle: EventLifecycle;
  coverMedia: { id: string; url: string } | null;
  media: EventMediaRow[];
};

export type EventMediaInput = {
  id?: string;
  mediaId: string;
  type: 'IMAGE' | 'VIDEO';
  altText: string;
  sortOrder?: number;
};

export type EventInput = {
  title: string;
  category: string;
  summary: string;
  description?: string;
  eventDate: string;
  startTime?: string | null;
  endTime?: string | null;
  guestsLabel?: string | null;
  coverMediaId?: string | null;
  lifecycle?: EventLifecycle;
  media?: EventMediaInput[];
};

export const eventsApi = {
  list: (params: string) =>
    adminApi.get<Paginated<AdminEvent>>(`${EVENTS_PATH}${params}`),
  get: (id: string) => adminApi.get<AdminEvent>(`${EVENTS_PATH}/${id}`),
  create: (body: EventInput) => adminApi.post<AdminEvent>(EVENTS_PATH, body),
  update: (id: string, body: Partial<EventInput>) =>
    adminApi.patch<AdminEvent>(`${EVENTS_PATH}/${id}`, body),
  setPublished: (id: string, published: boolean) =>
    adminApi.post(`${EVENTS_PATH}/${id}/${published ? 'publish' : 'unpublish'}`),
  setLifecycle: (id: string, value: EventLifecycle) =>
    adminApi.post(`${EVENTS_PATH}/${id}/lifecycle/${value}`),
  remove: (id: string) => adminApi.delete(`${EVENTS_PATH}/${id}`),
};

export function toMediaInput(rows: EventMediaRow[]): EventMediaInput[] {
  return rows.map((r, i) => ({
    id: r.id,
    mediaId: r.mediaId,
    type: r.type,
    altText: r.altText,
    sortOrder: i,
  }));
}
