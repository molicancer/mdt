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
    ],
  },
};

export default nextConfig;
