import { configuration } from './configuration';

describe('configuration production validation', () => {
  const original = process.env;
  beforeEach(() => {
    process.env = {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://localhost/test',
      SESSION_SECRET: 'a-unique-production-secret-at-least-32-characters',
      API_PUBLIC_URL: 'https://harmony.example',
      CORS_ORIGINS: 'https://harmony.example',
      MAIL_DRIVER: 'smtp', SMTP_HOST: 'smtp.example', MAIL_FROM: 'hello@harmony.example',
    };
  });
  afterEach(() => { process.env = original; });

  it('accepts secure production configuration', () => {
    expect(configuration().session.cookieSecure).toBe(true);
  });
  it.each([
    ['SESSION_COOKIE_SECURE', 'false'],
    ['SESSION_SECRET', 'replace-with-a-long-random-string'],
    ['API_PUBLIC_URL', 'http://harmony.example'],
    ['CORS_ORIGINS', '*'],
    ['SESSION_COOKIE_SAMESITE', 'invalid'],
    ['PORT', '4100invalid'],
    ['NODE_ENV', 'prod'],
    ['PORT', '-1'],
    ['MAIL_DRIVER', 'log'],
    ['SMTP_HOST', ''],
    ['SMTP_SECURE', 'tru'],
    ['CORS_ORIGINS', 'https://harmony.example/path'],
    ['CORS_ORIGINS', 'https://harmony.example/'],
  ])('rejects unsafe %s', (key, value) => {
    process.env[key] = value;
    expect(() => configuration()).toThrow();
  });
});
