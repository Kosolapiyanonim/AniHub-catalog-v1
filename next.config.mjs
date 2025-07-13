/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    remotePatterns: [
      { hostname: 'shikimori.one' },
      { hostname: 'dere.shikimori.one' },
      { hostname: 'nyaa.shikimori.one' },
      { hostname: '*.kodik.biz' },
      { hostname: 'st.kodik.biz' },
      { hostname: '*.kodik.info' },
      { hostname: 'st.kodik.info' },
      { hostname: 'avatars.mds.yandex.net' },
      { hostname: 'kinopoiskapiunofficial.tech' },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
