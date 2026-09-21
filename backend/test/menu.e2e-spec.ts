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

const OWNER = 'e2e.menu.owner@harmony.test';
const STAFF = 'e2e.menu.staff@harmony.test';
const PW = 'E2ePassw0rd!!';

describe('Menu (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let ownerCookie = '';
  let staffCookie = '';
  let testMediaId = '';
  const createdCategoryIds: string[] = [];

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
        name: 'E2E Menu Owner',
        role: 'SUPER_ADMIN',
        passwordHash: await passwords.hash(PW),
      },
    });
    await prisma.adminUser.create({
      data: {
        email: STAFF,
        name: 'E2E Menu Staff',
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

    const media = await prisma.media.create({
      data: {
        storageKey: `e2e/menu-${Date.now()}.jpg`,
        url: 'https://example.test/e2e-menu.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 1,
        originalFilename: 'e2e-menu.jpg',
      },
    });
    testMediaId = media.id;
  });

  afterAll(async () => {
    for (const id of createdCategoryIds) {
      await prisma.menuItem.deleteMany({ where: { categoryId: id } });
      await prisma.menuCategory
        .delete({ where: { id } })
        .catch(() => undefined);
    }
    if (testMediaId) {
      await prisma.media.delete({ where: { id: testMediaId } }).catch(() => undefined);
    }
    for (const email of [OWNER, STAFF]) {
      await prisma.session.deleteMany({ where: { admin: { email } } });
      await prisma.adminUser.deleteMany({ where: { email } });
    }
    await app.close();
  });

  it('public menu is open and returns published categories only', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/public/menu')
      .expect(200);
    expect(Array.isArray(res.body.categories)).toBe(true);
    expect(res.headers['cache-control']).toContain('no-store');
  });

  it('rejects an item with no price / label / variant (400)', async () => {
    const cat = await request(app.getHttpServer())
      .post('/api/admin/menu/categories')
      .set('Cookie', ownerCookie)
      .send({ name: 'E2E Cat A', group: 'FOOD' })
      .expect(201);
    createdCategoryIds.push(cat.body.id);

    await request(app.getHttpServer())
      .post('/api/admin/menu/items')
      .set('Cookie', ownerCookie)
      .send({ categoryId: cat.body.id, name: 'No Price' })
      .expect(400);
  });

  it('draft -> publish makes an item appear in the public menu', async () => {
    const cat = await request(app.getHttpServer())
      .post('/api/admin/menu/categories')
      .set('Cookie', ownerCookie)
      .send({ name: 'E2E Cat B', group: 'BAR' })
      .expect(201);
    createdCategoryIds.push(cat.body.id);

    const item = await request(app.getHttpServer())
      .post('/api/admin/menu/items')
      .set('Cookie', ownerCookie)
      .send({ categoryId: cat.body.id, name: 'E2E Drink', price: 300, mediaId: testMediaId })
      .expect(201);
    expect(item.body.status).toBe('DRAFT');

    let pub = await request(app.getHttpServer()).get('/api/public/menu');
    expect(
      pub.body.categories.some((c: { id: string }) => c.id === cat.body.id),
    ).toBe(false);

    await request(app.getHttpServer())
      .post(`/api/admin/menu/categories/${cat.body.id}/publish`)
      .set('Cookie', ownerCookie)
      .expect(200);
    await request(app.getHttpServer())
      .post(`/api/admin/menu/items/${item.body.id}/publish`)
      .set('Cookie', ownerCookie)
      .expect(200);

    pub = await request(app.getHttpServer()).get('/api/public/menu');
    const found = pub.body.categories.find(
      (c: { id: string }) => c.id === cat.body.id,
    );
    expect(found?.items).toHaveLength(1);
    expect(found.items[0].name).toBe('E2E Drink');
  });

  it('enforces RBAC: STAFF may read but not create', async () => {
    await request(app.getHttpServer())
      .get('/api/admin/menu/categories')
      .set('Cookie', staffCookie)
      .expect(200);
    await request(app.getHttpServer())
      .post('/api/admin/menu/categories')
      .set('Cookie', staffCookie)
      .send({ name: 'nope', group: 'FOOD' })
      .expect(403);
  });

  it('writes an audit row for a menu change', async () => {
    const cat = await request(app.getHttpServer())
      .post('/api/admin/menu/categories')
      .set('Cookie', ownerCookie)
      .send({ name: 'E2E Cat C', group: 'FOOD' })
      .expect(201);
    createdCategoryIds.push(cat.body.id);

    const log = await prisma.auditLog.findFirst({
      where: { entityType: 'MenuCategory', entityId: cat.body.id },
    });
    expect(log?.action).toBe('menu_category.create');
    expect(log?.actorEmail).toBe(OWNER);
  });
});
