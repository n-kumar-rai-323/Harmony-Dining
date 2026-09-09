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

/**
 * Requires a running database (see backend/docker-compose.yml).
 * Creates and cleans up its own test admin.
 */
const TEST_EMAIL = 'e2e.super@harmony.test';
const TEST_PASSWORD = 'E2ePassw0rd!!';

describe('Auth + RBAC (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let cookie = '';

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication({ bufferLogs: true });
    app.useLogger(app.get(PinoLogger));
    const config = app.get(ConfigService<AppConfig, true>);
    app.setGlobalPrefix('api');
    app.use(
      cookieParser(config.get('session', { infer: true }).secret),
    );
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    const passwords = app.get(PasswordService);

    await prisma.session.deleteMany({ where: { admin: { email: TEST_EMAIL } } });
    await prisma.adminUser.deleteMany({ where: { email: TEST_EMAIL } });
    await prisma.adminUser.create({
      data: {
        email: TEST_EMAIL,
        name: 'E2E Super',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        passwordHash: await passwords.hash(TEST_PASSWORD),
      },
    });
  });

  afterAll(async () => {
    await prisma.session.deleteMany({ where: { admin: { email: TEST_EMAIL } } });
    await prisma.adminUser.deleteMany({ where: { email: TEST_EMAIL } });
    await app.close();
  });

  it('rejects an unauthenticated admin request with 401', () =>
    request(app.getHttpServer()).get('/api/admin/users').expect(401));

  it('rejects a bad password with a generic 401', () =>
    request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: 'nope-nope-nope' })
      .expect(401)
      .expect((res) => {
        expect(res.body.message).toBe('Invalid email or password');
      }));

  it('logs in, sets a session cookie and returns the user', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
      .expect(200);
    expect(res.body.user.email).toBe(TEST_EMAIL);
    const setCookie = res.headers['set-cookie'];
    expect(setCookie?.[0]).toContain('harmony_admin_session=');
    cookie = setCookie[0].split(';')[0];
  });

  it('returns role + effective permissions from /auth/me', () =>
    request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', cookie)
      .expect(200)
      .expect((res) => {
        expect(res.body.user.role).toBe('SUPER_ADMIN');
        expect(res.body.permissions.length).toBeGreaterThanOrEqual(28);
      }));

  it('allows a permitted admin route and 403s a forbidden one', async () => {
    await request(app.getHttpServer())
      .get('/api/admin/users?pageSize=1')
      .set('Cookie', cookie)
      .expect(200);

    // Create a STAFF user, log in as them, expect 403 on users.read.
    const staffEmail = `e2e.staff.${Date.now()}@harmony.test`;
    const created = await request(app.getHttpServer())
      .post('/api/admin/users')
      .set('Cookie', cookie)
      .send({
        email: staffEmail,
        name: 'E2E Staff',
        role: 'STAFF',
        password: 'StaffPassw0rd!',
      })
      .expect(201);

    const staffLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: staffEmail, password: 'StaffPassw0rd!' })
      .expect(200);
    const staffCookie = staffLogin.headers['set-cookie'][0].split(';')[0];

    await request(app.getHttpServer())
      .get('/api/admin/users')
      .set('Cookie', staffCookie)
      .expect(403);

    await prisma.adminUser.deleteMany({ where: { id: created.body.id } });
  });

  it('logs out and invalidates the session', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Cookie', cookie)
      .expect(200);
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', cookie)
      .expect(401);
  });
});
