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
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MenuModule } from './menu/menu.module';
import { StorageModule } from './storage/storage.module';
import { MediaModule } from './media/media.module';
import { GalleryModule } from './gallery/gallery.module';
import { EventsModule } from './events/events.module';
import { ReservationsModule } from './reservations/reservations.module';
import { EnquiriesModule } from './enquiries/enquiries.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SiteSettingsModule } from './site-settings/site-settings.module';
import { HomepageModule } from './homepage/homepage.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MailModule } from './mail/mail.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SessionAuthGuard } from './auth/guards/session-auth.guard';
import { PermissionsGuard } from './auth/guards/permissions.guard';
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
    AuditModule,
    AuthModule,
    HealthModule,
    StorageModule,
    UsersModule,
    MenuModule,
    MediaModule,
    GalleryModule,
    EventsModule,
    ReservationsModule,
    EnquiriesModule,
    ReviewsModule,
    SiteSettingsModule,
    HomepageModule,
    NotificationsModule,
    MailModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Order matters: rate limit -> authenticate -> authorize.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: SessionAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
