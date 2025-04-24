import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['172.16.7.55'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '172.16.69.13',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '172.16.7.55',
        port: '1337',
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
    return [
      {
        source: '/strapi-uploads/:path*',
        destination: 'http://172.16.7.55:1337/uploads/:path*',
      },
      {
        source: '/strapi-images/:path*',
        destination: 'http://172.16.7.55:1337/images/:path*',
      },
    ];
  },
};

export default nextConfig;
