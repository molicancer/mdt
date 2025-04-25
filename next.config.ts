import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      process.env.NEXT_PUBLIC_STRAPI_HOST || 'localhost',
      process.env.NEXT_PUBLIC_STRAPI_BACKUP_HOST || 'localhost'
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: process.env.NEXT_PUBLIC_STRAPI_BACKUP_HOST || 'localhost',
        port: process.env.NEXT_PUBLIC_STRAPI_BACKUP_PORT || '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: process.env.NEXT_PUBLIC_STRAPI_HOST || 'localhost',
        port: process.env.NEXT_PUBLIC_STRAPI_PORT || '1337',
        pathname: '/uploads/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  // 添加API代理，解决跨域问题
  async rewrites() {
    const STRAPI_HOST = process.env.NEXT_PUBLIC_STRAPI_HOST || 'localhost';
    const STRAPI_PORT = process.env.NEXT_PUBLIC_STRAPI_PORT || '1337';
    const STRAPI_SERVER_ROOT = `http://${STRAPI_HOST}:${STRAPI_PORT}`;
    
    return [
      {
        source: '/strapi-uploads/:path*',
        destination: `${STRAPI_SERVER_ROOT}/uploads/:path*`,
      },
      {
        source: '/strapi-images/:path*',
        destination: `${STRAPI_SERVER_ROOT}/images/:path*`,
      },
    ];
  },
};

export default nextConfig;
