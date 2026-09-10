'use client';

import { useCallback, useEffect, useState } from 'react';

import { adminApi, AdminApiError } from './api';

type QueryState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** Re-run the request. */
  reload: () => void;
};

type Result<T> = {
  path: string;
  tick: number;
  data: T | null;
  error: string | null;
};

function messageFor(err: unknown): string {
  return err instanceof AdminApiError
    ? err.messages[0]
    : 'Failed to load. Please try again.';
}

/**
 * Minimal GET hook for admin screens: fetches `path` on mount and whenever it
 * (or `reload`) changes, with derived loading/error state. Aborts the in-flight
 * request on unmount or path change. `loading` is true whenever the last
 * settled result does not match the current request.
 */
export function useAdminQuery<T>(path: string): QueryState<T> {
  const [tick, setTick] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    const controller = new AbortController();

    adminApi
      .get<T>(path, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setResult({ path, tick, data, error: null });
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setResult({ path, tick, data: null, error: messageFor(err) });
      });

    return () => controller.abort();
  }, [path, tick]);

  const fresh = result !== null && result.path === path && result.tick === tick;

  return {
    data: fresh ? result.data : null,
    loading: !fresh,
    error: fresh ? result.error : null,
    reload,
  };
}
