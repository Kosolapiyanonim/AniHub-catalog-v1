import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative container mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Смотри Аниме Онлайн</h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
          Тысячи аниме в отличном качестве. Новые серии каждый день.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100">
            <Link href="/catalog">Смотреть сейчас</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white hover:text-black bg-transparent"
          >
            <Link href="/random">Случайное аниме</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
