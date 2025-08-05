// components/anime-grid.tsx

"use client"
import { AnimeCard } from "@/components/anime-card"
import type { Anime } from "@/lib/types"

interface AnimeGridProps {
  animeList: Anime[]
}

export function AnimeGrid({ animeList }: AnimeGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {animeList.map((anime) => (
        <AnimeCard key={anime.id} anime={anime} />
      ))}
    </div>
  )
}
