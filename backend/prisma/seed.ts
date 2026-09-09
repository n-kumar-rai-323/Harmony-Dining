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
  'reviews.read': 'View reviews',
  'reviews.moderate': 'Approve, reject, feature and publish reviews',
  'homepage.read': 'View homepage CMS content',
  'homepage.manage': 'Edit homepage CMS content',
  'settings.read': 'View site settings',
  'settings.manage': 'Edit site settings',
  'notifications.read': 'View notifications',
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

interface SeedMenuItem {
  name: string;
  price?: number | null;
  priceLabel?: string;
  description?: string;
  status: string;
  variants?: { name: string; price: number }[];
}
interface SeedMenuCategory {
  id: string;
  group: 'FOOD' | 'BEVERAGES' | 'BAR';
  name: string;
  items: SeedMenuItem[];
}

// Imports the real menu (extracted from the site's menu-data.ts) — but only
// on an empty database, so it never overwrites edits made in the admin panel.
async function seedMenu(): Promise<void> {
  const existing = await prisma.menuCategory.count();
  if (existing > 0) {
    console.log(`  · menu: ${existing} categories already present — skipped.`);
    return;
  }

  let raw: SeedMenuCategory[];
  try {
    raw = JSON.parse(
      readFileSync(join(__dirname, 'seed-data', 'menu.json'), 'utf8'),
    );
  } catch {
    console.warn('  · menu: seed-data/menu.json not found — skipped.');
    return;
  }

  const mapStatus = (s: string) =>
    s === 'VERIFIED' ? 'PUBLISHED' : ('DRAFT' as const);

  let catCount = 0;
  let itemCount = 0;

  for (const [ci, cat] of raw.entries()) {
    const catSlug = slugify(cat.id || cat.name) || `category-${ci + 1}`;
    const category = await prisma.menuCategory.create({
      data: {
        name: cat.name,
        slug: catSlug,
        group: cat.group,
        status: 'PUBLISHED',
        sortOrder: ci,
      },
    });
    catCount += 1;

    const usedSlugs = new Set<string>();
    for (const [ii, item] of cat.items.entries()) {
      let slug = slugify(item.name) || `item-${ii + 1}`;
      let n = 1;
      while (usedSlugs.has(slug)) {
        n += 1;
        slug = `${slugify(item.name)}-${n}`;
      }
      usedSlugs.add(slug);

      await prisma.menuItem.create({
        data: {
          categoryId: category.id,
          name: item.name,
          slug,
          description: item.description?.trim() || null,
          price: item.price ?? null,
          priceLabel: item.priceLabel?.trim() || null,
          status: mapStatus(item.status),
          sortOrder: ii,
          variants: item.variants?.length
            ? {
                create: item.variants.map((v, vi) => ({
                  label: v.name,
                  price: v.price,
                  sortOrder: vi,
                })),
              }
            : undefined,
        },
      });
      itemCount += 1;
    }
  }

  console.log(
    `  · menu: imported ${catCount} categories, ${itemCount} items.`,
  );
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
  await seedMenu();
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
