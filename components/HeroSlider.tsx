"use client"

import Image from "next/image"
import Link from "next/link"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import type { Anime } from "@/lib/types"

interface HeroSliderProps {
  animeList: Anime[]
}

export function HeroSlider({ animeList }: HeroSliderProps) {
  if (!animeList || animeList.length === 0) {
    return (
      <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gray-800 flex items-center justify-center rounded-lg">
        <p className="text-white text-xl">Нет данных для слайдера</p>
      </div>
    )
  }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full max-w-full"
    >
      <CarouselContent>
        {animeList.map((anime) => (
          <CarouselItem key={anime.id}>
            <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden">
              <Image
                src={anime.poster_url || "/placeholder.svg?height=600&width=1200&text=Hero+Image"}
                alt={anime.title || "Anime Hero Image"}
                fill
                style={{ objectFit: "cover" }}
                className="brightness-50"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white max-w-2xl">
                <h2 className="text-3xl md:text-6xl font-bold mb-4 drop-shadow-lg">{anime.title}</h2>
                <p className="text-base md:text-lg mb-6 line-clamp-3 drop-shadow-md">
                  {anime.description || "Описание недоступно."}
                </p>
                <Link href={`/anime/${anime.id}`} passHref>
                  <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Play className="mr-2 h-5 w-5" />
                    Подробнее
                  </Button>
                </Link>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4 hidden md:flex" />
      <CarouselNext className="right-4 hidden md:flex" />
    </Carousel>
  )
}
