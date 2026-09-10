import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Logger as PinoLogger } from 'nestjs-pino';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PasswordService } from '../src/auth/password.service';
import type { AppConfig } from '../src/config/configuration';

const OWNER = 'e2e.homepage.owner@harmony.test';
const STAFF = 'e2e.homepage.staff@harmony.test';
const PW = 'E2ePassw0rd!!';

const KEYS = [
  'hero',
  'dining',
  'animated',
  'eventsShowcase',
  'reservationCta',
  'reviews',
  'location',
];

describe('Homepage CMS (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let ownerCookie = '';
  let staffCookie = '';
  const original: Record<
    string,
    { content: unknown; isPublished: boolean } | undefined
  > = {};

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication({ bufferLogs: true });
    app.useLogger(app.get(PinoLogger));
    const config = app.get(ConfigService<AppConfig, true>);
    app.setGlobalPrefix('api');
    app.use(cookieParser(config.get('session', { infer: true }).secret));
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    const passwords = app.get(PasswordService);
    for (const email of [OWNER, STAFF]) {
      await prisma.session.deleteMany({ where: { admin: { email } } });
      await prisma.adminUser.deleteMany({ where: { email } });
    }
    await prisma.adminUser.create({
      data: {
        email: OWNER,
        name: 'E2E Homepage Owner',
        role: 'SUPER_ADMIN',
        passwordHash: await passwords.hash(PW),
      },
    });
    await prisma.adminUser.create({
      data: {
        email: STAFF,
        name: 'E2E Homepage Staff',
        role: 'STAFF',
        passwordHash: await passwords.hash(PW),
      },
    });

    for (const key of KEYS) {
      const row = await prisma.homepageSection.findUnique({ where: { key } });
      original[key] = row
        ? { content: row.content, isPublished: row.isPublished }
        : undefined;
    }

    const login = async (email: string) => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password: PW })
        .expect(200);
      return res.headers['set-cookie'][0].split(';')[0];
    };
    ownerCookie = await login(OWNER);
    staffCookie = await login(STAFF);
  });

  afterAll(async () => {
    for (const [key, snap] of Object.entries(original)) {
      if (snap === undefined) {
        await prisma.homepageSection.deleteMany({ where: { key } });
      } else {
        await prisma.homepageSection.upsert({
          where: { key },
          update: {
            content: snap.content as never,
            isPublished: snap.isPublished,
          },
          create: {
            key,
            content: snap.content as never,
            isPublished: snap.isPublished,
          },
        });
      }
    }
    for (const email of [OWNER, STAFF]) {
      await prisma.session.deleteMany({ where: { admin: { email } } });
      await prisma.adminUser.deleteMany({ where: { email } });
    }
    await app.close();
  });

  it('public homepage bundle is open, cache-friendly and has every key', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/public/homepage')
      .expect(200);
    expect(res.headers['cache-control']).toContain('s-maxage');
    for (const key of KEYS) {
      expect(key in res.body).toBe(true);
    }
  });

  it('admin view requires authentication (401) and permission (403)', async () => {
    await request(app.getHttpServer()).get('/api/admin/homepage').expect(401);
    await request(app.getHttpServer())
      .get('/api/admin/homepage')
      .set('Cookie', staffCookie)
      .expect(403);
    await request(app.getHttpServer())
      .get('/api/admin/homepage')
      .set('Cookie', ownerCookie)
      .expect(200);
  });

  it('rejects an unknown section key (404)', async () => {
    await request(app.getHttpServer())
      .put('/api/admin/homepage/not-a-section')
      .set('Cookie', ownerCookie)
      .send({ title: 'x' })
      .expect(404);
  });

  it('rejects invalid section content (400)', async () => {
    // missing required `title`
    await request(app.getHttpServer())
      .put('/api/admin/homepage/hero')
      .set('Cookie', ownerCookie)
      .send({ image: '/x.jpg', imageAlt: 'x' })
      .expect(400);

    // unknown property (forbidNonWhitelisted)
    await request(app.getHttpServer())
      .put('/api/admin/homepage/reviews')
      .set('Cookie', ownerCookie)
      .send({ title: 'Guest Stories', bogus: true })
      .expect(400);

    // bad nested enum
    await request(app.getHttpServer())
      .put('/api/admin/homepage/eventsShowcase')
      .set('Cookie', ownerCookie)
      .send({
        title: 'Events',
        image: '/img.jpg',
        imageAlt: 'Events',
        features: [{ id: 'a', title: 'A', iconKey: 'nope' }],
      })
      .expect(400);
  });

  it('STAFF cannot write homepage content (403)', async () => {
    await request(app.getHttpServer())
      .put('/api/admin/homepage/reviews')
      .set('Cookie', staffCookie)
      .send({ title: 'Nope' })
      .expect(403);
  });

  it('owner updates a section and the public bundle reflects it', async () => {
    await request(app.getHttpServer())
      .put('/api/admin/homepage/reviews')
      .set('Cookie', ownerCookie)
      .send({
        enabled: true,
        eyebrow: 'E2E Guest Stories',
        title: 'E2E moments',
        accentTitle: 'stay with you.',
        description: 'E2E description.',
        cta: { label: 'Read more', href: '/reviews' },
      })
      .expect(200);

    const pub = await request(app.getHttpServer())
      .get('/api/public/homepage')
      .expect(200);
    expect(pub.body.reviews.eyebrow).toBe('E2E Guest Stories');
    expect(pub.body.reviews.cta.href).toBe('/reviews');
  });

  it('unpublishing a section removes it from the public bundle but keeps it in the admin view', async () => {
    await request(app.getHttpServer())
      .patch('/api/admin/homepage/reviews/publish')
      .set('Cookie', ownerCookie)
      .send({ isPublished: false })
      .expect(200);

    const pub = await request(app.getHttpServer())
      .get('/api/public/homepage')
      .expect(200);
    expect(pub.body.reviews).toBeNull();

    const admin = await request(app.getHttpServer())
      .get('/api/admin/homepage')
      .set('Cookie', ownerCookie)
      .expect(200);
    expect(admin.body.reviews.isPublished).toBe(false);
    expect(admin.body.reviews.value.title).toBe('E2E moments');
  });

  it('every seeded section round-trips through its PUT validator (200)', async () => {
    const admin = await request(app.getHttpServer())
      .get('/api/admin/homepage')
      .set('Cookie', ownerCookie)
      .expect(200);

    for (const key of KEYS) {
      const value = admin.body[key]?.value;
      if (!value) continue; // section may have been cleared by an earlier test
      await request(app.getHttpServer())
        .put(`/api/admin/homepage/${key}`)
        .set('Cookie', ownerCookie)
        .send(value)
        .expect(200);
    }
  });

  it('publish toggle 404s when the section has no saved content', async () => {
    await prisma.homepageSection.deleteMany({ where: { key: 'location' } });
    await request(app.getHttpServer())
      .patch('/api/admin/homepage/location/publish')
      .set('Cookie', ownerCookie)
      .send({ isPublished: false })
      .expect(404);
  });
});
