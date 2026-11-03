import type { NextConfig } from 'next';
const config: NextConfig = {
  distDir: process.env.KOPAKA_E2E_BUILD === '1' ? '.next-e2e' : '.next',
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
    ];
  },
};
export default config;
