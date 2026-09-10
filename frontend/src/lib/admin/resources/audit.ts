import { adminApi } from '../api';
import type { Paginated } from '../types';

export const AUDIT_PATH = '/admin/audit';

export type AuditEntry = {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  before: unknown;
  after: unknown;
  ip: string | null;
  userAgent: string | null;
  requestId: string | null;
  createdAt: string;
  actor: { id: string; email: string; name: string; status: string } | null;
};

export type AuditFacets = {
  actions: { value: string; count: number }[];
  entityTypes: { value: string; count: number }[];
};

export const auditApi = {
  list: (params: string) =>
    adminApi.get<Paginated<AuditEntry>>(`${AUDIT_PATH}${params}`),
  facets: () => adminApi.get<AuditFacets>(`${AUDIT_PATH}/facets`),
  get: (id: string) => adminApi.get<AuditEntry>(`${AUDIT_PATH}/${id}`),
};
