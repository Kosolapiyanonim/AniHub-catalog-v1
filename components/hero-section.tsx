import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] flex items-center justify-center text-center">
      <Image
        src="/placeholder.svg?height=700&width=1200&text=Hero+Background"
        alt="Hero Background"
        fill
        style={{ objectFit: "cover" }}
        className="brightness-50"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      <div className="relative z-10 text-white px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">Смотри любимое аниме онлайн</h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto drop-shadow-md">
          Откройте для себя огромную коллекцию аниме сериалов и фильмов в высоком качестве.
        </p>
        <Link href="/catalog" passHref>
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
            <Play className="mr-2 h-5 w-5" />
            Начать просмотр
          </Button>
        </Link>
      </div>
    </section>
  )
}
