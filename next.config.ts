import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['172.16.69.13'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '172.16.69.13',
        port: '8080',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
};

export default nextConfig;
