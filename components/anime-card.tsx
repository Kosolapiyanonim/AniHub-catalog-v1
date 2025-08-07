"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimeListPopover } from "@/components/AnimeListPopover"
import { type Anime } from "@/lib/types"

interface AnimeCardProps {
  anime: Anime
}

export function AnimeCard({ anime }: AnimeCardProps) {
  return (
    <Card className="relative w-full aspect-[2/3] rounded-lg overflow-hidden group bg-slate-800/50 border-slate-700 hover:border-purple-500 transition-all duration-200">
      <Link href={`/anime/${anime.shikimori_id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View {anime.title}</span>
      </Link>
      <CardContent className="p-0 h-full w-full">
        <Image
          src={anime.poster_url || "/placeholder.svg"}
          alt={anime.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white z-20">
          <h3 className="text-sm font-semibold line-clamp-2 mb-1">
            {anime.title}
          </h3>
          <p className="text-xs text-slate-300 line-clamp-1">
            {anime.episodes_aired} / {anime.episodes_total || "??"} эп.
          </p>
        </div>
        <div className="absolute top-2 right-2 z-20">
          {anime.status && (
            <Badge variant="secondary" className="bg-purple-600/80 text-white text-xs px-2 py-0.5">
              {anime.status}
            </Badge>
          )}
        </div>
        <div className="absolute top-2 left-2 z-20">
          {anime.shikimori_rating && (
            <Badge variant="secondary" className="bg-yellow-500/80 text-white text-xs px-2 py-0.5">
              ⭐ {anime.shikimori_rating}
            </Badge>
          )}
        </div>
        <div className="absolute bottom-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <AnimeListPopover anime={anime} />
        </div>
      </CardContent>
    </Card>
  )
}
