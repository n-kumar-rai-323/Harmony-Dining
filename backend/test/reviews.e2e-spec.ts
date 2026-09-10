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

const OWNER = 'e2e.reviews.owner@harmony.test';
const STAFF = 'e2e.reviews.staff@harmony.test';
const PW = 'E2ePassw0rd!!';

describe('Reviews (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let ownerCookie = '';
  let staffCookie = '';
  const createdIds: string[] = [];

  const track = (id: string) => {
    if (id) createdIds.push(id);
    return id;
  };

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
        name: 'E2E Reviews Owner',
        role: 'SUPER_ADMIN',
        passwordHash: await passwords.hash(PW),
      },
    });
    await prisma.adminUser.create({
      data: {
        email: STAFF,
        name: 'E2E Reviews Staff',
        role: 'STAFF',
        passwordHash: await passwords.hash(PW),
      },
    });

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
    if (createdIds.length) {
      await prisma.review.deleteMany({ where: { id: { in: createdIds } } });
    }
    for (const email of [OWNER, STAFF]) {
      await prisma.session.deleteMany({ where: { admin: { email } } });
      await prisma.adminUser.deleteMany({ where: { email } });
    }
    await app.close();
  });

  // The public submit route is deliberately throttled (5 / 10 min), so most
  // tests seed rows straight through Prisma and only a couple exercise HTTP.
  const seed = async (over: Record<string, unknown> = {}) => {
    const row = await prisma.review.create({
      data: {
        name: 'E2E Guest',
        rating: 5,
        comment: 'A wonderful evening, thank you.',
        status: 'PENDING',
        source: 'WEBSITE',
        ...over,
      },
    });
    return track(row.id);
  };

  it('public submission over HTTP lands as PENDING and is not publicly visible', async () => {
    await request(app.getHttpServer())
      .post('/api/public/reviews')
      .send({
        name: 'E2E HTTP Guest',
        rating: 5,
        comment: 'Booked online and left this note.',
      })
      .expect(201)
      .expect((res) => expect(res.body.status).toBe('PENDING'));

    const row = await prisma.review.findFirst({
      where: { name: 'E2E HTTP Guest' },
      orderBy: { createdAt: 'desc' },
    });
    track(row!.id);
    expect(row?.status).toBe('PENDING');
    expect(row?.isPublished).toBe(false);
    expect(row?.source).toBe('WEBSITE');

    const featured = await request(app.getHttpServer())
      .get('/api/public/reviews/featured')
      .expect(200);
    expect(featured.body.some((r: { id: string }) => r.id === row!.id)).toBe(
      false,
    );
    expect(featured.headers['cache-control']).toContain('s-maxage');
  });

  it('rejects an out-of-range rating (400)', async () => {
    await request(app.getHttpServer())
      .post('/api/public/reviews')
      .send({ name: 'Bad Rating', rating: 6, comment: 'too many stars' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/public/reviews')
      .send({ name: 'Bad Rating', rating: 0, comment: 'no stars' })
      .expect(400);
  });

  it('admin review list requires authentication (401) then permission', async () => {
    await request(app.getHttpServer()).get('/api/admin/reviews').expect(401);
    // STAFF holds reviews.read
    await request(app.getHttpServer())
      .get('/api/admin/reviews')
      .set('Cookie', staffCookie)
      .expect(200);
  });

  it('STAFF cannot moderate (403)', async () => {
    const id = await seed({ name: 'E2E Staff Block' });
    await request(app.getHttpServer())
      .post(`/api/admin/reviews/${id}/approve`)
      .set('Cookie', staffCookie)
      .expect(403);
  });

  it('cannot feature a review before it is published (400)', async () => {
    const id = await seed({ name: 'E2E Feature Guard' });
    await request(app.getHttpServer())
      .post(`/api/admin/reviews/${id}/approve`)
      .set('Cookie', ownerCookie)
      .expect(200);
    await request(app.getHttpServer())
      .post(`/api/admin/reviews/${id}/feature`)
      .set('Cookie', ownerCookie)
      .expect(400);
  });

  it('approve -> publish -> feature makes a review appear in the public feed', async () => {
    const id = await seed({ name: 'E2E Happy Guest', role: 'Birthday guest' });

    let featured = await request(app.getHttpServer()).get(
      '/api/public/reviews/featured',
    );
    expect(featured.body.some((r: { id: string }) => r.id === id)).toBe(false);

    for (const step of ['approve', 'publish', 'feature']) {
      await request(app.getHttpServer())
        .post(`/api/admin/reviews/${id}/${step}`)
        .set('Cookie', ownerCookie)
        .expect(200);
    }

    featured = await request(app.getHttpServer())
      .get('/api/public/reviews/featured')
      .expect(200);
    const mine = featured.body.find((r: { id: string }) => r.id === id);
    expect(mine).toBeDefined();
    expect(mine.name).toBe('E2E Happy Guest');
    expect(mine.role).toBe('Birthday guest');
    expect(mine.comment).toBeDefined();
    expect(mine.ip).toBeUndefined();

    const list = await request(app.getHttpServer())
      .get('/api/public/reviews')
      .expect(200);
    expect(list.body.items.some((r: { id: string }) => r.id === id)).toBe(true);
  });

  it('unpublishing a featured review also drops it from the featured feed', async () => {
    const id = await seed({ name: 'E2E Toggle Guest' });
    for (const step of ['approve', 'publish', 'feature']) {
      await request(app.getHttpServer())
        .post(`/api/admin/reviews/${id}/${step}`)
        .set('Cookie', ownerCookie)
        .expect(200);
    }
    await request(app.getHttpServer())
      .post(`/api/admin/reviews/${id}/unpublish`)
      .set('Cookie', ownerCookie)
      .expect(200);

    const row = await prisma.review.findUnique({ where: { id } });
    expect(row?.isPublished).toBe(false);
    expect(row?.isFeatured).toBe(false);

    const featured = await request(app.getHttpServer())
      .get('/api/public/reviews/featured')
      .expect(200);
    expect(featured.body.some((r: { id: string }) => r.id === id)).toBe(false);
  });

  it('rejecting a review keeps it non-public', async () => {
    const id = await seed({ name: 'E2E Reject Guest' });
    await request(app.getHttpServer())
      .post(`/api/admin/reviews/${id}/reject`)
      .set('Cookie', ownerCookie)
      .expect(200);
    const row = await prisma.review.findUnique({ where: { id } });
    expect(row?.status).toBe('REJECTED');
    // A rejected review cannot then be published.
    await request(app.getHttpServer())
      .post(`/api/admin/reviews/${id}/publish`)
      .set('Cookie', ownerCookie)
      .expect(400);
  });

  it('soft delete removes the review from admin + public views', async () => {
    const id = await seed({ name: 'E2E Delete Guest' });
    for (const step of ['approve', 'publish']) {
      await request(app.getHttpServer())
        .post(`/api/admin/reviews/${id}/${step}`)
        .set('Cookie', ownerCookie)
        .expect(200);
    }
    await request(app.getHttpServer())
      .delete(`/api/admin/reviews/${id}`)
      .set('Cookie', ownerCookie)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/admin/reviews/${id}`)
      .set('Cookie', ownerCookie)
      .expect(404);

    const list = await request(app.getHttpServer())
      .get('/api/public/reviews')
      .expect(200);
    expect(list.body.items.some((r: { id: string }) => r.id === id)).toBe(false);
  });

  it('admin can import a pre-approved review in one step', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/admin/reviews')
      .set('Cookie', ownerCookie)
      .send({
        name: 'E2E Imported',
        rating: 4,
        comment: 'Imported from Google reviews.',
        approve: true,
      })
      .expect(201);
    track(res.body.id);
    expect(res.body.status).toBe('APPROVED');
    expect(res.body.isPublished).toBe(true);
    expect(res.body.source).toBe('IMPORT');
  });
});
