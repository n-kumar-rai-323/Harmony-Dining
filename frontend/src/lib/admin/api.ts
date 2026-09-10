import { env } from '@/lib/env';

/**
 * Browser-side client for the authenticated admin API.
 *
 * Auth is a signed, http-only session cookie set by the backend, so every
 * request goes out with `credentials: 'include'`. All calls are made from the
 * browser (the admin panel is client-rendered) — never from a Server Component.
 */

export class AdminApiError extends Error {
  readonly status: number;
  readonly messages: string[];

  constructor(status: number, messages: string[]) {
    super(messages[0] ?? `Request failed (${status})`);
    this.name = 'AdminApiError';
    this.status = status;
    this.messages = messages;
  }

  get isAuth(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }
}

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

function base(): string {
  if (!env.apiUrl) {
    throw new AdminApiError(0, [
      'NEXT_PUBLIC_API_URL is not set — the admin panel cannot reach the API.',
    ]);
  }
  return env.apiUrl;
}

function extractMessages(body: unknown, status: number): string[] {
  if (body && typeof body === 'object' && 'message' in body) {
    const m = (body as { message: unknown }).message;
    if (Array.isArray(m)) return m.map(String);
    if (typeof m === 'string') return [m];
  }
  return [`Request failed (${status})`];
}

async function call<T>(
  method: Method,
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${base()}${path.startsWith('/') ? path : `/${path}`}`, {
      method,
      credentials: 'include',
      headers: body === undefined ? undefined : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new AdminApiError(0, [
      'Could not reach the API. Check your connection and try again.',
    ]);
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const parsed = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    throw new AdminApiError(res.status, extractMessages(parsed, res.status));
  }
  return parsed as T;
}

export const adminApi = {
  get: <T>(path: string, signal?: AbortSignal) => call<T>('GET', path, undefined, signal),
  post: <T>(path: string, body?: unknown) => call<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => call<T>('PATCH', path, body),
  put: <T>(path: string, body?: unknown) => call<T>('PUT', path, body),
  delete: <T>(path: string, body?: unknown) => call<T>('DELETE', path, body),
};
