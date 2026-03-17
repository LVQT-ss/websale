import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Image optimization ──────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // ─── Security headers ───────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/templates/:slug/demo',
        headers: [
          // Allow iframe embedding only for demo pages
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
        ],
      },
    ];
  },

  // ─── Compression & performance ──────────────────────────────────
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
