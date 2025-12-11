// /components/AnimeCarousel.tsx
"use client"

import type React from "react"

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { AnimeCard } from "./anime-card"
import Link from "next/link"
import { Button } from "./ui/button"
import { ArrowRight } from "lucide-react"

interface AnimeCarouselProps {
  title?: string
  items?: any[] | null
  animes?: any[] | null
  viewAllLink?: string
  icon?: React.ReactNode
}

export function AnimeCarousel({ title, items, animes, viewAllLink, icon }: AnimeCarouselProps) {
  const rawItems = items || animes || []
  const validItems = rawItems.filter(Boolean)

  if (!validItems || validItems.length === 0) return null

  const transformedItems = validItems.map((anime: any) => ({
    id: anime.id,
    shikimori_id: anime.shikimori_id || anime.id,
    title: typeof anime.title === "object" ? anime.title.ru || anime.title.en : anime.title,
    poster_url: anime.poster_url || anime.poster,
    year: anime.year,
    type: anime.type,
  }))

  return (
    <section>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && <div className="text-purple-400">{icon}</div>}
            <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          </div>
          {viewAllLink && (
            <Button variant="outline" asChild>
              <Link href={viewAllLink} className="flex items-center">
                Смотреть все <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          )}
        </div>
      )}
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {transformedItems.map((anime: any, index: number) => (
            <CarouselItem key={anime.id || index} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
              <div className="p-1">
                <AnimeCard anime={anime} priority={index < 5} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </section>
  )
}
