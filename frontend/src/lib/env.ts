/**
 * Centralised, validated access to environment variables.
 *
 * Only `NEXT_PUBLIC_*` values are readable in the browser; keep
 * server-only secrets out of this file.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.trim().length === 0) {
    // Fail fast at build/boot rather than shipping a broken page.
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim();
}

function optionalUrl(
  name: string,
  value: string | undefined,
  fallback: string,
): string {
  const raw = value?.trim() || fallback;

  try {
    // Normalise and strip any trailing slash for safe concatenation.
    return new URL(raw).toString().replace(/\/$/, '');
  } catch {
    throw new Error(
      `Environment variable ${name} is not a valid URL: "${raw}"`,
    );
  }
}

export const env = {
  /** Canonical public origin, used for metadata, sitemap and OG tags. */
  siteUrl: optionalUrl(
    'NEXT_PUBLIC_SITE_URL',
    process.env.NEXT_PUBLIC_SITE_URL,
    'http://localhost:3000',
  ),

  /** Base URL of the Harmony API. Empty until the backend is connected. */
  apiUrl: process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, '') ?? '',

  isProduction: process.env.NODE_ENV === 'production',
} as const;

export { required };
