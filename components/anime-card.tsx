// components/anime-card.tsx
"use client"

import Image from "next/image"
import Link from "next/link"

export interface Anime {
  id: number
  title: string
  poster_url?: string | null
}

interface Props {
  anime: Anime
}

export function AnimeCard({ anime }: Props) {
  return (
    <Link
      href={`/anime/${anime.id}`}
      className="group block overflow-hidden rounded-md bg-slate-800 transition hover:scale-105"
    >
      <div className="relative aspect-[2/3] w-full">
        <Image
          src={anime.poster_url ?? "/placeholder.jpg"}
          alt={anime.title}
          fill
          sizes="(max-width:768px) 50vw, (max-width:1024px) 25vw, 16vw"
          className="object-cover"
        />
      </div>
      <div className="p-2 text-center text-sm">{anime.title}</div>
    </Link>
  )
}
