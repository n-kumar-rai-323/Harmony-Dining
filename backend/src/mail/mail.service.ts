import { Injectable, Logger } from '@nestjs/common';
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
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly from: string;
  private readonly driver: 'log' | 'smtp';
  private readonly transporter: Transporter | null;

  constructor(
    config: ConfigService<AppConfig, true>,
    private readonly prisma: PrismaService,
  ) {
    const mail = config.get('mail', { infer: true });
    this.from = mail.from;
    this.driver = mail.driver;
    this.transporter =
      mail.driver === 'smtp'
        ? nodemailer.createTransport({
            host: mail.smtp.host,
            port: mail.smtp.port,
            secure: mail.smtp.secure,
            auth: mail.smtp.user
              ? { user: mail.smtp.user, pass: mail.smtp.password }
              : undefined,
          })
        : null;
  }

  /**
   * Best-effort transactional send. Always writes a MailLog row and never
   * throws — email delivery must not roll back core data. With the "log"
   * driver nothing is sent; the row is still marked SENT so callers can treat
   * dev and prod uniformly.
   */
  async send(input: SendMailInput): Promise<SendMailResult> {
    const { subject, html } = renderTemplate(input.template, input.context);
    const finalSubject = input.subject ?? subject;

    const log = await this.prisma.mailLog.create({
      data: {
        to: input.to,
        subject: finalSubject,
        template: input.template,
        status: 'QUEUED',
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
      },
    });

    try {
      if (this.transporter) {
        await this.transporter.sendMail({
          from: this.from,
          to: input.to,
          subject: finalSubject,
          html,
        });
      } else {
        this.logger.log(
          `[mail:log] to=${input.to} template=${input.template} subject="${finalSubject}"`,
        );
      }

      const updated = await this.prisma.mailLog.update({
        where: { id: log.id },
        data: { status: 'SENT', attempts: 1, sentAt: new Date() },
      });
      return { id: updated.id, status: updated.status };
    } catch (error) {
      this.logger.error(
        `Mail send failed (template=${input.template}, to=${input.to})`,
        error instanceof Error ? error.stack : String(error),
      );
      const updated = await this.prisma.mailLog.update({
        where: { id: log.id },
        data: {
          status: 'FAILED',
          attempts: 1,
          error:
            error instanceof Error
              ? error.message.slice(0, 500)
              : String(error).slice(0, 500),
        },
      });
      return { id: updated.id, status: updated.status };
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
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.mailLog.count({ where }),
    ]);

    return paginate(rows, total, query.page, query.pageSize);
  }
}
