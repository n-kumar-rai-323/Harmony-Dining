/**
 * Idempotent seed:
 *  - permission catalogue
 *  - default role -> permission grants
 *  - one SUPER_ADMIN from SEED_SUPERADMIN_* env (created only if absent)
 *  - singleton ReservationSettings / SiteSetting / HomepageSection rows
 *
 * Safe to run repeatedly. Never overwrites an existing admin password.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AdminRole, PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const BCRYPT_COST = 12;

function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const prisma = new PrismaClient();

const PERMISSIONS: Record<string, string> = {
  'dashboard.read': 'View the admin dashboard and metrics',
  'menu.read': 'View menu categories and items',
  'menu.create': 'Create menu categories and items',
  'menu.update': 'Edit menu categories and items',
  'menu.delete': 'Delete (soft) menu categories and items',
  'menu.publish': 'Publish / unpublish menu content',
  'gallery.read': 'View gallery items',
  'gallery.manage': 'Create, edit, order, publish and delete gallery items',
  'media.read': 'Browse the media library',
  'media.upload': 'Upload media',
  'media.delete': 'Delete unused media',
  'events.read': 'View events',
  'events.manage': 'Create and edit events',
  'events.publish': 'Publish / unpublish and change event lifecycle',
  'reservations.read': 'View reservations',
  'reservations.update': 'Change reservation status',
  'enquiries.read': 'View private event enquiries',
  'enquiries.update': 'Change enquiry status',
  'messages.read': 'View contact form messages',
  'messages.manage': 'Mark contact messages read and delete them',
  'reviews.read': 'View reviews',
  'reviews.moderate': 'Approve, reject, feature and publish reviews',
  'homepage.read': 'View homepage CMS content',
  'homepage.manage': 'Edit homepage CMS content',
  'pageHeaders.read': 'View page header (hero/banner) CMS content',
  'pageHeaders.manage': 'Edit page header (hero/banner) CMS content',
  'settings.read': 'View site settings',
  'settings.manage': 'Edit site settings',
  'notifications.read': 'View notifications',
  'mail.read': 'View the outbound email log',
  'users.read': 'View admin users',
  'users.manage': 'Create, edit, disable admin users and manage roles',
  'audit.read': 'View the audit log',
};

const ALL = Object.keys(PERMISSIONS);

const ROLE_GRANTS: Record<AdminRole, string[]> = {
  SUPER_ADMIN: ALL,
  ADMIN: ALL.filter((p) => p !== 'users.manage'),
  MANAGER: [
    'dashboard.read',
    'menu.read',
    'menu.create',
    'menu.update',
    'menu.publish',
    'gallery.read',
    'gallery.manage',
    'media.read',
    'media.upload',
    'media.delete',
    'events.read',
    'events.manage',
    'events.publish',
    'reservations.read',
    'reservations.update',
    'enquiries.read',
    'enquiries.update',
    'messages.read',
    'messages.manage',
    'reviews.read',
    'reviews.moderate',
    'notifications.read',
  ],
  STAFF: [
    'dashboard.read',
    'menu.read',
    'gallery.read',
    'events.read',
    'reservations.read',
    'reservations.update',
    'enquiries.read',
    'messages.read',
    'reviews.read',
    'notifications.read',
  ],
};

async function seedPermissions(): Promise<Map<string, string>> {
  const idByKey = new Map<string, string>();
  for (const [key, description] of Object.entries(PERMISSIONS)) {
    const row = await prisma.permission.upsert({
      where: { key },
      update: { description },
      create: { key, description },
    });
    idByKey.set(key, row.id);
  }
  return idByKey;
}

async function seedRoleGrants(idByKey: Map<string, string>): Promise<void> {
  for (const role of Object.keys(ROLE_GRANTS) as AdminRole[]) {
    const keys = ROLE_GRANTS[role];
    for (const key of keys) {
      const permissionId = idByKey.get(key)!;
      await prisma.rolePermission.upsert({
        where: { role_permissionId: { role, permissionId } },
        update: {},
        create: { role, permissionId },
      });
    }
    // Remove grants that are no longer in the default set.
    await prisma.rolePermission.deleteMany({
      where: {
        role,
        permissionId: {
          notIn: keys.map((k) => idByKey.get(k)!),
        },
      },
    });
  }
}

async function seedSuperAdmin(): Promise<void> {
  const email = (process.env.SEED_SUPERADMIN_EMAIL ?? '').trim().toLowerCase();
  const password = process.env.SEED_SUPERADMIN_PASSWORD ?? '';
  const name = (process.env.SEED_SUPERADMIN_NAME ?? 'Harmony Owner').trim();

  if (!email || !password) {
    console.warn('  · SEED_SUPERADMIN_EMAIL / PASSWORD not set — skipping.');
    return;
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`  · super admin ${email} already exists — left unchanged.`);
    return;
  }

  const passwordHash = await hash(password, BCRYPT_COST);
  await prisma.adminUser.create({
    data: { email, passwordHash, name, role: 'SUPER_ADMIN', status: 'ACTIVE' },
  });
  console.log(`  · created SUPER_ADMIN ${email}`);
}

async function seedSingletons(): Promise<void> {
  await prisma.reservationSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default' },
  });

  const siteDefaults: Record<string, unknown> = {
    business: {
      name: 'Harmony Dining & Event Center',
      phone: '',
      email: '',
      addressLines: ['Harmony Dining & Event Center', 'Kumaripati, Lalitpur'],
      latitude: 27.6718846,
      longitude: 85.3195215,
      mapHref: '/#location',
    },
    hours: [{ label: 'Mon – Sun', value: '10:00 AM – 10:00 PM' }],
    social: [
      {
        platform: 'tiktok',
        label: 'TikTok',
        href: 'https://www.tiktok.com/@harmonydiningeventcenter',
        brandColor: '#111111',
      },
      {
        platform: 'facebook',
        label: 'Facebook',
        href: 'https://www.facebook.com/people/Harmony-Dining-Event-Center/61593063557390/',
        brandColor: '#1877F2',
      },
      {
        platform: 'instagram',
        label: 'Instagram',
        href: 'https://www.instagram.com/harmonydiningandevent',
        brandColor: '#E1306C',
      },
    ],
  };

  for (const [key, value] of Object.entries(siteDefaults)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: {},
      create: { key, value: value as never },
    });
  }
}

// Homepage CMS defaults — mirror the `initial*Content` objects the public home
// components ship with, so the site looks identical before an admin edits
// anything. Icon components become string `iconKey`s (resolved in the UI).
// Idempotent: `update: {}` never overwrites edits made in the admin panel.
async function seedHomepage(): Promise<void> {
  const sections: Record<string, unknown> = {
    hero: {
      eyebrow: 'Dining • Events • Celebration',
      title: 'Taste. Celebrate.',
      accentTitle: 'Remember.',
      description:
        'Exceptional dining, warm hospitality and memorable celebrations in one refined destination.',
      image: '/images/home/harmony-hero-dining.jpg',
      imageAlt: 'Harmony Dining & Event Center dining space',
      imagePosition: 'center',
      images: [
        {
          src: '/images/home/harmony-hero-dining.jpg',
          alt: 'Guests dining at Harmony Dining & Event Center',
          position: 'center',
        },
        {
          src: '/images/home/harmony-hero-restaurant.jpg',
          alt: 'The Harmony restaurant interior',
          position: 'center',
        },
        {
          src: '/images/home/harmony-gallery-dining-hall.jpg',
          alt: 'Harmony dining hall set for service',
          position: 'center',
        },
        {
          src: '/images/home/harmony-banquet-hall.jpg',
          alt: 'Harmony banquet hall arranged for an event',
          position: 'center',
        },
        {
          src: '/images/home/harmony-experience-event.jpg',
          alt: 'A celebration underway at Harmony',
          position: 'center',
        },
      ],
      imageLabel: 'Harmony Experience',
      imageCaption: 'Dining with distinction',
      actions: [
        {
          label: 'Book Event / Hall',
          href: '/events#enquiry',
          iconKey: 'celebration',
          variant: 'primary',
        },
        {
          label: 'Reserve a Table',
          href: '/reservation',
          iconKey: 'calendar',
          variant: 'secondary',
        },
        {
          label: 'Explore Menu',
          href: '/menu',
          iconKey: 'menu',
          variant: 'tertiary',
        },
      ],
    },
    dining: {
      eyebrow: 'Dining Experience',
      title: 'Good food feels better in the right place.',
      description:
        'A welcoming setting designed for relaxed meals, family gatherings and memorable moments with the people who matter.',
      image: '/images/home/harmony-dining-experience.jpg',
      imageAlt:
        'Warm dining environment at Harmony Dining & Event Center',
      imagePosition: 'center',
      images: [
        {
          src: '/images/home/harmony-dining-experience.jpg',
          alt: 'Warm dining environment at Harmony Dining & Event Center',
          position: 'center',
        },
        {
          src: '/images/home/harmony-experience-team.jpg',
          alt: 'The Harmony team preparing for service',
          position: 'center',
        },
        {
          src: '/images/home/harmony-experience-kitchen.jpg',
          alt: 'Inside the Harmony kitchen',
          position: 'center',
        },
        {
          src: '/images/home/harmony-gallery-terrace.jpg',
          alt: 'Harmony terrace seating',
          position: 'center',
        },
        {
          src: '/images/home/harmony-gallery-entrance.jpg',
          alt: 'Entrance to Harmony Dining & Event Center',
          position: 'center',
        },
      ],
      detail: {
        title: 'Dining',
        subtitle: 'Premium Space',
        iconKey: 'restaurant',
      },
      cta: { label: 'Discover Harmony', href: '/gallery' },
    },
    animated: {
      eyebrow: 'The Harmony Experience',
      title: 'More than a place to dine.',
      description:
        'Discover the moments, people and details that shape every Harmony experience.',
      stories: [
        {
          id: 'celebrate-together',
          eyebrow: 'Celebrate Together',
          title: 'A place made for meaningful occasions.',
          description:
            'From intimate gatherings to larger celebrations, Harmony gives every occasion room to feel special.',
          image: '/images/home/harmony-experience-event.jpg',
          imageAlt: 'Celebration and event experience at Harmony',
          imagePosition: 'center',
        },
        {
          id: 'warm-hospitality',
          eyebrow: 'Warm Hospitality',
          title: 'People who make every visit feel personal.',
          description:
            'Good hospitality is more than service. It is the feeling of being welcomed, cared for and remembered.',
          image: '/images/home/harmony-experience-team.jpg',
          imageAlt: 'Hospitality team experience at Harmony',
          imagePosition: 'center',
        },
        {
          id: 'behind-the-kitchen',
          eyebrow: 'Behind the Kitchen',
          title:
            'Care goes into every plate before it reaches the table.',
          description:
            'Every dining experience begins behind the scenes with preparation, teamwork and attention to detail.',
          image: '/images/home/harmony-experience-kitchen.jpg',
          imageAlt: 'Kitchen preparation and teamwork at Harmony',
          imagePosition: 'center',
        },
      ],
    },
    eventsShowcase: {
      enabled: true,
      eyebrow: 'Events & Banquet',
      title: 'Your occasion.',
      accentTitle: 'Your people.',
      closingTitle: 'One memorable space.',
      description:
        'From intimate celebrations to larger group events, Harmony brings venue, dining and thoughtful hospitality together in one welcoming experience.',
      image: '/images/home/harmony-banquet-hall.jpg',
      imageAlt:
        'Banquet and event space at Harmony Dining & Event Center',
      imagePosition: 'center',
      imageLabel: 'Events at Harmony',
      imageMeta: 'Dining • Venue • Hospitality',
      tags: ['Private Events', 'Celebrations', 'Group Dining'],
      features: [
        {
          id: 'celebrations',
          title: 'Celebrations',
          description:
            'Birthdays, anniversaries and personal milestones.',
          iconKey: 'celebration',
        },
        {
          id: 'group-events',
          title: 'Group Events',
          description:
            'A flexible space for larger gatherings and occasions.',
          iconKey: 'groups',
        },
        {
          id: 'dining',
          title: 'Dining Included',
          description:
            'Food and hospitality planned together with your event.',
          iconKey: 'restaurant',
        },
        {
          id: 'custom-planning',
          title: 'Planned Your Way',
          description:
            'A setup shaped around your guests and your occasion.',
          iconKey: 'tune',
        },
      ],
      primaryCta: { label: 'Explore Events', href: '/events' },
      secondaryCta: {
        label: 'Plan Your Event',
        href: '/events#enquiry',
      },
      supportingNote:
        'Tell us about your occasion and our team can help with venue, dining and event planning.',
    },
    reservationCta: {
      enabled: true,
      eyebrow: 'Plan Your Visit',
      title: 'Make your next moment',
      accentTitle: 'a Harmony moment.',
      description:
        'Plan a memorable celebration with our event team or reserve a table for your next dining experience.',
      cards: [
        {
          id: 'event-planning',
          eyebrow: 'Events & Hall Booking',
          title: 'Book Event / Hall',
          description:
            'Tell us about your occasion and let our team help shape the right venue, dining experience and event setup.',
          iconKey: 'celebration',
          badges: [
            {
              id: 'group-occasions',
              label: 'Group occasions',
              iconKey: 'groups',
            },
            {
              id: 'venue-dining',
              label: 'Venue & dining',
              iconKey: 'restaurant',
            },
          ],
          cta: {
            label: 'Plan Your Event',
            href: '/events#enquiry',
            variant: 'contained',
          },
        },
        {
          id: 'dining-reservation',
          eyebrow: 'Dining Reservation',
          title: 'Reserve a Table',
          description:
            'Choose your preferred date, time and number of guests for your next visit to Harmony.',
          iconKey: 'calendar',
          badges: [
            {
              id: 'choose-time',
              label: 'Choose your time',
              iconKey: 'clock',
            },
            {
              id: 'dining-harmony',
              label: 'Dining at Harmony',
              iconKey: 'restaurant',
            },
          ],
          cta: {
            label: 'Reserve a Table',
            href: '/reservation',
            variant: 'outlined',
          },
        },
      ],
      supportingNote:
        'Every booking is confirmed by our team so we can plan your visit with care.',
    },
    reviews: {
      enabled: true,
      eyebrow: 'Guest Stories',
      title: 'Moments that',
      accentTitle: 'stay with you.',
      description:
        'Every table has a story and every celebration leaves a memory. Discover moments shared by guests at Harmony.',
    },
    location: {
      enabled: true,
      eyebrow: 'Find Harmony',
      title: 'Closer than',
      accentTitle: 'you think.',
      description:
        'Find Harmony easily, explore nearby landmarks and view routes for your next dining experience or celebration.',
      location: {
        id: 'harmony-main',
        name: 'Harmony Dining & Event Center',
        address: 'Kumaripati, Lalitpur',
        latitude: 27.6718846,
        longitude: 85.3195215,
      },
      nearbyPlaces: [
        {
          id: 'airport',
          name: 'Tribhuvan International Airport',
          shortName: 'Airport',
          category: 'Travel',
          latitude: 27.6966,
          longitude: 85.3591,
        },
        {
          id: 'durbar-square',
          name: 'Kathmandu Durbar Square',
          shortName: 'Durbar Square',
          category: 'Landmark',
          latitude: 27.7048,
          longitude: 85.3076,
        },
        {
          id: 'thamel',
          name: 'Thamel',
          shortName: 'Thamel',
          category: 'City',
          latitude: 27.7154,
          longitude: 85.3123,
        },
      ],
      directionsCta: { label: 'Get Directions', enabled: true },
      mapCta: { label: 'Open Map', enabled: true },
      helperText:
        'Select a nearby place to explore the route from Harmony.',
      estimateNote:
        'Distance and travel time are route-based estimates.',
    },
  };

  for (const [key, content] of Object.entries(sections)) {
    await prisma.homepageSection.upsert({
      where: { key },
      update: {},
      create: { key, content: content as never, isPublished: true },
    });
  }
}

// Seeds the current hardcoded hero copy for every public page so the pages
// render identically before an admin edits anything, and so there's a
// starting point to edit from in the admin panel.
async function seedPageHeaders(): Promise<void> {
  const headers: Record<string, unknown> = {
    about: {
      eyebrow: 'Our Story',
      title: 'Made for gathering.',
      description:
        'Harmony Dining & Event Center began with a simple idea: a single place where good food, warm service and space to celebrate come together.',
      image: '/images/home/harmony-dining-experience.jpg',
      imageAlt: 'The dining room at Harmony Dining & Event Center',
    },
    contact: {
      eyebrow: 'Contact',
      title: 'We would love to hear from you.',
      description:
        'The quickest way to book is through our reservation and event forms — they reach the team directly. You can also visit us in person or message us on social media.',
    },
    events: {
      eyebrow: 'Events at Harmony',
      title: 'Celebrate beautifully.',
      accentTitle: 'Host effortlessly.',
      description:
        'From intimate dinners to bigger celebrations, Harmony brings together beautiful spaces, dining and event support for moments worth remembering.',
      image: '/images/home/harmony-experience-event.jpg',
      imageAlt: 'Celebration event at Harmony Dining and Event Center',
      primaryCta: { label: 'Plan Your Event', href: '#enquiry' },
      secondaryCta: { label: 'View Past Events', href: '#past-events' },
    },
    gallery: {
      eyebrow: 'Our Gallery',
      title: 'Moments at Harmony.',
      description:
        'Discover Harmony through our dining spaces, celebrations and memorable moments shared with our guests.',
      image: '/images/home/harmony-gallery-dining-hall.jpg',
      imageAlt: 'Harmony dining and celebration gallery',
      primaryCta: { label: 'View Our Events', href: '/events' },
      secondaryCta: { label: 'View Photos', href: '#gallery' },
    },
    menu: {
      eyebrow: 'Exquisite Flavors',
      title: 'A Menu for',
      accentTitle: 'Every Moment',
      description:
        'Fresh ingredients. Thoughtful preparation. Memorable flavours for dining, celebrations and every Harmony moment.',
      image: '/images/menu/harmony-food-menu-bg.jpg',
      imageAlt: 'Harmony dining menu',
      badges: [
        { label: 'Fresh & Local' },
        { label: 'Chef Crafted' },
        { label: 'Quality First' },
      ],
    },
    reservation: {
      eyebrow: 'Reserve a Table',
      title: 'Good food brings people together.',
      description:
        'Choose your preferred date, time and table size. Harmony will review availability and confirm the reservation with you.',
      image: '/images/home/harmony-hero-dining.jpg',
      imageAlt: 'Dining experience at Harmony Dining and Event Center',
      primaryCta: { label: 'Reserve Your Table', href: '#reservation-form' },
    },
    reviews: {
      eyebrow: 'Guest Stories',
      title: 'Moments that',
      accentTitle: 'stay with you.',
      description: "Every table has a story. Here's what guests are saying.",
    },
  };

  for (const [key, content] of Object.entries(headers)) {
    await prisma.pageHeader.upsert({
      where: { key },
      update: {},
      create: { key, content: content as never, isPublished: true },
    });
  }
}

interface SeedGalleryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  alt: string;
  sortOrder: number;
  featuredOnHome?: boolean;
}

// Imports the site's original gallery: copies each source image into the
// local media store, creates a Media row + a GalleryItem. Empty-DB only.
async function seedGallery(): Promise<void> {
  const existing = await prisma.galleryItem.count();
  if (existing > 0) {
    console.log(`  · gallery: ${existing} items already present — skipped.`);
    return;
  }

  let items: SeedGalleryItem[];
  try {
    items = JSON.parse(
      readFileSync(join(__dirname, 'seed-data', 'gallery.json'), 'utf8'),
    );
  } catch {
    console.warn('  · gallery: seed-data/gallery.json not found — skipped.');
    return;
  }

  const publicDir = join(__dirname, '..', '..', 'frontend', 'public');
  const localDir =
    (process.env.STORAGE_LOCAL_DIR ?? './storage/uploads').replace(/^\.\//, '');
  const baseUrl = (
    process.env.STORAGE_PUBLIC_BASE_URL ?? 'http://localhost:4100/media'
  ).replace(/\/$/, '');
  const destDir = join(process.cwd(), localDir, 'gallery');
  mkdirSync(destDir, { recursive: true });

  let n = 0;
  for (const [i, it] of items.entries()) {
    const src = join(publicDir, it.image.replace(/^\//, ''));
    if (!existsSync(src)) {
      console.warn(`  · gallery: source not found ${it.image} — skipped item.`);
      continue;
    }
    const fileName = `${it.id}${extOf(it.image)}`;
    copyFileSync(src, join(destDir, fileName));
    const key = `gallery/${fileName}`;

    const media = await prisma.media.create({
      data: {
        storageKey: key,
        url: `${baseUrl}/${key}`,
        mimeType: mimeOf(it.image),
        sizeBytes: 0,
        originalFilename: it.image.split('/').pop() ?? fileName,
        folder: 'gallery',
        altText: it.alt,
        title: it.title,
      },
    });

    await prisma.galleryItem.create({
      data: {
        mediaId: media.id,
        title: it.title,
        altText: it.alt,
        caption: it.description || null,
        category: it.category as never,
        status: 'PUBLISHED',
        sortOrder: it.sortOrder ?? i,
        featuredOnHome: it.featuredOnHome ?? false,
      },
    });
    n += 1;
  }
  console.log(`  · gallery: imported ${n} items.`);
}

function extOf(p: string): string {
  const m = /\.([a-z0-9]+)$/i.exec(p);
  return m ? `.${m[1].toLowerCase()}` : '.jpg';
}
function mimeOf(p: string): string {
  const e = extOf(p);
  return e === '.png'
    ? 'image/png'
    : e === '.webp'
      ? 'image/webp'
      : 'image/jpeg';
}

interface SeedEventMedia {
  type: 'image' | 'video';
  src: string;
  poster?: string;
  alt: string;
}
interface SeedEvent {
  slug: string;
  title: string;
  category: string;
  date: string;
  guests?: string;
  summary: string;
  cover: SeedEventMedia;
  media: SeedEventMedia[];
}

// Imports the site's past events. Placeholder video files are skipped;
// their poster image is used instead. Empty-DB only.
async function seedEvents(): Promise<void> {
  const existing = await prisma.event.count();
  if (existing > 0) {
    console.log(`  · events: ${existing} already present — skipped.`);
    return;
  }

  let raw: SeedEvent[];
  try {
    raw = JSON.parse(
      readFileSync(join(__dirname, 'seed-data', 'past-events.json'), 'utf8'),
    );
  } catch {
    console.warn('  · events: seed-data/past-events.json not found — skipped.');
    return;
  }

  const publicDir = join(__dirname, '..', '..', 'frontend', 'public');
  const localDir = (
    process.env.STORAGE_LOCAL_DIR ?? './storage/uploads'
  ).replace(/^\.\//, '');
  const baseUrl = (
    process.env.STORAGE_PUBLIC_BASE_URL ?? 'http://localhost:4100/media'
  ).replace(/\/$/, '');
  const destDir = join(process.cwd(), localDir, 'events');
  mkdirSync(destDir, { recursive: true });

  const mediaByPath = new Map<string, string>();
  const ensureMedia = async (
    imgPath: string,
    alt: string,
  ): Promise<string | null> => {
    if (mediaByPath.has(imgPath)) return mediaByPath.get(imgPath)!;
    const src = join(publicDir, imgPath.replace(/^\//, ''));
    if (!existsSync(src)) return null;
    const fileName = imgPath.split('/').pop() ?? 'image.jpg';
    copyFileSync(src, join(destDir, fileName));
    const key = `events/${fileName}`;
    const media = await prisma.media.create({
      data: {
        storageKey: key,
        url: `${baseUrl}/${key}`,
        mimeType: mimeOf(imgPath),
        sizeBytes: 0,
        originalFilename: fileName,
        folder: 'events',
        altText: alt,
      },
    });
    mediaByPath.set(imgPath, media.id);
    return media.id;
  };

  let n = 0;
  for (const [ei, ev] of raw.entries()) {
    const coverImg =
      ev.cover.type === 'image' ? ev.cover.src : ev.cover.poster;
    const coverMediaId = coverImg
      ? await ensureMedia(coverImg, ev.title)
      : null;

    const imageMedia = ev.media.filter((m) => m.type === 'image');
    const eventMediaData: {
      mediaId: string;
      type: 'IMAGE';
      altText: string;
      sortOrder: number;
    }[] = [];
    for (const [mi, m] of imageMedia.entries()) {
      const mid = await ensureMedia(m.src, m.alt);
      if (mid) {
        eventMediaData.push({
          mediaId: mid,
          type: 'IMAGE',
          altText: m.alt,
          sortOrder: mi,
        });
      }
    }

    await prisma.event.create({
      data: {
        slug: ev.slug,
        title: ev.title,
        category: ev.category,
        summary: ev.summary,
        eventDate: new Date(ev.date),
        guestsLabel: ev.guests ?? null,
        coverMediaId,
        status: 'PUBLISHED',
        lifecycle: 'COMPLETED',
        media: { create: eventMediaData },
      },
    });
    n += 1;
    void ei;
  }
  console.log(`  · events: imported ${n} events.`);
}

async function main(): Promise<void> {
  console.log('Seeding Harmony database…');
  const idByKey = await seedPermissions();
  await seedRoleGrants(idByKey);
  await seedSuperAdmin();
  await seedSingletons();
  await seedHomepage();
  await seedPageHeaders();
  await seedGallery();
  await seedEvents();
  console.log('Seed complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
