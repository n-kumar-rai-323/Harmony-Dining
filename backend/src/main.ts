import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Logger as PinoLogger } from 'nestjs-pino';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { resolve } from 'node:path';

import { AppModule } from './app.module';
import type { AppConfig } from './config/configuration';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(PinoLogger));

  const config = app.get(ConfigService<AppConfig, true>);
  const session = config.get('session', { infer: true });
  const corsOrigins = config.get('corsOrigins', { infer: true });
  const port = config.get('port', { infer: true });
  const storage = config.get('storage', { infer: true });

  // Behind one reverse proxy in production (Railway/Render/Fly, Nginx).
  app.set('trust proxy', 1);

  app.setGlobalPrefix('api');

  app.use(
    helmet({
      // Allow images from this API to be embedded by the site.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(cookieParser(session.secret));

  // Local media driver: serve uploaded files at /media/*.
  if (storage.driver === 'local') {
    app.useStaticAssets(resolve(process.cwd(), storage.localDir), {
      prefix: '/media/',
      immutable: true,
      maxAge: '365d',
      index: false,
    });
  }

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.enableShutdownHooks();

  await app.listen(port);

  app
    .get(PinoLogger)
    .log(`Harmony API listening on http://localhost:${port}/api`);
}

void bootstrap();
