import type { AdminRole } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  /** Effective permission keys (role grants +/- per-user overrides). */
  permissions: string[];
  sessionId: string;
}

declare module 'express' {
  interface Request {
    user?: AuthenticatedUser;
  }
}
