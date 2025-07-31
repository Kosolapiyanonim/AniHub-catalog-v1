"use client"

import Link from "next/link"
import Image from "next/image"
import { AnimeListPopover } from "./AnimeListPopover"
import { AnimeCardListButton } from "./anime-card-list-button"

const formatAnimeType = (type: string | null | undefined): string => {
  if (!type) return ""
  const typeMap: { [key: string]: string } = {
    tv_series: "Сериал",
    movie: "Фильм",
    ova: "OVA",
    ona: "ONA",
    special: "Спешл",
    "anime-serial": "Аниме сериал",
    anime: "Полнометражное",
  }
  return typeMap[type.toLowerCase()] || type
}

interface AnimeCardProps {
  anime: any
  priority?: boolean
  onStatusChange?: (animeId: number, newStatus: string | null) => void
}

export function AnimeCard({ anime, priority = false, onStatusChange }: AnimeCardProps) {
  if (!anime || !anime.shikimori_id) {
    return null
  }

  return (
    <AnimeListPopover anime={anime} onStatusChange={onStatusChange}>
      <div className="relative group">
        {/* List Button */}
        <AnimeCardListButton
          animeId={anime.id}
          initialStatus={anime.user_list_status}
          onStatusChange={onStatusChange}
        />

        <Link href={`/anime/${anime.shikimori_id}`} className="block">
          <div className="aspect-[2/3] overflow-hidden rounded-lg bg-slate-800 relative">
            {anime.poster_url ? (
              <Image
                src={anime.poster_url || "/placeholder.svg"}
                alt={anime.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority={priority}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs p-2 text-center">
                Постер отсутствует
              </div>
            )}
          </div>

          <div className="mt-2 px-1">
            <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-purple-400 transition-colors leading-tight">
              {anime.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1 truncate">
              {formatAnimeType(anime.type)}
              {anime.year && anime.type ? " • " : ""}
              {anime.year}
            </p>
          </div>
        </Link>
      </div>
    </AnimeListPopover>
  )
}
