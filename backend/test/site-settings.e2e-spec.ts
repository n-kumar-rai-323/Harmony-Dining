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

const OWNER = 'e2e.sitesettings.owner@harmony.test';
const STAFF = 'e2e.sitesettings.staff@harmony.test';
const PW = 'E2ePassw0rd!!';

describe('Site settings (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let ownerCookie = '';
  let staffCookie = '';
  const original: Record<string, unknown> = {};

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
        name: 'E2E Settings Owner',
        role: 'SUPER_ADMIN',
        passwordHash: await passwords.hash(PW),
      },
    });
    await prisma.adminUser.create({
      data: {
        email: STAFF,
        name: 'E2E Settings Staff',
        role: 'STAFF',
        passwordHash: await passwords.hash(PW),
      },
    });

    for (const key of ['business', 'hours', 'social']) {
      const row = await prisma.siteSetting.findUnique({ where: { key } });
      original[key] = row ? row.value : undefined;
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
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) {
        await prisma.siteSetting.deleteMany({ where: { key } });
      } else {
        await prisma.siteSetting.upsert({
          where: { key },
          update: { value: value as never },
          create: { key, value: value as never },
        });
      }
    }
    for (const email of [OWNER, STAFF]) {
      await prisma.session.deleteMany({ where: { admin: { email } } });
      await prisma.adminUser.deleteMany({ where: { email } });
    }
    await app.close();
  });

  it('public site bundle is open and cache-friendly', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/public/site')
      .expect(200);
    expect(res.headers['cache-control']).toContain('s-maxage');
    expect(res.body.business).toBeDefined();
    expect(Array.isArray(res.body.hours)).toBe(true);
    expect(Array.isArray(res.body.social)).toBe(true);
  });

  it('admin settings require authentication (401) and permission (403)', async () => {
    await request(app.getHttpServer())
      .get('/api/admin/site-settings')
      .expect(401);
    await request(app.getHttpServer())
      .get('/api/admin/site-settings')
      .set('Cookie', staffCookie)
      .expect(403);
    await request(app.getHttpServer())
      .get('/api/admin/site-settings')
      .set('Cookie', ownerCookie)
      .expect(200);
  });

  it('rejects an invalid social link (400) and out-of-range coordinates (400)', async () => {
    await request(app.getHttpServer())
      .put('/api/admin/site-settings/social')
      .set('Cookie', ownerCookie)
      .send({ links: [{ platform: 'facebook', label: 'FB', href: 'not-a-url' }] })
      .expect(400);

    await request(app.getHttpServer())
      .put('/api/admin/site-settings/business')
      .set('Cookie', ownerCookie)
      .send({
        name: 'Harmony',
        phone: '+977 1 5555555',
        email: 'hi@harmony.test',
        addressLines: ['Kumaripati'],
        latitude: 999,
        longitude: 85.31,
        mapHref: '/#location',
      })
      .expect(400);
  });

  it('STAFF cannot write settings (403)', async () => {
    await request(app.getHttpServer())
      .put('/api/admin/site-settings/hours')
      .set('Cookie', staffCookie)
      .send({ entries: [{ label: 'Daily', value: '9–5' }] })
      .expect(403);
  });

  it('owner updates social + hours and the public bundle reflects it', async () => {
    await request(app.getHttpServer())
      .put('/api/admin/site-settings/social')
      .set('Cookie', ownerCookie)
      .send({
        links: [
          {
            platform: 'instagram',
            label: 'Instagram',
            href: 'https://instagram.com/harmony-e2e',
            brandColor: '#E1306C',
          },
        ],
      })
      .expect(200);

    await request(app.getHttpServer())
      .put('/api/admin/site-settings/hours')
      .set('Cookie', ownerCookie)
      .send({ entries: [{ label: 'E2E Days', value: '11:00 – 23:00' }] })
      .expect(200);

    const pub = await request(app.getHttpServer())
      .get('/api/public/site')
      .expect(200);
    expect(pub.body.social).toHaveLength(1);
    expect(pub.body.social[0].href).toBe('https://instagram.com/harmony-e2e');
    expect(pub.body.hours[0].label).toBe('E2E Days');
  });
});
