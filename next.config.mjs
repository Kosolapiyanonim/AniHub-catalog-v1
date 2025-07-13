/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // ВКЛЮЧАЕМ ОПТИМИЗАЦИЮ
    unoptimized: false,
    
    // Указываем, с каких доменов можно загружать и оптимизировать картинки
    remotePatterns: [
      { protocol: 'https', hostname: 'shikimori.one' },
      { protocol: 'https', hostname: '*.shikimori.one' }, // Для всех поддоменов, например, nyaa.shikimori.one
      { protocol: 'https', hostname: 'st.kp.yandex.net' },
      // Добавим и остальные на всякий случай
      { protocol: 'https', hostname: '**.kodik.biz' },
      { protocol: 'https', hostname: '**.kodik.info' },
      { protocol: 'https', hostname: 'avatars.mds.yandex.net' },
      { protocol: 'https', hostname: 'kinopoiskapiunofficial.tech' },
        // ИЗМЕНЕНИЕ: Добавляем новый домен для MyAnimeList
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net',
      },
    ],
    // Настройки для генерации разных размеров изображений
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
