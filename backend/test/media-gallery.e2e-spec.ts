import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Logger as PinoLogger } from 'nestjs-pino';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PasswordService } from '../src/auth/password.service';
import type { AppConfig } from '../src/config/configuration';

const OWNER = 'e2e.media.owner@harmony.test';
const STAFF = 'e2e.media.staff@harmony.test';
const PW = 'E2ePassw0rd!!';
const SAMPLE_IMG = resolve(
  __dirname,
  '../../frontend/public/images/home/harmony-hero-restaurant.jpg',
);

describe('Media + Gallery (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let ownerCookie = '';
  let staffCookie = '';
  const mediaIds: string[] = [];
  const galleryIds: string[] = [];

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>({
      bufferLogs: true,
    });
    app.useLogger(app.get(PinoLogger));
    const config = app.get(ConfigService<AppConfig, true>);
    app.setGlobalPrefix('api');
    app.use(cookieParser(config.get('session', { infer: true }).secret));
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
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
        name: 'Owner',
        role: 'SUPER_ADMIN',
        passwordHash: await passwords.hash(PW),
      },
    });
    await prisma.adminUser.create({
      data: {
        email: STAFF,
        name: 'Staff',
        role: 'STAFF',
        passwordHash: await passwords.hash(PW),
      },
    });
    const login = async (email: string) =>
      (
        await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ email, password: PW })
          .expect(200)
      ).headers['set-cookie'][0].split(';')[0];
    ownerCookie = await login(OWNER);
    staffCookie = await login(STAFF);
  });

  afterAll(async () => {
    for (const id of galleryIds) {
      await prisma.galleryItem.deleteMany({ where: { id } });
    }
    for (const id of mediaIds) {
      await prisma.media.deleteMany({ where: { id } });
    }
    for (const email of [OWNER, STAFF]) {
      await prisma.session.deleteMany({ where: { admin: { email } } });
      await prisma.adminUser.deleteMany({ where: { email } });
    }
    await app.close();
  });

  it('uploads an image, validates it and stores metadata', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/admin/media')
      .set('Cookie', ownerCookie)
      .field('folder', 'e2e')
      .field('altText', 'e2e image')
      .attach('file', SAMPLE_IMG)
      .expect(201);
    expect(res.body.width).toBeGreaterThan(0);
    expect(res.body.mimeType).toBe('image/jpeg');
    expect(res.body.url).toContain('/media/e2e/');
    mediaIds.push(res.body.id);
  });

  it('rejects a non-image upload with 400', async () => {
    await request(app.getHttpServer())
      .post('/api/admin/media')
      .set('Cookie', ownerCookie)
      .attach('file', Buffer.from('definitely not an image'), 'fake.jpg')
      .expect(400);
  });

  it('STAFF may not upload (403) but may read (200)', async () => {
    await request(app.getHttpServer())
      .post('/api/admin/media')
      .set('Cookie', staffCookie)
      .attach('file', SAMPLE_IMG)
      .expect(403);
    await request(app.getHttpServer())
      .get('/api/admin/gallery')
      .set('Cookie', staffCookie)
      .expect(200);
  });

  it('publishes a gallery item and it appears in the public gallery', async () => {
    const up = await request(app.getHttpServer())
      .post('/api/admin/media')
      .set('Cookie', ownerCookie)
      .field('folder', 'e2e')
      .field('altText', 'gallery src')
      .attach('file', SAMPLE_IMG)
      .expect(201);
    mediaIds.push(up.body.id);

    const item = await request(app.getHttpServer())
      .post('/api/admin/gallery')
      .set('Cookie', ownerCookie)
      .send({
        mediaId: up.body.id,
        title: 'E2E Shot',
        altText: 'e2e shot alt',
        category: 'SPACES',
      })
      .expect(201);
    galleryIds.push(item.body.id);

    let pub = await request(app.getHttpServer()).get('/api/public/gallery');
    expect(pub.body.some((x: { id: string }) => x.id === item.body.id)).toBe(
      false,
    );

    await request(app.getHttpServer())
      .post(`/api/admin/gallery/${item.body.id}/publish`)
      .set('Cookie', ownerCookie)
      .expect(200);

    pub = await request(app.getHttpServer()).get(
      '/api/public/gallery?category=SPACES',
    );
    const found = pub.body.find(
      (x: { id: string }) => x.id === item.body.id,
    );
    expect(found?.image).toBe(up.body.url);
    expect(found?.alt).toBe('e2e shot alt');
  });

  it('will not delete media that is still referenced (409)', async () => {
    const up = await request(app.getHttpServer())
      .post('/api/admin/media')
      .set('Cookie', ownerCookie)
      .field('folder', 'e2e')
      .field('altText', 'ref')
      .attach('file', SAMPLE_IMG)
      .expect(201);
    const item = await request(app.getHttpServer())
      .post('/api/admin/gallery')
      .set('Cookie', ownerCookie)
      .send({
        mediaId: up.body.id,
        title: 'Ref Photo',
        altText: 'ref alt photo',
        category: 'DINING',
      })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/api/admin/media/${up.body.id}`)
      .set('Cookie', ownerCookie)
      .expect(409);

    await request(app.getHttpServer())
      .delete(`/api/admin/gallery/${item.body.id}`)
      .set('Cookie', ownerCookie)
      .expect(200);
    await request(app.getHttpServer())
      .delete(`/api/admin/media/${up.body.id}`)
      .set('Cookie', ownerCookie)
      .expect(200);
  });
});
