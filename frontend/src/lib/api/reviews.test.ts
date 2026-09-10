import { afterEach, describe, expect, it, vi } from 'vitest';

import { submitReview } from './reviews';

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe('submitReview', () => {
  it('reports success when the API accepts it', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ status: 'PENDING' }),
    } as Response);

    const res = await submitReview({ name: 'Aab', rating: 5, comment: 'Nice' });
    expect(res).toEqual({ ok: true, connected: true });
  });

  it('surfaces a validation message from the API', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: ['comment is too short'] }),
    } as Response);

    const res = await submitReview({ name: 'Aab', rating: 5, comment: 'x' });
    expect(res).toEqual({
      ok: false,
      connected: true,
      error: 'comment is too short',
    });
  });

  it('gives a friendly message on 429', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({}),
    } as Response);

    const res = await submitReview({ name: 'Aab', rating: 5, comment: 'Nice' });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/recently/i);
  });

  it('degrades to "not connected" on a network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network'));
    const res = await submitReview({ name: 'Aab', rating: 5, comment: 'Nice' });
    expect(res).toEqual({ ok: true, connected: false });
  });
});
