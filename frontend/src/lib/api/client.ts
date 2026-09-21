import { env } from '@/lib/env';

/**
 * Thin server-side fetch wrapper for the Harmony API.
 *
 * Public GETs only, for now. Every caller is expected to provide its own
 * fallback, so this returns `null` (never throws) when the API is not
 * configured or the request fails — the site must keep working offline.
 */

type ApiGetOptions = {
  /** ISR revalidation window in seconds. Use 0 for always-fresh. */
  revalidate?: number;
  /** AbortController timeout. */
  timeoutMs?: number;
};

export function isApiConfigured(): boolean {
  return env.apiInternalUrl.length > 0;
}

export async function apiGet<T>(
  path: string,
  { revalidate = 300, timeoutMs = 4000 }: ApiGetOptions = {},
): Promise<T | null> {
  if (!isApiConfigured()) return null;

  const url = `${env.apiInternalUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { accept: 'application/json' },
      next: { revalidate },
    });

    if (!res.ok) {
      console.warn(
        `[api] GET ${path} -> ${res.status}; falling back to local content`,
      );
      return null;
    }

    return (await res.json()) as T;
  } catch (error) {
    console.warn(
      `[api] GET ${path} failed (${
        error instanceof Error ? error.message : 'unknown'
      }); falling back to local content`,
    );
    return null;
  } finally {
    clearTimeout(timer);
  }
}
