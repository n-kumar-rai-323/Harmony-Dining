/* =========================================================
   PAST EVENTS — CONTENT SOURCE

   Development data only. Later this becomes:

     Admin Dashboard
          ↓
     NestJS API  (GET /events/past, GET /events/past/:slug)
          ↓
     getPastEvents() / getPastEventBySlug()

   Only these accessor functions are called from components,
   so swapping the source to the API is a one-file change.

   Media model:
   - `image`  → a photo (lazy-loaded with next/image)
   - `video`  → a video file plus a `poster` still. The gallery
     shows the poster with a play badge and only loads the
     video bytes after the visitor presses play.

   Admin uploads land under:
     public/media/past-events/<event>/...
========================================================= */

export type PastEventMedia =
  | {
      type: 'image';
      src: string;
      alt: string;
    }
  | {
      type: 'video';
      src: string;
      poster: string;
      alt: string;
    };

export type PastEvent = {
  slug: string;
  title: string;
  category: string;
  /** ISO date, `YYYY-MM-DD`. */
  date: string;
  guests?: string;
  summary: string;
  /** Card thumbnail — an image, or a video shown as a poster + play badge. */
  cover: PastEventMedia;
  /** Everything shown on the event's own page. */
  media: PastEventMedia[];
};

const PAST_EVENTS: PastEvent[] = [
  {
    slug: 'birthday-celebration',
    title: 'Birthday Celebration',
    category: 'Celebration',
    date: '2025-11-22',
    guests: 'Family & friends',
    summary:
      'An evening of dinner, cake and warm company in the main dining hall.',
    cover: {
      type: 'image',
      src: '/images/home/harmony-experience-event.jpg',
      alt: 'Birthday celebration hosted at Harmony',
    },
    media: [
      {
        type: 'image',
        src: '/images/home/harmony-experience-event.jpg',
        alt: 'Guests gathered around the celebration table',
      },
      {
        type: 'image',
        src: '/images/home/harmony-gallery-dining-hall.jpg',
        alt: 'The dining hall set for the party',
      },
      {
        type: 'image',
        src: '/images/home/harmony-dining-experience.jpg',
        alt: 'Dinner service during the celebration',
      },
      {
        type: 'image',
        src: '/images/home/harmony-experience-team.jpg',
        alt: 'The Harmony team looking after guests',
      },
    ],
  },
  {
    slug: 'anniversary-evening',
    title: 'Anniversary Evening',
    category: 'Private Event',
    date: '2025-09-14',
    guests: 'Group gathering',
    summary:
      'A private anniversary dinner in the banquet hall, captured in photos and a short highlight video.',
    cover: {
      type: 'image',
      src: '/images/home/harmony-banquet-hall.jpg',
      alt: 'Banquet hall arranged for the anniversary dinner',
    },
    // No highlight reel has been uploaded for this event yet — shown as
    // photos only. Add a `video` entry here (with a real file under
    // public/media/past-events/anniversary-evening/) once one exists.
    media: [
      {
        type: 'image',
        src: '/images/home/harmony-banquet-hall.jpg',
        alt: 'Banquet hall arranged for the anniversary dinner',
      },
      {
        type: 'image',
        src: '/images/home/harmony-gallery-terrace.jpg',
        alt: 'Guests on the terrace before dinner',
      },
      {
        type: 'image',
        src: '/images/home/harmony-experience-kitchen.jpg',
        alt: 'The kitchen preparing the anniversary menu',
      },
    ],
  },
  {
    slug: 'dining-celebration',
    title: 'Dining Celebration',
    category: 'Dining Event',
    date: '2025-07-05',
    guests: 'Private dining',
    summary:
      'A relaxed private dining celebration with a seasonal set menu.',
    cover: {
      type: 'image',
      src: '/images/home/harmony-gallery-dining-hall.jpg',
      alt: 'Dining celebration at Harmony',
    },
    media: [
      {
        type: 'image',
        src: '/images/home/harmony-gallery-dining-hall.jpg',
        alt: 'The private dining table',
      },
      {
        type: 'image',
        src: '/images/home/harmony-hero-dining.jpg',
        alt: 'Guests enjoying the meal',
      },
      {
        type: 'image',
        src: '/images/home/harmony-gallery-entrance.jpg',
        alt: 'Arrivals at the Harmony entrance',
      },
      {
        type: 'image',
        src: '/images/home/harmony-hero-restaurant.jpg',
        alt: 'The restaurant during service',
      },
    ],
  },
];

export function getPastEvents(): PastEvent[] {
  return PAST_EVENTS;
}

export function getPastEventSlugs(): string[] {
  return PAST_EVENTS.map((event) => event.slug);
}

export function getPastEventBySlug(
  slug: string,
): PastEvent | undefined {
  return PAST_EVENTS.find(
    (event) => event.slug === slug,
  );
}
