import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface PublicEventMedia {
  type: 'image' | 'video';
  src: string;
  poster?: string;
  alt: string;
}

export interface PublicEventSummary {
  slug: string;
  title: string;
  category: string;
  date: string; // YYYY-MM-DD
  startTime: string | null;
  endTime: string | null;
  guests: string | null;
  summary: string;
  lifecycle: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  cover: PublicEventMedia | null;
  mediaCount: { photos: number; videos: number };
}

export interface PublicEventDetail extends PublicEventSummary {
  description: string | null;
  media: PublicEventMedia[];
}

const DETAIL_INCLUDE = {
  coverMedia: { select: { url: true } },
  media: {
    orderBy: { sortOrder: 'asc' },
    include: {
      media: { select: { url: true } },
      posterMedia: { select: { url: true } },
    },
  },
} satisfies Prisma.EventInclude;

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

type EventWithMedia = Prisma.EventGetPayload<{ include: typeof DETAIL_INCLUDE }>;

function mediaEntries(event: EventWithMedia): PublicEventMedia[] {
  return event.media.map((m) => {
    if (m.type === 'VIDEO') {
      return {
        type: 'video' as const,
        src: m.media.url,
        poster: m.posterMedia?.url ?? m.media.url,
        alt: m.altText,
      };
    }
    return { type: 'image' as const, src: m.media.url, alt: m.altText };
  });
}

function coverOf(event: EventWithMedia): PublicEventMedia | null {
  if (event.coverMedia?.url) {
    return { type: 'image', src: event.coverMedia.url, alt: event.title };
  }
  const first = mediaEntries(event)[0];
  return first ?? null;
}

@Injectable()
export class EventsPublicService {
  constructor(private readonly prisma: PrismaService) {}

  async list(kind: 'past' | 'upcoming' | 'all'): Promise<PublicEventSummary[]> {
    const now = new Date();
    const where: Prisma.EventWhereInput = {
      status: 'PUBLISHED',
      deletedAt: null,
      ...(kind === 'upcoming'
        ? { lifecycle: 'UPCOMING', eventDate: { gte: startOfDay(now) } }
        : {}),
      ...(kind === 'past'
        ? {
            OR: [
              { lifecycle: 'COMPLETED' },
              {
                lifecycle: 'UPCOMING',
                eventDate: { lt: startOfDay(now) },
              },
            ],
          }
        : {}),
    };

    const events = await this.prisma.event.findMany({
      where,
      include: DETAIL_INCLUDE,
      orderBy: { eventDate: kind === 'upcoming' ? 'asc' : 'desc' },
    });

    return events.map((e) => toSummary(e));
  }

  async getBySlug(slug: string): Promise<PublicEventDetail> {
    const event = await this.prisma.event.findFirst({
      where: { slug, status: 'PUBLISHED', deletedAt: null },
      include: DETAIL_INCLUDE,
    });
    if (!event) throw new NotFoundException('Event not found');
    return { ...toSummary(event), description: event.description, media: mediaEntries(event) };
  }

  async publishedSlugs(): Promise<string[]> {
    const rows = await this.prisma.event.findMany({
      where: { status: 'PUBLISHED', deletedAt: null },
      select: { slug: true },
    });
    return rows.map((r) => r.slug);
  }
}

function toSummary(e: EventWithMedia): PublicEventSummary {
  const entries = mediaEntries(e);
  return {
    slug: e.slug,
    title: e.title,
    category: e.category,
    date: isoDate(e.eventDate),
    startTime: e.startTime,
    endTime: e.endTime,
    guests: e.guestsLabel,
    summary: e.summary,
    lifecycle: e.lifecycle,
    cover: coverOf(e),
    mediaCount: {
      photos: entries.filter((m) => m.type === 'image').length,
      videos: entries.filter((m) => m.type === 'video').length,
    },
  };
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
