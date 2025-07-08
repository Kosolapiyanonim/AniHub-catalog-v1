"use client"

import Link from "next/link"
import Image from "next/image"

interface AnimeCardProps {
  anime: {
    id: number
    shikimori_id: string
    title: string
    poster_url?: string | null
    year?: number | null
  }
  priority?: boolean
}

const blurDataURL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="

export function AnimeCard({ anime, priority = false }: AnimeCardProps) {
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
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            quality={75}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            placeholder="blur"
            blurDataURL={blurDataURL}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 text-center text-xs p-2">
            Постер отсутствует
          </div>
        )}
      </div>
      <div className="mt-2 min-h-[2.5rem]">
        <h3 className="text-sm font-medium text-white line-clamp-2 leading-tight group-hover:text-purple-400">
          {anime.title}
        </h3>
        {anime.year && <p className="text-xs text-slate-400 mt-1">{anime.year}</p>}
      </div>
    </Link>
  )
}
