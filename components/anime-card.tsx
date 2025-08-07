'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Anime } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnimeListPopover } from './AnimeListPopover'
import { cn } from '@/lib/utils'

interface AnimeCardProps {
  anime: Anime
  className?: string
}

export function AnimeCard({ anime, className }: AnimeCardProps) {
  const posterUrl = anime.poster_url || '/placeholder.svg?height=300&width=200';

  return (
    <Card className={cn("relative group overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 bg-slate-800 border-slate-700", className)}>
      <Link href={`/anime/${anime.id}`} className="block">
        <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96 overflow-hidden">
          <Image
            src={posterUrl || "/placeholder.svg"}
            alt={anime.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            <h3 className="text-lg font-semibold text-white leading-tight">{anime.title}</h3>
          </div>
        </div>
      </Link>
      <CardContent className="p-3 space-y-2">
        <div className="flex justify-between items-center">
          <Badge variant="secondary" className="bg-purple-600 text-white">
            {anime.type || 'Аниме'}
          </Badge>
          {anime.shikimori_rating && (
            <span className="text-sm font-medium text-yellow-400">
              ⭐ {anime.shikimori_rating.toFixed(1)}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-300 truncate">{anime.description || 'Описание отсутствует.'}</p>
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-slate-400">{anime.year}</span>
          <AnimeListPopover anime={anime} />
        </div>
      </CardContent>
    </Card>
  )
}
