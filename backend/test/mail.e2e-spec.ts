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
import { MailService } from '../src/mail/mail.service';
import type { AppConfig } from '../src/config/configuration';

const OWNER = 'e2e.mail.owner@harmony.test';
const STAFF = 'e2e.mail.staff@harmony.test';
const PW = 'E2ePassw0rd!!';
const RCPT = `e2e_mail_${Date.now()}@harmony.test`;

describe('Mail module (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let mail: MailService;
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
    mail = app.get(MailService);
    const passwords = app.get(PasswordService);
    for (const email of [OWNER, STAFF]) {
      await prisma.session.deleteMany({ where: { admin: { email } } });
      await prisma.adminUser.deleteMany({ where: { email } });
    }
    await prisma.adminUser.create({
      data: {
        email: OWNER,
        name: 'E2E Mail Owner',
        role: 'SUPER_ADMIN',
        passwordHash: await passwords.hash(PW),
      },
    });
    await prisma.adminUser.create({
      data: {
        email: STAFF,
        name: 'E2E Mail Staff',
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
    await prisma.mailLog.deleteMany({ where: { to: RCPT } });
    for (const email of [OWNER, STAFF]) {
      await prisma.session.deleteMany({ where: { admin: { email } } });
      await prisma.adminUser.deleteMany({ where: { email } });
    }
    await app.close();
  });

  it('send() records a MailLog and (log driver) marks it SENT', async () => {
    const res = await mail.send({
      to: RCPT,
      template: 'reservation_received',
      context: { name: 'Aarav', reference: 'HRM-TEST', date: '2026-10-01', time: '19:00', guests: 4 },
      entityType: 'Reservation',
      entityId: 'res-test',
    });
    expect(res.status).toBe('SENT');

    const row = await prisma.mailLog.findUnique({ where: { id: res.id } });
    expect(row?.to).toBe(RCPT);
    expect(row?.template).toBe('reservation_received');
    expect(row?.subject).toContain('HRM-TEST');
    expect(row?.sentAt).toBeTruthy();
  });

  it('mail log read API requires mail.read (401 / 403 / 200)', async () => {
    await request(app.getHttpServer()).get('/api/admin/mail-logs').expect(401);
    await request(app.getHttpServer())
      .get('/api/admin/mail-logs')
      .set('Cookie', staffCookie)
      .expect(403);
    await request(app.getHttpServer())
      .get('/api/admin/mail-logs')
      .set('Cookie', ownerCookie)
      .expect(200);
  });

  it('lists and filters the mail log', async () => {
    const bySearch = await request(app.getHttpServer())
      .get(`/api/admin/mail-logs?search=${encodeURIComponent(RCPT)}`)
      .set('Cookie', ownerCookie)
      .expect(200);
    expect(bySearch.body.total).toBe(1);
    expect(bySearch.body.items[0].to).toBe(RCPT);
    expect(bySearch.body.items[0].status).toBe('SENT');

    const byStatusMiss = await request(app.getHttpServer())
      .get(`/api/admin/mail-logs?search=${encodeURIComponent(RCPT)}&status=FAILED`)
      .set('Cookie', ownerCookie)
      .expect(200);
    expect(byStatusMiss.body.total).toBe(0);

    await request(app.getHttpServer())
      .get('/api/admin/mail-logs?status=BOGUS')
      .set('Cookie', ownerCookie)
      .expect(400);
  });
});
