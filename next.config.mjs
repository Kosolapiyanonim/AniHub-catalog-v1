/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // РАЗРЕШАЕМ ОПТИМИЗАЦИЮ
    unoptimized: false,
    
    // Указываем, с каких доменов можно загружать и оптимизировать картинки
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.kodik.biz',
      },
      {
        protocol: 'https',
        hostname: '**.kodik.info',
      },
      {
        protocol: 'https',
        hostname: 'shikimori.one',
      },
       {
        protocol: 'https',
        hostname: 'dere.shikimori.one',
      },
      {
        protocol: 'https',
        hostname: 'nyaa.shikimori.one',
      },
      {
        protocol: 'https',
        hostname: 'avatars.mds.yandex.net',
      },
      {
        protocol: 'https',
        hostname: 'kinopoiskapiunofficial.tech',
      }
    ],
    // Настройки для генерации разных размеров изображений
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

export default nextConfig
