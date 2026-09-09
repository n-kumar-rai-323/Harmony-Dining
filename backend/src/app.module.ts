import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configuration, type AppConfig } from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
    }),

    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => {
        const isDev = config.get('env', { infer: true }) !== 'production';
        return {
          pinoHttp: {
            level: config.get('logLevel', { infer: true }),
            genReqId: (req, res) => {
              const existing =
                (req.headers['x-request-id'] as string) || randomUUID();
              res.setHeader('x-request-id', existing);
              return existing;
            },
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'res.headers["set-cookie"]',
              ],
              remove: true,
            },
            transport: isDev
              ? { target: 'pino-pretty', options: { singleLine: true } }
              : undefined,
            autoLogging: {
              ignore: (req) => req.url === '/api/health/live',
            },
          },
        };
      },
    }),

    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => {
        const t = config.get('throttle', { infer: true });
        return {
          throttlers: [
            { name: 'default', ttl: t.ttlSeconds * 1000, limit: t.limit },
          ],
        };
      },
    }),

    PrismaModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
