/**
 * Idempotent seed:
 *  - permission catalogue
 *  - default role -> permission grants
 *  - one SUPER_ADMIN from SEED_SUPERADMIN_* env (created only if absent)
 *  - singleton ReservationSettings / SiteSetting / HomepageSection rows
 *
 * Safe to run repeatedly. Never overwrites an existing admin password.
 */
import { AdminRole, PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const BCRYPT_COST = 12;

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

async function main(): Promise<void> {
  console.log('Seeding Harmony database…');
  const idByKey = await seedPermissions();
  await seedRoleGrants(idByKey);
  await seedSuperAdmin();
  await seedSingletons();
  console.log('Seed complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
