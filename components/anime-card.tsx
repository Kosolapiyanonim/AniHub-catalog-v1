'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Anime } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnimeListPopover } from './AnimeListPopover'
import { AnimeCardListButton } from './anime-card-list-button'
import { User as SupabaseUser } from '@supabase/auth-helpers-nextjs'

interface AnimeCardProps {
  anime: Anime
  user: SupabaseUser | null
}

export function AnimeCard({ anime, user }: AnimeCardProps) {
  return (
    <Card className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out">
      <Link href={`/anime/${anime.id}`} className="absolute inset-0 z-10" prefetch={false}>
        <span className="sr-only">View {anime.title}</span>
      </Link>
      <CardContent className="flex aspect-[2/3] items-center justify-center p-0">
        <Image
          src={anime.poster_url || '/placeholder.svg?height=300&width=200&text=No+Poster'}
          alt={anime.title}
          width={200}
          height={300}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
      </CardContent>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="text-sm font-semibold truncate">{anime.title}</h3>
        {anime.shikimori_rating && (
          <p className="text-xs text-muted-foreground">Рейтинг: {anime.shikimori_rating}</p>
        )}
        <div className="flex flex-wrap gap-1 mt-1">
          {anime.genres && anime.genres.slice(0, 2).map((genre) => (
            <Badge key={genre} variant="secondary" className="text-xs px-1 py-0.5">
              {genre}
            </Badge>
          ))}
        </div>
      </div>
      {user && (
        <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <AnimeListPopover animeId={anime.id} userId={user.id}>
            <AnimeCardListButton />
          </AnimeListPopover>
        </div>
      )}
    </Card>
  )
}
