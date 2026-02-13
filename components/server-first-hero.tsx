import Image from "next/image"
import Link from "next/link"
import { Play, Info, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Anime } from "@/lib/types"

interface ServerFirstHeroProps {
  item?: Anime | null
}

export function ServerFirstHero({ item }: ServerFirstHeroProps) {
  if (!item) {
    return (
      <section className="relative h-screen w-full bg-gradient-to-b from-slate-900 to-background">
        <div className="container mx-auto flex h-full items-end px-4 pb-24">
          <p className="text-white/80">Отметьте аниме в базе для отображения в Hero-секции...</p>
        </div>
      </section>
    )
  }

  const heroImage = item.background_image_url || item.poster_url || "/placeholder.svg"

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <Image
        src={heroImage}
        alt={`Фон для ${item.title}`}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />

      <div className="relative z-10 container mx-auto flex h-full items-end px-4 pb-16 md:pb-20">
        <div className="max-w-2xl text-white">
          <p className="mb-3 inline-flex rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs">В центре внимания</p>
          <h1 className="mb-4 text-3xl font-bold leading-tight md:text-5xl">{item.title}</h1>

          <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-white/85">
            {item.shikimori_rating ? (
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 fill-current text-yellow-400" />
                {item.shikimori_rating.toFixed(1)}
              </span>
            ) : null}
            {item.year ? <span>{item.year}</span> : null}
            {item.type ? <span className="rounded border border-white/30 px-2 py-0.5">{item.type}</span> : null}
          </div>

          {item.description ? <p className="mb-6 line-clamp-3 text-sm text-white/80 md:text-base">{item.description}</p> : null}

          <div className="flex gap-3">
            <Button asChild className="bg-purple-600 hover:bg-purple-700">
              <Link href={`/anime/${item.shikimori_id}/watch`}>
                <Play className="mr-2 h-4 w-4" />
                Смотреть
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/40 bg-black/30 text-white hover:bg-white/10 hover:text-white">
              <Link href={`/anime/${item.shikimori_id}`}>
                <Info className="mr-2 h-4 w-4" />
                Подробнее
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
