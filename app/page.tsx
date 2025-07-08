import { HeroSection } from "@/components/hero-section"
import { AnimeGrid } from "@/components/anime-grid"

// Иконка Telegram
const TelegramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.896 6.728-1.268 7.686-2.965 6.35-1.265-.997-2.405-1.878-2.405-1.878s-.896-.618-2.162.179c-.896.618-1.792 1.237-2.688.618-.896-.618-.448-1.416.448-2.034.896-.618 5.369-5.729 5.369-5.729s.448-.359.448-.718c0-.359-.448-.538-.896-.179 0 0-6.265 4.472-7.161 5.09-.896.618-1.344.359-2.24-.179-.896-.538-1.792-1.077-1.792-1.077s-.672-.359-.224-.897c.448-.538 1.12-.718 1.12-.718s7.385-3.136 9.953-4.213c2.568-1.077 2.568-.718 2.568-.718z" />
  </svg>
)

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />

      {/* Секция Telegram канала */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 text-center max-w-md w-full">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <TelegramIcon />
            </div>
            <h3 className="text-xl font-semibold mb-4">Следите за обновлениями</h3>
            <a
              href="https://t.me/+kXXC-nLjauxiZWJi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <TelegramIcon />
              Подписаться на канал
            </a>
          </div>
        </div>
      </section>

      <AnimeGrid />
    </div>
  )
}
