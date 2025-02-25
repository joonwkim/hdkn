/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  i18n: {
    locales: ['ko-KR'],
    defaultLocale: 'ko-KR',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // images: { domains: ['img.youtube.com'], },
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

module.exports = nextConfig;
