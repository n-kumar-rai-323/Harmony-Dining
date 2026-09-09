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

const OWNER = 'e2e.events.owner@harmony.test';
const STAFF = 'e2e.events.staff@harmony.test';
const PW = 'E2ePassw0rd!!';

describe('Events (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let ownerCookie = '';
  let staffCookie = '';
  const eventIds: string[] = [];

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication({ bufferLogs: true });
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
    for (const id of eventIds) {
      await prisma.eventMedia.deleteMany({ where: { eventId: id } });
      await prisma.event.deleteMany({ where: { id } });
    }
    for (const email of [OWNER, STAFF]) {
      await prisma.session.deleteMany({ where: { admin: { email } } });
      await prisma.adminUser.deleteMany({ where: { email } });
    }
    await app.close();
  });

  it('rejects a bad time format (400)', () =>
    request(app.getHttpServer())
      .post('/api/admin/events')
      .set('Cookie', ownerCookie)
      .send({
        title: 'Bad Time',
        category: 'Party',
        summary: 'x'.repeat(5),
        eventDate: '2026-01-01',
        startTime: '9am',
      })
      .expect(400));

  it('draft event is hidden, publish makes it visible by slug and by list', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/admin/events')
      .set('Cookie', ownerCookie)
      .send({
        title: 'E2E Gala Night',
        category: 'Gala',
        summary: 'An e2e test gala evening.',
        eventDate: '2020-05-01',
        lifecycle: 'COMPLETED',
      })
      .expect(201);
    eventIds.push(created.body.id);
    expect(created.body.status).toBe('DRAFT');
    const slug = created.body.slug;

    await request(app.getHttpServer())
      .get(`/api/public/events/${slug}`)
      .expect(404);

    await request(app.getHttpServer())
      .post(`/api/admin/events/${created.body.id}/publish`)
      .set('Cookie', ownerCookie)
      .expect(200);

    const detail = await request(app.getHttpServer())
      .get(`/api/public/events/${slug}`)
      .expect(200);
    expect(detail.body.title).toBe('E2E Gala Night');
    expect(detail.body.date).toBe('2020-05-01');
    expect(detail.body.lifecycle).toBe('COMPLETED');

    const past = await request(app.getHttpServer())
      .get('/api/public/events?type=past')
      .expect(200);
    expect(past.body.some((e: { slug: string }) => e.slug === slug)).toBe(true);

    const upcoming = await request(app.getHttpServer())
      .get('/api/public/events?type=upcoming')
      .expect(200);
    expect(upcoming.body.some((e: { slug: string }) => e.slug === slug)).toBe(
      false,
    );
  });

  it('lifecycle change is validated and audited', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/admin/events')
      .set('Cookie', ownerCookie)
      .send({
        title: 'E2E Upcoming Show',
        category: 'Show',
        summary: 'Upcoming e2e show.',
        eventDate: '2099-12-31',
      })
      .expect(201);
    eventIds.push(created.body.id);

    await request(app.getHttpServer())
      .post(`/api/admin/events/${created.body.id}/lifecycle/BOGUS`)
      .set('Cookie', ownerCookie)
      .expect(400);

    await request(app.getHttpServer())
      .post(`/api/admin/events/${created.body.id}/lifecycle/cancelled`)
      .set('Cookie', ownerCookie)
      .expect(200);

    const log = await prisma.auditLog.findFirst({
      where: { entityType: 'Event', entityId: created.body.id, action: 'event.lifecycle' },
    });
    expect(log).toBeTruthy();
  });

  it('STAFF may read events but not create them', async () => {
    await request(app.getHttpServer())
      .get('/api/admin/events')
      .set('Cookie', staffCookie)
      .expect(200);
    await request(app.getHttpServer())
      .post('/api/admin/events')
      .set('Cookie', staffCookie)
      .send({
        title: 'nope',
        category: 'x',
        summary: 'nope nope',
        eventDate: '2026-01-01',
      })
      .expect(403);
  });
});
