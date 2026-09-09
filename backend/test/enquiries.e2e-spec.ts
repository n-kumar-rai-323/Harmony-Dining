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
import { EnquiriesService } from '../src/enquiries/enquiries.service';
import type { AppConfig } from '../src/config/configuration';

const OWNER = 'e2e.enq.owner@harmony.test';
const STAFF = 'e2e.enq.staff@harmony.test';
const PW = 'E2ePassw0rd!!';
const EVENT_DATE = '2031-06-15';

describe('Event enquiries (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let enquiries: EnquiriesService;
  let ownerCookie = '';
  let staffCookie = '';
  const references: string[] = [];
  let eventId = '';

  // Setup-only enquiries go straight through the service so the public
  // endpoint's per-IP rate limit does not bite mid-suite.
  async function seedEnquiry(over: Partial<Parameters<
    EnquiriesService['create']
  >[0]> = {}): Promise<string> {
    const created = await enquiries.create(
      {
        fullName: 'Seed Planner',
        phone: '9812345678',
        eventType: 'Seminar',
        preferredDate: '2031-04-01',
        guests: 60,
        ...over,
      },
      { ip: null },
    );
    references.push(created.reference);
    const row = await prisma.eventEnquiry.findUniqueOrThrow({
      where: { reference: created.reference },
    });
    return row.id;
  }

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
    enquiries = app.get(EnquiriesService);
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

    // A published event on EVENT_DATE — the conflict target.
    const created = await request(app.getHttpServer())
      .post('/api/admin/events')
      .set('Cookie', ownerCookie)
      .send({
        title: 'E2E Conflict Anchor',
        category: 'Wedding',
        summary: 'A published event used to detect enquiry date clashes.',
        eventDate: EVENT_DATE,
      })
      .expect(201);
    eventId = created.body.id;
    await request(app.getHttpServer())
      .post(`/api/admin/events/${eventId}/publish`)
      .set('Cookie', ownerCookie)
      .expect(200);
  });

  afterAll(async () => {
    if (references.length) {
      await prisma.eventEnquiry.deleteMany({
        where: { reference: { in: references } },
      });
    }
    if (eventId) {
      await prisma.eventMedia.deleteMany({ where: { eventId } });
      await prisma.event.deleteMany({ where: { id: eventId } });
    }
    for (const email of [OWNER, STAFF]) {
      await prisma.session.deleteMany({ where: { admin: { email } } });
      await prisma.adminUser.deleteMany({ where: { email } });
    }
    await app.close();
  });

  it('rejects a malformed phone number (400)', () =>
    request(app.getHttpServer())
      .post('/api/public/enquiries')
      .send({
        fullName: 'Bad Phone',
        phone: 'abc',
        eventType: 'Birthday',
        preferredDate: '2031-02-02',
        guests: 40,
      })
      .expect(400));

  it('creates an enquiry over HTTP, records history, and lists it', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/public/enquiries')
      .send({
        fullName: 'Flow Planner',
        phone: '+977 9812345678',
        email: 'planner@example.com',
        eventType: 'Anniversary',
        preferredDate: '2031-03-10',
        guests: 120,
        budget: '250000',
        requirements: 'Stage, projector, vegetarian menu.',
      })
      .expect(201);
    expect(res.body.reference).toMatch(/^EVT-/);
    expect(res.body.status).toBe('NEW');
    references.push(res.body.reference);

    const list = await request(app.getHttpServer())
      .get(`/api/admin/enquiries?search=${res.body.reference}`)
      .set('Cookie', staffCookie)
      .expect(200);
    expect(list.body.items).toHaveLength(1);
    const item = list.body.items[0];
    expect(item.hasConflict).toBe(false);
    expect(item.budget).toBe(250000);

    const detail = await request(app.getHttpServer())
      .get(`/api/admin/enquiries/${item.id}`)
      .set('Cookie', staffCookie)
      .expect(200);
    expect(detail.body.history).toHaveLength(1);
    expect(detail.body.conflicts.preferred.events).toHaveLength(0);
  });

  it('STAFF may read enquiries but not change their status', async () => {
    const id = await seedEnquiry({ preferredDate: '2031-04-02' });

    await request(app.getHttpServer())
      .get('/api/admin/enquiries')
      .set('Cookie', staffCookie)
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/admin/enquiries/${id}/status`)
      .set('Cookie', staffCookie)
      .send({ status: 'CONTACTED' })
      .expect(403);
  });

  it('validates status transitions and writes an audit record', async () => {
    const id = await seedEnquiry({ preferredDate: '2031-05-05' });

    // NEW -> COMPLETED is not allowed.
    await request(app.getHttpServer())
      .post(`/api/admin/enquiries/${id}/status`)
      .set('Cookie', ownerCookie)
      .send({ status: 'COMPLETED' })
      .expect(400);

    // NEW -> CONTACTED is.
    await request(app.getHttpServer())
      .post(`/api/admin/enquiries/${id}/status`)
      .set('Cookie', ownerCookie)
      .send({ status: 'CONTACTED', note: 'Called, left voicemail' })
      .expect(200);

    const detail = await request(app.getHttpServer())
      .get(`/api/admin/enquiries/${id}`)
      .set('Cookie', ownerCookie)
      .expect(200);
    expect(detail.body.status).toBe('CONTACTED');
    expect(detail.body.history).toHaveLength(2);

    const audit = await prisma.auditLog.findFirst({
      where: {
        entityType: 'EventEnquiry',
        entityId: id,
        action: 'enquiry.contacted',
      },
    });
    expect(audit).toBeTruthy();
  });

  it('flags a date clash with a published event', async () => {
    const id = await seedEnquiry({
      eventType: 'Wedding Reception',
      preferredDate: EVENT_DATE,
      guests: 300,
    });

    const detail = await request(app.getHttpServer())
      .get(`/api/admin/enquiries/${id}`)
      .set('Cookie', ownerCookie)
      .expect(200);
    expect(detail.body.conflicts.preferred.events.length).toBeGreaterThan(0);
    expect(detail.body.conflicts.preferred.events[0].slug).toBeTruthy();

    const list = await request(app.getHttpServer())
      .get(`/api/admin/enquiries?search=${detail.body.reference}`)
      .set('Cookie', ownerCookie)
      .expect(200);
    expect(list.body.items[0].hasConflict).toBe(true);

    const conflicts = await request(app.getHttpServer())
      .get(`/api/admin/enquiries/conflicts?date=${EVENT_DATE}`)
      .set('Cookie', ownerCookie)
      .expect(200);
    expect(conflicts.body.events.some((e: { id: string }) => e.id === eventId))
      .toBe(true);
  });
});
