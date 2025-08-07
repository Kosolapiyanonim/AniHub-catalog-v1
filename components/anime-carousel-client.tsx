'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Anime } from '@/lib/types'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Card, CardContent } from '@/components/ui/card'
import { AnimeListPopover } from './AnimeListPopover'
import { AnimeHoverCardListButton } from './anime-hover-card-list-button'
import { User as SupabaseUser } from '@supabase/auth-helpers-nextjs'

interface AnimeCarouselClientProps {
  animes: Anime[]
  user: SupabaseUser | null
}

export function AnimeCarouselClient({ animes, user }: AnimeCarouselClientProps) {
  return (
    <Carousel
      opts={{
        align: 'start',
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-4">
        {animes.map((anime) => (
          <CarouselItem key={anime.id} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
            <div className="p-1">
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
                </div>
                {user && (
                  <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <AnimeListPopover animeId={anime.id} userId={user.id}>
                      <AnimeHoverCardListButton />
                    </AnimeListPopover>
                  </div>
                )}
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
