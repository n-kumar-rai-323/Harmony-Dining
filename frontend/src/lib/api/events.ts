import {
  getPastEvents as localPastEvents,
  getPastEventBySlug as localPastEventBySlug,
  getPastEventSlugs as localPastEventSlugs,
  type PastEvent,
  type PastEventMedia,
} from '@/data/past-events';
import { apiGet } from './client';

type ApiEventMedia = {
  type: 'image' | 'video';
  src: string;
  poster?: string;
  alt: string;
};

type ApiEventSummary = {
  slug: string;
  title: string;
  category: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  guests: string | null;
  summary: string;
  cover: ApiEventMedia | null;
};

export type UpcomingEvent = {
  slug: string;
  title: string;
  category: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  guests: string | null;
  summary: string;
};

type ApiEventDetail = ApiEventSummary & {
  description: string | null;
  media: ApiEventMedia[];
};

function toMedia(m: ApiEventMedia): PastEventMedia {
  return m.type === 'video'
    ? {
        type: 'video',
        src: m.src,
        poster: m.poster ?? m.src,
        alt: m.alt,
      }
    : { type: 'image', src: m.src, alt: m.alt };
}

function toPastEvent(e: ApiEventDetail): PastEvent {
  const cover: PastEventMedia = e.cover
    ? toMedia(e.cover)
    : e.media[0]
      ? toMedia(e.media[0])
      : {
          type: 'image',
          src: '/images/home/harmony-experience-event.jpg',
          alt: e.title,
        };
  return {
    slug: e.slug,
    title: e.title,
    category: e.category,
    date: e.date,
    guests: e.guests ?? undefined,
    summary: e.summary,
    cover,
    media: e.media.map(toMedia),
  };
}

/**
 * Past-events card list for /events. Falls back to bundled data only when
 * the API itself is unreachable — a real "no past events yet" response is
 * shown as-is, not papered over with dummy content.
 */
export async function getPastEventsList(): Promise<PastEvent[]> {
  const data = await apiGet<ApiEventSummary[]>(
    '/public/events?type=past',
    { revalidate: 300 },
  );
  if (!data) return localPastEvents();
  // The list endpoint has no `media[]`; hydrate cover only for the cards.
  return data.map((e) => ({
    slug: e.slug,
    title: e.title,
    category: e.category,
    date: e.date,
    guests: e.guests ?? undefined,
    summary: e.summary,
    cover: e.cover
      ? toMedia(e.cover)
      : {
          type: 'image' as const,
          src: '/images/home/harmony-experience-event.jpg',
          alt: e.title,
        },
    media: [],
  }));
}

/**
 * Upcoming-events list for /events. There's no bundled fallback for
 * upcoming events (unlike past events) — if the API is unreachable, the
 * section is simply omitted rather than showing fabricated dates.
 */
export async function getUpcomingEventsList(): Promise<UpcomingEvent[]> {
  const data = await apiGet<ApiEventSummary[]>(
    '/public/events?type=upcoming',
    { revalidate: 300 },
  );
  if (!data) return [];
  return data.map((e) => ({
    slug: e.slug,
    title: e.title,
    category: e.category,
    date: e.date,
    startTime: e.startTime,
    endTime: e.endTime,
    guests: e.guests,
    summary: e.summary,
  }));
}

/** Slugs for generateStaticParams. Falls back to bundled data only when the API is unreachable. */
export async function getPastEventSlugs(): Promise<string[]> {
  const data = await apiGet<string[]>('/public/events/slugs', {
    revalidate: 300,
  });
  return data ?? localPastEventSlugs();
}

/** One event's detail. Falls back to bundled data. Returns null if unknown. */
export async function getPastEventBySlug(
  slug: string,
): Promise<PastEvent | null> {
  const data = await apiGet<ApiEventDetail>(
    `/public/events/${encodeURIComponent(slug)}`,
    { revalidate: 300 },
  );
  if (data) return toPastEvent(data);
  return localPastEventBySlug(slug) ?? null;
}
