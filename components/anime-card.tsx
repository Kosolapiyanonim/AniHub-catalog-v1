import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { AnimeCardListButton } from "./anime-card-list-button"
import type { Anime } from "@/lib/types"

interface AnimeCardProps {
  anime: Anime
  priority?: boolean
}

export function AnimeCard({ anime, priority = false }: AnimeCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-transform duration-300 hover:-translate-y-1">
      <Link href={`/anime/${anime.id}`} className="absolute inset-0 z-10" prefetch={false}>
        <span className="sr-only">View {anime.title}</span>
      </Link>
      <Image
        src={anime.poster_url || "/placeholder.svg?height=300&width=200&text=Anime+Poster"}
        alt={anime.title || "Anime Poster"}
        width={200}
        height={300}
        className="h-60 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-72 md:h-80 lg:h-96"
        priority={priority}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex flex-col justify-end">
        <h3 className="text-lg font-semibold text-white line-clamp-2">{anime.title}</h3>
        <div className="flex flex-wrap gap-1 mt-1">
          {anime.year && (
            <Badge variant="secondary" className="bg-purple-500 text-white">
              {anime.year}
            </Badge>
          )}
          {anime.type && <Badge variant="secondary">{anime.type}</Badge>}
        </div>
        <div className="mt-2">
          <AnimeCardListButton animeId={anime.id} />
        </div>
      </div>
    </div>
  )
}
