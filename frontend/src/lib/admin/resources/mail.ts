import { adminApi } from '../api';
import type { Paginated } from '../types';

export const MAIL_LOGS_PATH = '/admin/mail-logs';

export type MailStatus = 'QUEUED' | 'SENT' | 'FAILED';

export type MailLog = {
  id: string;
  to: string;
  subject: string;
  template: string;
  status: MailStatus;
  attempts: number;
  error: string | null;
  entityType: string | null;
  entityId: string | null;
  createdAt: string;
  sentAt: string | null;
};

export const mailLogsApi = {
  list: (params: string) =>
    adminApi.get<Paginated<MailLog>>(`${MAIL_LOGS_PATH}${params}`),
};
