import type { NextConfig } from 'next';

/**
 * Security headers applied to every route. Kept intentionally
 * conservative — no CSP yet because the app loads Google Fonts,
 * OpenStreetMap tiles and MUI's runtime styles; add a hashed or
 * nonce-based CSP once those sources are enumerated.
 */
const securityHeaders = [
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
