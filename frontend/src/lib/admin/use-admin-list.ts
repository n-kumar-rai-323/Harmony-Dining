'use client';

import { useCallback, useMemo, useState } from 'react';

import { useAdminQuery } from './use-admin-query';
import type { Paginated } from './types';

export type ListParams = Record<string, string | number | boolean | undefined>;

function toQueryString(params: ListParams): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === '' || v === false) continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

/**
 * List-screen state: filter/pagination params -> query string -> GET.
 * Setting any filter resets to page 1. `basePath` is the admin API path
 * (e.g. "/admin/reviews").
 */
export function useAdminList<T>(basePath: string, initial: ListParams = {}) {
  const [params, setParams] = useState<ListParams>({
    page: 1,
    pageSize: 20,
    ...initial,
  });

  const path = useMemo(
    () => `${basePath}${toQueryString(params)}`,
    [basePath, params],
  );
  const query = useAdminQuery<Paginated<T>>(path);

  const setParam = useCallback((key: string, value: ListParams[string]) => {
    setParams((prev) => {
      const next = { ...prev, [key]: value };
      if (key !== 'page') next.page = 1;
      return next;
    });
  }, []);

  const setPage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setParams((prev) => ({ ...prev, pageSize, page: 1 }));
  }, []);

  return {
    ...query,
    params,
    setParam,
    setPage,
    setPageSize,
  };
}
