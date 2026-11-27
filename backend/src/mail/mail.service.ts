import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { MailStatus, Prisma } from '@prisma/client';
import nodemailer, { type Transporter } from 'nodemailer';

import type { AppConfig } from '../config/configuration';
import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../common/pagination';
import { renderTemplate, type MailTemplate } from './templates';
import type { MailLogQueryDto } from './dto';

export interface SendMailInput {
  to: string;
  template: MailTemplate;
  context?: Record<string, string | number | null | undefined>;
  /** Overrides the template's computed subject when set. */
  subject?: string;
  entityType?: string | null;
  entityId?: string | null;
}

export interface SendMailResult {
  id: string;
  status: MailStatus;
}

@Injectable()
export class MailService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MailService.name);
  private readonly from: string;
  private readonly transporter: Transporter | null;
  private timer?: ReturnType<typeof setInterval>;
  private processing = false;

  constructor(
    config: ConfigService<AppConfig, true>,
    private readonly prisma: PrismaService,
  ) {
    const mail = config.get('mail', { infer: true });
    this.from = mail.from;
    this.transporter =
      mail.driver === 'smtp'
        ? nodemailer.createTransport({
            host: mail.smtp.host,
            port: mail.smtp.port,
            secure: mail.smtp.secure,
            requireTLS: !mail.smtp.secure,
            connectionTimeout: 10_000,
            greetingTimeout: 10_000,
            socketTimeout: 30_000,
            auth: mail.smtp.user
              ? { user: mail.smtp.user, pass: mail.smtp.password }
              : undefined,
          })
        : null;
  }

  onModuleInit(): void {
    this.timer = setInterval(() => {
      void this.retryQueued().catch(() => this.logger.error('Mail retry worker failed'));
    }, 30_000);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    this.transporter?.close();
  }

  /** Persist before delivery so failed SMTP sends survive process restarts. */
  async send(input: SendMailInput): Promise<SendMailResult> {
    const log = await this.enqueue(input);
    return this.deliver(log.id);
  }

  /** Call inside the business transaction to atomically queue an acknowledgement. */
  async enqueue(input: SendMailInput, tx: Prisma.TransactionClient = this.prisma) {
    const { subject, html } = renderTemplate(input.template, input.context);
    const finalSubject = input.subject ?? subject;

    return tx.mailLog.create({
      data: {
        to: input.to,
        subject: finalSubject,
        template: input.template,
        status: 'QUEUED',
        bodyHtml: html,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
      },
    });

  }

  /** A short database lease prevents simultaneous workers sending the same row. */
  private async deliver(id: string): Promise<SendMailResult> {
    const now = new Date();
    const claimed = await this.prisma.mailLog.updateMany({
      where: {
        id, status: { in: ['QUEUED', 'FAILED'] }, attempts: { lt: 5 },
        nextAttemptAt: { lte: now }, bodyHtml: { not: null },
        OR: [{ lockedUntil: null }, { lockedUntil: { lt: now } }],
      },
      data: { lockedUntil: new Date(Date.now() + 300_000), attempts: { increment: 1 } },
    });
    const log = await this.prisma.mailLog.findUniqueOrThrow({ where: { id } });
    if (claimed.count === 0) return { id, status: log.status };
    try {
      if (this.transporter) {
        await this.transporter.sendMail({
          from: this.from,
          to: log.to,
          subject: log.subject,
          html: log.bodyHtml ?? '',
          messageId: `<${log.id}@harmony.local>`,
        });
      } else {
        this.logger.log(
          `[mail:log] template=${log.template}`,
        );
      }

      const updated = await this.prisma.mailLog.update({
        where: { id: log.id },
        data: { status: 'SENT', sentAt: new Date(), lockedUntil: null, bodyHtml: null, error: null },
      });
      return { id: updated.id, status: updated.status };
    } catch (error) {
      this.logger.error(
        `Mail send failed (id=${log.id}, attempt=${log.attempts})`,
      );
      const updated = await this.prisma.mailLog.update({
        where: { id: log.id },
        data: {
          status: 'FAILED',
          lockedUntil: null,
          nextAttemptAt: new Date(Date.now() + Math.min(3600, 30 * 2 ** log.attempts) * 1000),
          error:
            error instanceof Error
              ? error.message.slice(0, 500)
              : String(error).slice(0, 500),
        },
      });
      return { id: updated.id, status: updated.status };
    }
  }

  async retryQueued(): Promise<void> {
    if (this.processing) return;
    this.processing = true;
    try {
      const rows = await this.prisma.mailLog.findMany({
        where: {
          status: { in: ['QUEUED', 'FAILED'] }, attempts: { lt: 5 },
          nextAttemptAt: { lte: new Date() }, bodyHtml: { not: null },
          OR: [{ lockedUntil: null }, { lockedUntil: { lt: new Date() } }],
        },
        orderBy: { nextAttemptAt: 'asc' }, take: 20,
        select: { id: true },
      });
      for (const row of rows) await this.deliver(row.id);
    } finally {
      this.processing = false;
    }
  }

  /* --------------------------------------------- read side (mail.read) */

  async listLogs(query: MailLogQueryDto) {
    const where: Prisma.MailLogWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.template ? { template: query.template } : {}),
      ...(query.search
        ? {
            OR: [
              { to: { contains: query.search, mode: 'insensitive' } },
              { subject: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.mailLog.findMany({
        where,
        omit: { bodyHtml: true, lockedUntil: true },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.mailLog.count({ where }),
    ]);

    return paginate(rows, total, query.page, query.pageSize);
  }
}
