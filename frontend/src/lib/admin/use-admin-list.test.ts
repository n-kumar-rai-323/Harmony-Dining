import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useAdminList } from './use-admin-list';

const originalFetch = global.fetch;

function jsonOnce(body: unknown) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    text: async () => JSON.stringify(body),
  } as Response);
}

function lastUrl() {
  const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls;
  return String(calls[calls.length - 1][0]);
}

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

const page = { items: [], total: 0, page: 1, pageSize: 20, pageCount: 1 };

describe('useAdminList', () => {
  it('requests the base path with default pagination', async () => {
    jsonOnce(page);
    const { result } = renderHook(() => useAdminList('/admin/things'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(lastUrl()).toBe('http://api.test/api/admin/things?page=1&pageSize=20');
  });

  it('adds a filter and resets to page 1', async () => {
    jsonOnce(page);
    const { result } = renderHook(() => useAdminList('/admin/things'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(3));
    await waitFor(() => expect(lastUrl()).toContain('page=3'));

    act(() => result.current.setParam('status', 'PUBLISHED'));
    await waitFor(() => {
      const u = lastUrl();
      expect(u).toContain('status=PUBLISHED');
      expect(u).toContain('page=1');
    });
  });

  it('omits empty and false params from the query string', async () => {
    jsonOnce(page);
    const { result } = renderHook(() =>
      useAdminList('/admin/things', { search: '', featured: false }),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    const u = lastUrl();
    expect(u).not.toContain('search=');
    expect(u).not.toContain('featured=');
  });
});
