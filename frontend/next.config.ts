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

const nextConfig: NextConfig = {
  reactStrictMode: true,

  poweredByHeader: false,

  compress: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    // Every `quality` value passed to next/image must be listed here (Next 16).
    qualities: [75, 80, 85],
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
