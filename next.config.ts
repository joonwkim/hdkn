import type { NextConfig } from "next";

const nextConfig: NextConfig = {
/* config options here */
  compiler: {
    styledComponents: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/dhhev1lrj/**',
      },
    ],
    domains: ['img.youtube.com', 'res.cloudinary.com', 'assets.vercel.com',],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
