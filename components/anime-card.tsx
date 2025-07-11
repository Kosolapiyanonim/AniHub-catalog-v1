"use client"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Anime {
  id: number
  shikimori_id: string
  title: string
  poster_url?: string | null
  year?: number | null
}

interface Props {
  anime: Anime
  priority?: boolean
  className?: string
}

export function AnimeCard({ anime, priority = false, className }: Props) {
  return (
    <Link
      href={`/anime/${anime.id}`}
      className={cn(
        "group relative rounded-md overflow-hidden bg-slate-800 hover:ring-2 hover:ring-primary transition",
        className,
      )}
    >
      <Image
        src={anime.poster_url || "/placeholder.svg?width=300&height=450"}
        alt={anime.title}
        width={300}
        height={450}
        priority={priority}
        className="object-cover w-full h-full group-hover:scale-105 transition-transform"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-black/0 p-2">
        <h3 className="text-sm line-clamp-2">{anime.title}</h3>
      </div>
    </Link>
  )
}
