/* =========================================================
   REVIEWS SHOWCASE — shared content + types

   Kept in a plain (non-"use client") module so a Server
   Component (app/page.tsx) can import the default copy
   directly. Importing a value out of the "use client"
   reviews-showcase.tsx across the RSC boundary yields a
   client-reference proxy, not the real object.
========================================================= */

export type ReviewItem = {
  id: string;
  name: string;
  occasion?: string;
  rating: number;
  review: string;
  avatarUrl?: string | null;
  /** How many photos the guest uploaded (avatarUrl is only the first one). */
  photoCount?: number;
  /** ISO date the review was submitted — shown as the guestbook entry date. */
  createdAt?: string;
};

export type ReviewsShowcaseContent = {
  enabled?: boolean;

  eyebrow?: string;
  title: string;
  accentTitle?: string;
  description?: string;

  reviews: ReviewItem[];

  footerText?: string;

  cta?: {
    label: string;
    href: string;
  };
};

/* =========================================================
   DEVELOPMENT CONTENT

   Sample copy only — used as GuestbookCarousel's default `content` prop
   when no content is passed at all (e.g. isolated component preview).
   The live homepage (app/page.tsx) never falls back to these `reviews`
   for real visitors: it always passes the real (possibly empty) Reviews
   API result, so the section simply doesn't render until a real review
   is approved and featured. Do not wire these sample reviews into any
   production fallback path.
========================================================= */

export const initialReviewsContent: ReviewsShowcaseContent = {
  enabled: true,

  eyebrow: 'Guest Stories',

  title: 'Moments that',

  accentTitle: 'stay with you.',

  description:
    'Every table has a story and every celebration leaves a memory. Discover moments shared by guests at Harmony.',

  reviews: [
    {
      id: 'r1',
      name: 'Aarav',
      occasion: 'Family Dinner',
      rating: 5,
      review:
        'The atmosphere felt warm, elegant and relaxed. It gave us exactly the kind of family evening we were hoping for.',
      avatarUrl: null,
    },
    {
      id: 'r2',
      name: 'Maya',
      occasion: 'Birthday Celebration',
      rating: 5,
      review:
        'Our celebration felt beautifully handled. The space, hospitality and overall experience came together naturally.',
      avatarUrl: null,
    },
    {
      id: 'r3',
      name: 'Sujan',
      occasion: 'Dinner With Friends',
      rating: 5,
      review:
        'A place where you actually want to stay a little longer. The ambience was comfortable, polished and welcoming.',
      avatarUrl: null,
    },
    {
      id: 'r4',
      name: 'Anisha',
      occasion: 'Anniversary Dinner',
      rating: 5,
      review:
        'The evening felt intimate without being too formal. Harmony gave the occasion a beautiful sense of warmth.',
      avatarUrl: null,
    },
    {
      id: 'r5',
      name: 'Rohan',
      occasion: 'Group Event',
      rating: 5,
      review:
        'Everything felt thoughtfully arranged for our group. The venue gave us enough space while still feeling personal.',
      avatarUrl: null,
    },
    {
      id: 'r6',
      name: 'Priya',
      occasion: 'Weekend Dining',
      rating: 5,
      review:
        'A calm and refined place to enjoy good food and conversation. The whole experience felt easy and comfortable.',
      avatarUrl: null,
    },
    {
      id: 'r7',
      name: 'Nabin',
      occasion: 'Celebration Dinner',
      rating: 5,
      review:
        'The setting gave our celebration the right atmosphere. It felt special without trying too hard.',
      avatarUrl: null,
    },
  ],

  footerText: 'Experiences shared by Harmony guests',

  cta: {
    label: 'Read Guest Stories',
    href: '/reviews',
  },
};
