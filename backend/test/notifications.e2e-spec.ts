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

const A = 'e2e.notif.a@harmony.test';
const B = 'e2e.notif.b@harmony.test';
const PW = 'E2ePassw0rd!!';
const TAG = `e2e_notif_${Date.now()}`;

describe('Notifications API (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let aCookie = '';
  let bCookie = '';
  let sysId = '';
  let reviewId = '';

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
    for (const email of [A, B]) {
      await prisma.session.deleteMany({ where: { admin: { email } } });
      await prisma.adminUser.deleteMany({ where: { email } });
    }
    for (const email of [A, B]) {
      await prisma.adminUser.create({
        data: {
          email,
          name: `E2E Notif ${email}`,
          role: 'MANAGER',
          passwordHash: await passwords.hash(PW),
        },
      });
    }

    const sys = await prisma.notification.create({
      data: { type: 'SYSTEM', title: `${TAG} system`, message: 'hello' },
    });
    const review = await prisma.notification.create({
      data: { type: 'REVIEW_CREATED', title: `${TAG} review`, message: 'x' },
    });
    sysId = sys.id;
    reviewId = review.id;

    const login = async (email: string) => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password: PW })
        .expect(200);
      return res.headers['set-cookie'][0].split(';')[0];
    };
    aCookie = await login(A);
    bCookie = await login(B);
  });

  afterAll(async () => {
    await prisma.notification.deleteMany({
      where: { title: { startsWith: TAG } },
    });
    for (const email of [A, B]) {
      await prisma.session.deleteMany({ where: { admin: { email } } });
      await prisma.adminUser.deleteMany({ where: { email } });
    }
    await app.close();
  });

  const ids = (body: { items: { id: string }[] }) =>
    body.items.map((i) => i.id);

  it('requires authentication (401)', async () => {
    await request(app.getHttpServer())
      .get('/api/admin/notifications')
      .expect(401);
  });

  it('lists newest-first with read state and an unreadCount', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/admin/notifications?pageSize=100')
      .set('Cookie', aCookie)
      .expect(200);

    expect(typeof res.body.unreadCount).toBe('number');
    const mine = res.body.items.filter((i: { id: string }) =>
      [sysId, reviewId].includes(i.id),
    );
    expect(mine).toHaveLength(2);
    expect(mine.every((i: { read: boolean }) => i.read === false)).toBe(true);
    // review was created after system -> appears earlier
    expect(ids(res.body).indexOf(reviewId)).toBeLessThan(
      ids(res.body).indexOf(sysId),
    );
  });

  it('filters by type', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/admin/notifications?type=SYSTEM&pageSize=100')
      .set('Cookie', aCookie)
      .expect(200);
    expect(ids(res.body)).toContain(sysId);
    expect(ids(res.body)).not.toContain(reviewId);
  });

  it('mark-read is per-admin', async () => {
    await request(app.getHttpServer())
      .get('/api/admin/notifications/unread-count')
      .set('Cookie', aCookie)
      .expect(200)
      .expect((r) => expect(typeof r.body.unreadCount).toBe('number'));

    await request(app.getHttpServer())
      .post(`/api/admin/notifications/${sysId}/read`)
      .set('Cookie', aCookie)
      .expect(200)
      .expect((r) => expect(r.body).toEqual({ id: sysId, read: true }));

    // A sees it read; B still sees it unread.
    const aList = await request(app.getHttpServer())
      .get('/api/admin/notifications?type=SYSTEM&pageSize=100')
      .set('Cookie', aCookie)
      .expect(200);
    expect(aList.body.items.find((i: { id: string }) => i.id === sysId).read).toBe(
      true,
    );

    const bList = await request(app.getHttpServer())
      .get('/api/admin/notifications?type=SYSTEM&pageSize=100')
      .set('Cookie', bCookie)
      .expect(200);
    expect(bList.body.items.find((i: { id: string }) => i.id === sysId).read).toBe(
      false,
    );
  });

  it('unreadOnly hides what the caller has already read', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/admin/notifications?unreadOnly=true&pageSize=100')
      .set('Cookie', aCookie)
      .expect(200);
    expect(ids(res.body)).not.toContain(sysId);
    expect(ids(res.body)).toContain(reviewId);
  });

  it('read-all marks the caller’s remaining notifications; 404 for an unknown id', async () => {
    await request(app.getHttpServer())
      .post('/api/admin/notifications/read-all')
      .set('Cookie', aCookie)
      .expect(200)
      .expect((r) => expect(r.body.marked).toBeGreaterThanOrEqual(1));

    // Other suites run in parallel and emit notifications, so assert only on
    // this suite's rows rather than an absolute empty feed.
    const res = await request(app.getHttpServer())
      .get('/api/admin/notifications?unreadOnly=true&pageSize=100')
      .set('Cookie', aCookie)
      .expect(200);
    expect(ids(res.body)).not.toContain(sysId);
    expect(ids(res.body)).not.toContain(reviewId);

    await request(app.getHttpServer())
      .post('/api/admin/notifications/does-not-exist/read')
      .set('Cookie', aCookie)
      .expect(404);
  });
});
