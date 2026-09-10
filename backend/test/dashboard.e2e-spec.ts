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

const OWNER = 'e2e.dashboard.owner@harmony.test';
const NOPERM = 'e2e.dashboard.noperm@harmony.test';
const PW = 'E2ePassw0rd!!';

describe('Dashboard metrics (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let ownerCookie = '';
  let noPermCookie = '';

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
    for (const email of [OWNER, NOPERM]) {
      await prisma.session.deleteMany({ where: { admin: { email } } });
      await prisma.adminUserPermission.deleteMany({
        where: { admin: { email } },
      });
      await prisma.adminUser.deleteMany({ where: { email } });
    }
    await prisma.adminUser.create({
      data: {
        email: OWNER,
        name: 'E2E Dashboard Owner',
        role: 'SUPER_ADMIN',
        passwordHash: await passwords.hash(PW),
      },
    });
    // Every role carries dashboard.read by default, so revoke it for this user
    // with a per-user override (granted=false removes it).
    const noPerm = await prisma.adminUser.create({
      data: {
        email: NOPERM,
        name: 'E2E Dashboard NoPerm',
        role: 'STAFF',
        passwordHash: await passwords.hash(PW),
      },
    });
    const perm = await prisma.permission.findUnique({
      where: { key: 'dashboard.read' },
    });
    if (!perm) throw new Error('dashboard.read permission not seeded');
    await prisma.adminUserPermission.create({
      data: {
        adminUserId: noPerm.id,
        permissionId: perm.id,
        granted: false,
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
    noPermCookie = await login(NOPERM);
  });

  afterAll(async () => {
    for (const email of [OWNER, NOPERM]) {
      await prisma.session.deleteMany({ where: { admin: { email } } });
      await prisma.adminUserPermission.deleteMany({
        where: { admin: { email } },
      });
      await prisma.adminUser.deleteMany({ where: { email } });
    }
    await app.close();
  });

  it('requires authentication (401) and dashboard.read (403)', async () => {
    await request(app.getHttpServer()).get('/api/admin/dashboard').expect(401);
    await request(app.getHttpServer())
      .get('/api/admin/dashboard')
      .set('Cookie', noPermCookie)
      .expect(403);
    await request(app.getHttpServer())
      .get('/api/admin/dashboard')
      .set('Cookie', ownerCookie)
      .expect(200);
  });

  it('returns a well-formed summary', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/admin/dashboard')
      .set('Cookie', ownerCookie)
      .expect(200);

    const b = res.body;
    expect(typeof b.generatedAt).toBe('string');

    // Every enum key is present and zero-filled.
    for (const k of ['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED']) {
      expect(typeof b.reservations.byStatus[k]).toBe('number');
    }
    for (const k of [
      'NEW',
      'CONTACTED',
      'PENDING',
      'APPROVED',
      'REJECTED',
      'CANCELLED',
      'COMPLETED',
    ]) {
      expect(typeof b.enquiries.byStatus[k]).toBe('number');
    }
    for (const k of ['PENDING', 'APPROVED', 'REJECTED']) {
      expect(typeof b.reviews.byStatus[k]).toBe('number');
    }

    expect(b.reservations.pending).toBe(b.reservations.byStatus.PENDING);
    expect(b.enquiries.open).toBe(
      b.enquiries.byStatus.NEW +
        b.enquiries.byStatus.CONTACTED +
        b.enquiries.byStatus.PENDING,
    );
    expect(
      b.reviews.averageRating === null ||
        (b.reviews.averageRating >= 1 && b.reviews.averageRating <= 5),
    ).toBe(true);

    expect(b.content.menuItems.published).toBeLessThanOrEqual(
      b.content.menuItems.total,
    );
    expect(b.content.galleryItems.published).toBeLessThanOrEqual(
      b.content.galleryItems.total,
    );
    expect(typeof b.notifications.unread).toBe('number');
    expect(Array.isArray(b.activity.recentAudit)).toBe(true);
    expect(b.activity.recentAudit.length).toBeLessThanOrEqual(8);
  });
});
