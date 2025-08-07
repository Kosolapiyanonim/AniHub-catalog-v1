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
      </div>
    </section>
  )
}
