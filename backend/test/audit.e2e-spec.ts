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

const OWNER = 'e2e.audit.owner@harmony.test';
const STAFF = 'e2e.audit.staff@harmony.test';
const PW = 'E2ePassw0rd!!';

// Unique marker so this suite only ever sees its own rows.
const TAG = `e2e_audit_${Date.now()}`;

describe('Audit read API (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let ownerCookie = '';
  let staffCookie = '';

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
    const owner = await prisma.adminUser.create({
      data: {
        email: OWNER,
        name: 'E2E Audit Owner',
        role: 'SUPER_ADMIN',
        passwordHash: await passwords.hash(PW),
      },
    });
    await prisma.adminUser.create({
      data: {
        email: STAFF,
        name: 'E2E Audit Staff',
        role: 'STAFF',
        passwordHash: await passwords.hash(PW),
      },
    });

    const base = Date.parse('2024-01-01T00:00:00.000Z');
    await prisma.auditLog.createMany({
      data: [
        {
          actorId: owner.id,
          actorEmail: OWNER,
          action: `${TAG}.menu_item.update`,
          entityType: `${TAG}_MenuItem`,
          entityId: 'm1',
          createdAt: new Date(base),
        },
        {
          actorId: owner.id,
          actorEmail: OWNER,
          action: `${TAG}.menu_item.delete`,
          entityType: `${TAG}_MenuItem`,
          entityId: 'm2',
          createdAt: new Date(base + 60_000),
        },
        {
          actorId: owner.id,
          actorEmail: OWNER,
          action: `${TAG}.review.approve`,
          entityType: `${TAG}_Review`,
          entityId: 'r1',
          createdAt: new Date(base + 120_000),
        },
      ],
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
    await prisma.auditLog.deleteMany({ where: { action: { startsWith: TAG } } });
    for (const email of [OWNER, STAFF]) {
      await prisma.session.deleteMany({ where: { admin: { email } } });
      await prisma.adminUser.deleteMany({ where: { email } });
    }
    await app.close();
  });

  it('requires authentication (401) and audit.read (403 for STAFF)', async () => {
    await request(app.getHttpServer()).get('/api/admin/audit').expect(401);
    await request(app.getHttpServer())
      .get('/api/admin/audit')
      .set('Cookie', staffCookie)
      .expect(403);
    await request(app.getHttpServer())
      .get('/api/admin/audit')
      .set('Cookie', ownerCookie)
      .expect(200);
  });

  it('lists newest-first with a pagination envelope', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/admin/audit?search=${TAG}&pageSize=2`)
      .set('Cookie', ownerCookie)
      .expect(200);

    expect(res.body.total).toBe(3);
    expect(res.body.pageCount).toBe(2);
    expect(res.body.items).toHaveLength(2);
    expect(res.body.items[0].action).toBe(`${TAG}.review.approve`);
    // actor is joined
    expect(res.body.items[0].actor.email).toBe(OWNER);
  });

  it('filters by actionPrefix, entityType and date range', async () => {
    const byPrefix = await request(app.getHttpServer())
      .get(`/api/admin/audit?actionPrefix=${TAG}.menu_item.`)
      .set('Cookie', ownerCookie)
      .expect(200);
    expect(byPrefix.body.total).toBe(2);

    const byEntity = await request(app.getHttpServer())
      .get(`/api/admin/audit?entityType=${TAG}_Review`)
      .set('Cookie', ownerCookie)
      .expect(200);
    expect(byEntity.body.total).toBe(1);
    expect(byEntity.body.items[0].entityId).toBe('r1');

    const byDate = await request(app.getHttpServer())
      .get(
        `/api/admin/audit?search=${TAG}` +
          `&from=2024-01-01T00:00:30.000Z&to=2024-01-01T00:01:30.000Z`,
      )
      .set('Cookie', ownerCookie)
      .expect(200);
    expect(byDate.body.total).toBe(1);
    expect(byDate.body.items[0].action).toBe(`${TAG}.menu_item.delete`);
  });

  it('rejects a malformed date filter (400)', async () => {
    await request(app.getHttpServer())
      .get('/api/admin/audit?from=not-a-date')
      .set('Cookie', ownerCookie)
      .expect(400);
  });

  it('exposes facets and a single entry by id', async () => {
    const facets = await request(app.getHttpServer())
      .get('/api/admin/audit/facets')
      .set('Cookie', ownerCookie)
      .expect(200);
    const actionValues = facets.body.actions.map(
      (a: { value: string }) => a.value,
    );
    expect(actionValues).toEqual(
      expect.arrayContaining([`${TAG}.review.approve`]),
    );

    const list = await request(app.getHttpServer())
      .get(`/api/admin/audit?search=${TAG}`)
      .set('Cookie', ownerCookie)
      .expect(200);
    const id = list.body.items[0].id;

    const one = await request(app.getHttpServer())
      .get(`/api/admin/audit/${id}`)
      .set('Cookie', ownerCookie)
      .expect(200);
    expect(one.body.id).toBe(id);

    await request(app.getHttpServer())
      .get('/api/admin/audit/does-not-exist')
      .set('Cookie', ownerCookie)
      .expect(404);
  });
});
