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
import { ReservationsService } from '../src/reservations/reservations.service';
import type { AppConfig } from '../src/config/configuration';

const OWNER = 'e2e.resv.owner@harmony.test';
const STAFF = 'e2e.resv.staff@harmony.test';
const PW = 'E2ePassw0rd!!';

// A date safely inside the booking window (default: 2h lead, 60 days ahead).
function daysAhead(n: number): string {
  return new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);
}

describe('Reservations (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let ownerCookie = '';
  let staffCookie = '';
  const references: string[] = [];
  let originalSettings: Record<string, unknown> = {};

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

    // Remember the real settings so the suite leaves them untouched.
    const current = await request(app.getHttpServer())
      .get('/api/admin/reservations/settings')
      .set('Cookie', ownerCookie)
      .expect(200);
    const s = current.body as Record<string, unknown>;
    originalSettings = {
      openingTime: s.openingTime,
      closingTime: s.closingTime,
      slotDurationMinutes: s.slotDurationMinutes,
      maxGuestsPerReservation: s.maxGuestsPerReservation,
      capacityPerSlot: s.capacityPerSlot,
      leadTimeHours: s.leadTimeHours,
      maxAdvanceDays: s.maxAdvanceDays,
    };

    // Known values for the assertions below.
    await request(app.getHttpServer())
      .patch('/api/admin/reservations/settings')
      .set('Cookie', ownerCookie)
      .send({
        openingTime: '10:00',
        closingTime: '22:00',
        slotDurationMinutes: 60,
        maxGuestsPerReservation: 20,
        capacityPerSlot: 10,
        leadTimeHours: 2,
        maxAdvanceDays: 60,
      })
      .expect(200);
  });

  afterAll(async () => {
    if (references.length) {
      await prisma.reservation.deleteMany({
        where: { reference: { in: references } },
      });
    }
    await request(app.getHttpServer())
      .patch('/api/admin/reservations/settings')
      .set('Cookie', ownerCookie)
      .send(originalSettings)
      .expect(200);
    for (const email of [OWNER, STAFF]) {
      await prisma.session.deleteMany({ where: { admin: { email } } });
      await prisma.adminUser.deleteMany({ where: { email } });
    }
    await app.close();
  });

  it('rejects a malformed phone number (400)', () =>
    request(app.getHttpServer())
      .post('/api/public/reservations')
      .send({
        fullName: 'Test Guest',
        phone: '12345',
        date: daysAhead(9),
        time: '19:00',
        guests: 2,
      })
      .expect(400));

  it('unauthenticated admin access is rejected (401)', () =>
    request(app.getHttpServer())
      .get('/api/admin/reservations')
      .expect(401));

  it('availability lists slots and reflects a booking', async () => {
    const date = daysAhead(11);
    const before = await request(app.getHttpServer())
      .get(`/api/public/reservations/availability?date=${date}`)
      .expect(200);
    expect(before.body.open).toBe(true);
    const slot = before.body.slots.find(
      (x: { time: string }) => x.time === '19:00',
    );
    expect(slot).toBeTruthy();
    expect(slot.booked).toBe(0);

    const created = await request(app.getHttpServer())
      .post('/api/public/reservations')
      .send({
        fullName: 'Availability Guest',
        phone: '9812345678',
        date,
        time: '19:00',
        guests: 4,
      })
      .expect(201);
    expect(created.body.reference).toMatch(/^HR-/);
    expect(created.body.status).toBe('PENDING');
    references.push(created.body.reference);

    const after = await request(app.getHttpServer())
      .get(`/api/public/reservations/availability?date=${date}`)
      .expect(200);
    const slotAfter = after.body.slots.find(
      (x: { time: string }) => x.time === '19:00',
    );
    expect(slotAfter.booked).toBe(4);
    expect(slotAfter.remaining).toBe(6);
  });

  it('admin sees the request, STAFF confirms it, invalid transition is refused', async () => {
    const date = daysAhead(12);
    const created = await request(app.getHttpServer())
      .post('/api/public/reservations')
      .send({
        fullName: 'Workflow Guest',
        phone: '+977-9800000011',
        date,
        time: '20:00',
        guests: 2,
      })
      .expect(201);
    const ref: string = created.body.reference;
    references.push(ref);

    const list = await request(app.getHttpServer())
      .get(`/api/admin/reservations?search=${ref}`)
      .set('Cookie', staffCookie)
      .expect(200);
    expect(list.body.items).toHaveLength(1);
    const id: string = list.body.items[0].id;

    await request(app.getHttpServer())
      .post(`/api/admin/reservations/${id}/confirm`)
      .set('Cookie', staffCookie)
      .send({ note: 'Table 7' })
      .expect(200);

    const detail = await request(app.getHttpServer())
      .get(`/api/admin/reservations/${id}`)
      .set('Cookie', staffCookie)
      .expect(200);
    expect(detail.body.status).toBe('CONFIRMED');
    expect(detail.body.history.length).toBeGreaterThanOrEqual(2);

    const audit = await prisma.auditLog.findFirst({
      where: { entityType: 'Reservation', entityId: id, action: 'reservation.confirmed' },
    });
    expect(audit).toBeTruthy();

    // CONFIRMED -> PENDING is not a legal move.
    await request(app.getHttpServer())
      .post(`/api/admin/reservations/${id}/confirm`)
      .set('Cookie', staffCookie)
      .expect(400);
  });

  it('never overbooks a slot under concurrent requests', async () => {
    // Driven through the service directly so the per-IP public rate limit
    // does not cap the number of parallel attempts before the advisory
    // lock is exercised.
    const service = app.get(ReservationsService);
    const date = daysAhead(20);
    const time = '18:00';

    // capacityPerSlot is 10; 6 parallel requests of 3 guests = 18 requested.
    const attempts = Array.from({ length: 6 }, (_, i) =>
      service.createPublic(
        {
          fullName: `Rush ${i}`,
          phone: '9843000000',
          date,
          time,
          guests: 3,
        },
        { ip: null },
      ),
    );
    const results = await Promise.allSettled(attempts);

    const accepted = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');
    for (const r of accepted) {
      if (r.status === 'fulfilled') references.push(r.value.reference);
    }

    // 3 fit (9 <= 10); a 4th would be 12 > 10.
    expect(accepted).toHaveLength(3);
    expect(rejected).toHaveLength(3);

    const agg = await prisma.reservation.aggregate({
      _sum: { guests: true },
      where: {
        date: new Date(date),
        time,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });
    expect(agg._sum.guests ?? 0).toBeLessThanOrEqual(10);
  });
});
