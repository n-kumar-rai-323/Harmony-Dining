import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';

/** Origins the browser talks to directly (admin panel + public form posts). */
function apiOrigins(): string[] {
  const out = new Set<string>();
  for (const raw of [
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_MEDIA_URL,
  ]) {
    if (!raw) continue;
    try {
      out.add(new URL(raw).origin);
    } catch {
      // ignore malformed env value
    }
  }
  return [...out];
}

/**
 * Content Security Policy. Enumerates every source the app actually uses:
 *  - Google Fonts CSS + font files
 *  - OpenStreetMap raster tiles (Leaflet) — OSRM routing is proxied through
 *    our own /api/route handler, so it needs no browser origin
 *  - MUI/emotion inject runtime <style> tags -> style-src 'unsafe-inline'
 *  - Next.js ships small inline bootstrap scripts -> script-src 'unsafe-inline'
 *  - the backend API origin for browser-side fetches + uploaded media <img>
 * Dev additionally allows eval + ws for Turbopack HMR.
 */
function contentSecurityPolicy(): string {
  const api = apiOrigins();
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'base-uri': ["'self'"],
    'object-src': ["'none'"],
    'frame-ancestors': ["'self'"],
    'form-action': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : [])],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https://*.tile.openstreetmap.org',
      ...api,
    ],
    'connect-src': [
      "'self'",
      ...api,
      ...(isDev ? ['ws:', 'http://localhost:*'] : []),
    ],
    'worker-src': ["'self'", 'blob:'],
    'manifest-src': ["'self'"],
  };
  if (!isDev) directives['upgrade-insecure-requests'] = [];

  return Object.entries(directives)
    .map(([k, v]) => (v.length ? `${k} ${v.join(' ')}` : k))
    .join('; ');
}

/** Security headers applied to every route. */
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: contentSecurityPolicy(),
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), browsing-topics=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

/**
 * Hosts that may serve <Image> sources: the API's /media/* (local dev
 * driver) and an optional CDN/bucket host for the S3 driver in production.
 * Derived from env so no code change is needed per environment.
 */
function mediaRemotePatterns() {
  const patterns: NonNullable<
    NonNullable<NextConfig['images']>['remotePatterns']
  > = [];
  const sources = [
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_MEDIA_URL,
  ].filter(Boolean) as string[];

  for (const raw of sources) {
    try {
      const u = new URL(raw);
      patterns.push({
        protocol: u.protocol.replace(':', '') as 'http' | 'https',
        hostname: u.hostname,
        port: u.port || undefined,
        pathname: '/**',
      });
    } catch {
      // ignore malformed env value
    }
  }
  return patterns;
}

// Next 16 refuses to optimise images whose host resolves to a private IP
// (SSRF hardening). In local dev the media API is on localhost, so allow it
// there only — never when the media host is a real remote domain.
function mediaIsLocal() {
  const sources = [
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_MEDIA_URL,
  ].filter(Boolean) as string[];
  return sources.some((raw) => {
    try {
      const h = new URL(raw).hostname;
      return h === 'localhost' || h === '127.0.0.1' || h === '::1';
    } catch {
      return false;
    }
  });
}

const nextConfig: NextConfig = {
  reactStrictMode: true,

  poweredByHeader: false,

  compress: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    // Every `quality` value passed to next/image must be listed here (Next 16).
    qualities: [75, 80, 85],
    remotePatterns: mediaRemotePatterns(),
    // Local-dev only: the media API is on localhost. Production media is a
    // real remote host and this stays false.
    dangerouslyAllowLocalIP: mediaIsLocal(),
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
