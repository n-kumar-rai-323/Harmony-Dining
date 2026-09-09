/* =========================================================
   GALLERY — CONTENT SOURCE

   Development data only. Later:

     Harmony Admin
          ↓
     NestJS Gallery API  (GET /gallery/public)
          ↓
     PostgreSQL + object storage
          ↓
     getGalleryItems()

   Components only call the accessors below, so switching to
   the API is a one-file change.
========================================================= */

export type GalleryCategory =
  | 'ALL'
  | 'DINING'
  | 'EVENTS'
  | 'SPACES'
  | 'TEAM'
  | 'KITCHEN';

export type PublicGalleryCategory = Exclude<
  GalleryCategory,
  'ALL'
>;

export type GalleryItem = {
  id: string;
  title: string;
  description: string;
  category: PublicGalleryCategory;
  image: string;
  alt: string;
  sortOrder: number;
  /** Surface this item in the home-page gallery preview. */
  featuredOnHome?: boolean;
};

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gallery-1',
    title: 'Harmony Dining Hall',
    description:
      'A welcoming dining space prepared for guests and gatherings.',
    category: 'DINING',
    image: '/images/home/harmony-gallery-dining-hall.jpg',
    alt: 'Harmony dining hall',
    sortOrder: 1,
    featuredOnHome: true,
  },
  {
    id: 'gallery-2',
    title: 'Celebration Setup',
    description:
      'Harmony event space prepared for memorable celebrations.',
    category: 'EVENTS',
    image: '/images/home/harmony-experience-event.jpg',
    alt: 'Harmony event celebration setup',
    sortOrder: 2,
    featuredOnHome: true,
  },
  {
    id: 'gallery-3',
    title: 'Banquet Hall',
    description:
      'A flexible banquet space for larger gatherings and occasions.',
    category: 'SPACES',
    image: '/images/home/harmony-banquet-hall.jpg',
    alt: 'Harmony banquet hall',
    sortOrder: 3,
    featuredOnHome: true,
  },
  {
    id: 'gallery-4',
    title: 'Dining Experience',
    description:
      'The atmosphere and hospitality behind the Harmony dining experience.',
    category: 'DINING',
    image: '/images/home/harmony-dining-experience.jpg',
    alt: 'Harmony dining experience',
    sortOrder: 4,
  },
  {
    id: 'gallery-5',
    title: 'Harmony Terrace',
    description:
      'A comfortable outdoor area for relaxed dining and gatherings.',
    category: 'SPACES',
    image: '/images/home/harmony-gallery-terrace.jpg',
    alt: 'Harmony terrace',
    sortOrder: 5,
    featuredOnHome: true,
  },
  {
    id: 'gallery-6',
    title: 'Harmony Kitchen',
    description:
      'A look inside the kitchen where Harmony dishes are prepared.',
    category: 'KITCHEN',
    image: '/images/home/harmony-gallery-kitchen.jpg',
    alt: 'Harmony restaurant kitchen',
    sortOrder: 6,
    featuredOnHome: true,
  },
  {
    id: 'gallery-7',
    title: 'Harmony Team',
    description:
      'The people helping create the Harmony dining and hospitality experience.',
    category: 'TEAM',
    image: '/images/home/harmony-experience-team.jpg',
    alt: 'Harmony restaurant team',
    sortOrder: 7,
  },
  {
    id: 'gallery-8',
    title: 'Kitchen Experience',
    description:
      'Behind the scenes of food preparation at Harmony.',
    category: 'KITCHEN',
    image: '/images/home/harmony-experience-kitchen.jpg',
    alt: 'Harmony kitchen experience',
    sortOrder: 8,
  },
  {
    id: 'gallery-9',
    title: 'Harmony Entrance',
    description:
      'The welcoming entrance to Harmony Dining & Event Center.',
    category: 'SPACES',
    image: '/images/home/harmony-gallery-entrance.jpg',
    alt: 'Harmony restaurant entrance',
    sortOrder: 9,
    featuredOnHome: true,
  },
];

const GALLERY_CATEGORIES: {
  value: GalleryCategory;
  label: string;
}[] = [
  { value: 'ALL', label: 'All' },
  { value: 'DINING', label: 'Dining' },
  { value: 'EVENTS', label: 'Events' },
  { value: 'SPACES', label: 'Spaces' },
  { value: 'TEAM', label: 'Team' },
  { value: 'KITCHEN', label: 'Kitchen' },
];

const CATEGORY_LABELS: Record<
  PublicGalleryCategory,
  string
> = {
  DINING: 'Dining',
  EVENTS: 'Events',
  SPACES: 'Spaces',
  TEAM: 'Team',
  KITCHEN: 'Kitchen',
};

export function getGalleryItems(): GalleryItem[] {
  return [...GALLERY_ITEMS].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
}

export function getHomeGalleryItems(
  limit = 6,
): GalleryItem[] {
  const featured = getGalleryItems().filter(
    (item) => item.featuredOnHome,
  );

  const pool =
    featured.length >= 3
      ? featured
      : getGalleryItems();

  return pool.slice(0, limit);
}

export function getGalleryCategories() {
  return GALLERY_CATEGORIES;
}

export function getGalleryCategoryLabel(
  category: PublicGalleryCategory,
): string {
  return CATEGORY_LABELS[category];
}
