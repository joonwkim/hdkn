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
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/vi/**',
      },
    ],
    domains: ['img.youtube.com', 'res.cloudinary.com', 'assets.vercel.com',],
  },

};

module.exports = nextConfig;
