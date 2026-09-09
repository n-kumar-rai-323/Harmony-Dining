import type { Request } from 'express';
import type { AuditContext } from '../audit/audit.service';
import type { AuthenticatedUser } from '../auth/types';

export function clientIp(req: Request): string | null {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return req.ip ?? null;
}

/** Builds the audit context from the request + current admin. */
export function auditContext(
  req: Request,
  actor: AuthenticatedUser,
): AuditContext {
  return {
    actorId: actor.id,
    actorEmail: actor.email,
    ip: clientIp(req),
    userAgent: req.headers['user-agent'] ?? null,
    requestId: (req.headers['x-request-id'] as string) ?? null,
  };
}
