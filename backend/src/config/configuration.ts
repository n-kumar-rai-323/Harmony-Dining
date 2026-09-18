/**
 * Typed application configuration, loaded once at boot.
 * Missing or malformed required values fail fast with a clear message.
 */

function required(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value === undefined || value.trim() === '' ? fallback : value.trim();
}

function int(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n)) {
    throw new Error(`Environment variable ${name} must be an integer`);
  }
  return n;
}

function bool(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(raw.trim().toLowerCase());
}

export type SameSite = 'lax' | 'strict' | 'none';

export interface AppConfig {
  env: 'development' | 'test' | 'production';
  port: number;
  apiPublicUrl: string;
  corsOrigins: string[];
  database: {
    url: string;
  };
  session: {
    secret: string;
    ttlHours: number;
    cookieName: string;
    cookieSecure: boolean;
    cookieSameSite: SameSite;
    cookieDomain: string | undefined;
  };
  throttle: {
    ttlSeconds: number;
    limit: number;
    authTtlSeconds: number;
    authLimit: number;
  };
  storage: {
    driver: 'local' | 's3';
    localDir: string;
    publicBaseUrl: string;
    s3: {
      endpoint: string;
      region: string;
      bucket: string;
      accessKeyId: string;
      secretAccessKey: string;
      forcePathStyle: boolean;
      publicBaseUrl: string;
    };
  };
  mail: {
    driver: 'log' | 'smtp';
    from: string;
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      user: string;
      password: string;
    };
  };
  logLevel: string;
}

export function configuration(): AppConfig {
  const env = optional('NODE_ENV', 'development') as AppConfig['env'];

  const secret =
    env === 'production'
      ? required('SESSION_SECRET')
      : optional('SESSION_SECRET', 'dev-insecure-session-secret-change-me');

  if (secret.length < 24) {
    throw new Error('SESSION_SECRET must be at least 24 characters');
  }

  return {
    env,
    port: int('PORT', 4000),
    apiPublicUrl: optional('API_PUBLIC_URL', 'http://localhost:4000'),
    corsOrigins: optional('CORS_ORIGINS', 'http://localhost:3000')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    database: {
      url: required('DATABASE_URL'),
    },
    session: {
      secret,
      ttlHours: int('SESSION_TTL_HOURS', 12),
      cookieName: optional('SESSION_COOKIE_NAME', 'harmony_admin_session'),
      cookieSecure: bool('SESSION_COOKIE_SECURE', env === 'production'),
      cookieSameSite: optional('SESSION_COOKIE_SAMESITE', 'lax') as SameSite,
      cookieDomain: process.env.SESSION_COOKIE_DOMAIN?.trim() || undefined,
    },
    throttle: {
      ttlSeconds: int('THROTTLE_TTL_SECONDS', 60),
      limit: int('THROTTLE_LIMIT', 120),
      authTtlSeconds: int('AUTH_THROTTLE_TTL_SECONDS', 300),
      authLimit: int('AUTH_THROTTLE_LIMIT', 10),
    },
    storage: {
      driver: optional('STORAGE_DRIVER', 'local') as 'local' | 's3',
      localDir: optional('STORAGE_LOCAL_DIR', './storage/uploads'),
      publicBaseUrl: optional(
        'STORAGE_PUBLIC_BASE_URL',
        'http://localhost:4000/media',
      ),
      s3: {
        endpoint: optional('S3_ENDPOINT', ''),
        region: optional('S3_REGION', 'auto'),
        bucket: optional('S3_BUCKET', ''),
        accessKeyId: optional('S3_ACCESS_KEY_ID', ''),
        secretAccessKey: optional('S3_SECRET_ACCESS_KEY', ''),
        forcePathStyle: bool('S3_FORCE_PATH_STYLE', true),
        publicBaseUrl: optional('S3_PUBLIC_BASE_URL', ''),
      },
    },
    mail: {
      driver: optional('MAIL_DRIVER', 'log') as 'log' | 'smtp',
      from: optional(
        'MAIL_FROM',
        'Harmony Dining <no-reply@harmonydining.example>',
      ),
      smtp: {
        host: optional('SMTP_HOST', ''),
        port: int('SMTP_PORT', 587),
        secure: bool('SMTP_SECURE', false),
        user: optional('SMTP_USER', ''),
        password: optional('SMTP_PASSWORD', ''),
      },
    },
    logLevel: optional('LOG_LEVEL', 'info'),
  };
}
