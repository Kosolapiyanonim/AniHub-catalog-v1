// components/anime-card.tsx
"use client"

import Link from "next/link"
import Image from "next/image"
import { AnimeListPopover } from "./AnimeListPopover"
import { AnimeCardListButton } from "./anime-card-list-button"
import { ProgressBar } from "./ui/progress"

const formatAnimeType = (type: string | null | undefined): string => {
  if (!type) return ""
  const typeMap: { [key: string]: string } = {
    tv_series: "Сериал",
    tv: "Сериал",
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
  const animeId = anime?.shikimori_id || anime?.id

  if (!anime || !animeId) {
    return null
  }

  const posterUrl = anime.poster_url || anime.poster || "/placeholder.jpg"
  const title =
    typeof anime.title === "object" ? anime.title.ru || anime.title.en || "Без названия" : anime.title || "Без названия"

  const progressPercent = anime.progress && anime.episodes_total ? (anime.progress / anime.episodes_total) * 100 : null

  const popoverData = {
    id: anime.id || animeId,
    shikimori_id: String(animeId),
    title: title,
    year: anime.year,
    type: anime.type,
    status: anime.status,
    episodes_aired: anime.episodes_aired || 0,
    episodes_total: anime.episodes_total || anime.episodes || 0,
    description: anime.description,
    genres: anime.genres,
    shikimori_rating: anime.shikimori_rating || anime.rating,
    user_list_status: anime.user_list_status,
  }

  return (
    <AnimeListPopover anime={popoverData} onStatusChange={onStatusChange}>
      <Link href={`/anime/${animeId}`} className="block group">
        <div className="aspect-[2/3] overflow-hidden rounded-lg bg-muted relative">
          <AnimeCardListButton
            animeId={anime.id || animeId}
            initialStatus={anime.user_list_status}
            onStatusChange={(newStatus) => onStatusChange?.(anime.id, newStatus)}
          />
          {posterUrl && posterUrl !== "/placeholder.jpg" ? (
            <Image
              src={posterUrl || "/placeholder.svg"}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority={priority}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-xs p-2">
              Постер отсутствует
            </div>
          )}
          {progressPercent !== null && <ProgressBar progress={progressPercent} />}
        </div>
        <div className="mt-2">
          <h3 className="text-sm font-medium truncate group-hover:text-primary">{title}</h3>
          <p className="text-xs text-muted-foreground">
            {formatAnimeType(anime.type)}
            {anime.year && anime.type ? " • " : ""}
            {anime.year}
          </p>
        </div>
      </Link>
    </AnimeListPopover>
  )
}
