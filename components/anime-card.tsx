"use client"

import Link from "next/link"
import Image from "next/image"

interface AnimeCardProps {
  anime: {
    id: number
    shikimori_id: string
    title: string
    poster_url?: string | null // Допускаем null
    year?: number | null
  }
}

export function AnimeCard({ anime }: AnimeCardProps) {
  if (!anime || !anime.shikimori_id) {
    return null
  }

  return (
    <Link href={`/anime/${anime.shikimori_id}`} key={anime.id} className="group cursor-pointer block">
      <div className="aspect-[2/3] overflow-hidden rounded-lg bg-slate-800 relative">
        {anime.poster_url ? (
          <Image
            src={anime.poster_url || "/placeholder.svg"}
            alt={anime.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 text-center text-xs p-2">
            Постер отсутствует
          </div>
        )}
      </div>

      {/* Название всегда видно под карточкой */}
      <div className="mt-2">
        <h3 className="text-sm font-medium text-white dark:text-slate-200 line-clamp-2">{anime.title}</h3>
        {anime.year && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{anime.year}</p>}
      </div>
    </Link>
  )
}
