import { afterEach, describe, expect, it, vi } from 'vitest';

import { AdminApiError, adminApi } from './api';

const originalFetch = global.fetch;

function mockFetch(status: number, body: unknown, ok = status < 400) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    text: async () => (body === undefined ? '' : JSON.stringify(body)),
  } as Response);
}

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe('adminApi', () => {
  it('GETs and returns parsed JSON', async () => {
    mockFetch(200, { hello: 'world' });
    await expect(adminApi.get('/thing')).resolves.toEqual({ hello: 'world' });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.test/api/thing',
      expect.objectContaining({ method: 'GET', credentials: 'include' }),
    );
  });

  it('sends a JSON body on POST', async () => {
    mockFetch(200, { ok: true });
    await adminApi.post('/thing', { a: 1 });
    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'content-type': 'application/json' });
    expect(init.body).toBe(JSON.stringify({ a: 1 }));
  });

  it('returns undefined for 204', async () => {
    mockFetch(204, undefined);
    await expect(adminApi.delete('/thing')).resolves.toBeUndefined();
  });

  it('throws AdminApiError with array messages and status flags', async () => {
    mockFetch(400, { message: ['name is too short', 'email is invalid'] });
    const err = (await adminApi.post('/thing', {}).catch((e) => e)) as AdminApiError;
    expect(err).toBeInstanceOf(AdminApiError);
    expect(err.status).toBe(400);
    expect(err.messages).toEqual(['name is too short', 'email is invalid']);
    expect(err.message).toBe('name is too short');
    expect(err.isAuth).toBe(false);
  });

  it('flags 401 as an auth error', async () => {
    mockFetch(401, { message: 'Unauthorized' });
    const err = (await adminApi.get('/thing').catch((e) => e)) as AdminApiError;
    expect(err.isAuth).toBe(true);
    expect(err.isForbidden).toBe(false);
  });

  it('wraps a network failure as a status-0 error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    const err = (await adminApi.get('/thing').catch((e) => e)) as AdminApiError;
    expect(err).toBeInstanceOf(AdminApiError);
    expect(err.status).toBe(0);
  });
});
