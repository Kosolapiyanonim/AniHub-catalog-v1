import { Inter } from "next/font/google"

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
})

export function HeroSection() {
  return (
    <section className="relative text-white">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative container mx-auto px-4 py-24 text-center">
        <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${inter.className}`}>Смотри Аниме Онлайн</h1>
        <p className={`text-xl md:text-2xl mb-8 max-w-2xl mx-auto ${inter.className}`}>
          Тысячи аниме в отличном качестве. Новые серии каждый день.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Начать просмотр
          </button>
          <button className="border border-white/30 hover:bg-white/10 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Популярное
          </button>
        </div>
      </div>
    </section>
  )
}
