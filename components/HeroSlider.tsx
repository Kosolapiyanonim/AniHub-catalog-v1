"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Play, Pause, ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Anime } from "@/lib/types"
import Link from "next/link"

interface HeroSliderProps {
  animes: Anime[]
}

export function HeroSlider({ animes }: HeroSliderProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [isPlaying, setIsPlaying] = React.useState(true)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetTimeout = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  React.useEffect(() => {
    if (!api) {
      return
    }

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })

    const play = () => {
      if (isPlaying) {
        timeoutRef.current = setTimeout(() => {
          api.scrollNext()
        }, 5000)
      }
    }

    api.on("settle", play)
    play()

    return () => {
      resetTimeout()
      api.off("settle", play)
    }
  }, [api, isPlaying, resetTimeout])

  const togglePlay = () => {
    setIsPlaying((prev) => !prev)
    resetTimeout()
  }

  if (!animes || animes.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] md:h-[500px] lg:h-[600px] bg-gray-900 text-white">
        <p className="text-xl">Нет данных для отображения в Hero Slider.</p>
      </div>
    )
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg shadow-lg">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {animes.map((anime, index) => (
            <CarouselItem key={anime.id || index}>
              <Card className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden">
                <Image
                  src={anime.poster || "/placeholder.svg?height=600&width=1200&query=anime-hero-background"}
                  alt={anime.name || "Anime Poster"}
                  fill
                  style={{ objectFit: "cover" }}
                  className="absolute inset-0 z-0"
                  priority={index === 0}
                />
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/60 to-transparent" />
                <div className="absolute inset-0 z-20 bg-gradient-to-r from-black via-black/20 to-transparent" />

                <CardContent className="relative z-30 flex flex-col justify-end h-full p-6 md:p-10 lg:p-12 text-white">
                  <div className="max-w-3xl space-y-4">
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-lg">
                      {anime.name || "Название не указано"}
                    </h2>
                    <p className="text-base md:text-lg lg:text-xl text-gray-200 line-clamp-3">
                      {anime.description || "Описание отсутствует."}
                    </p>
                    <div className="flex flex-wrap gap-2 text-sm md:text-base">
                      {anime.anime_genres && Array.isArray(anime.anime_genres) && anime.anime_genres.length > 0 ? (
                        anime.anime_genres.map((genre, genreIndex) => (
                          <span
                            key={genre.genres?.id || genreIndex}
                            className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md transition-all duration-300 hover:scale-105"
                          >
                            {genre.genres?.name || "Жанр"}
                          </span>
                        ))
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-gray-700 text-white shadow-md">
                          Жанры не указаны
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-md transition-all duration-300 hover:scale-105">
                        Рейтинг: {anime.score || "N/A"}
                      </span>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <Link href={`/anime/${anime.id}`}>
                        <Button className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
                          Подробнее
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="bg-white/20 backdrop-blur-sm text-white border-white hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
                        onClick={togglePlay}
                      >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                        <span className="ml-2">{isPlaying ? "Пауза" : "Воспроизвести"}</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40">
          <CarouselPrevious className="relative w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-300 flex items-center justify-center shadow-lg">
            <ChevronUp className="h-6 w-6" />
          </CarouselPrevious>
          <div className="w-0.5 h-12 bg-gradient-to-b from-transparent via-white/50 to-transparent mx-auto" />
          <CarouselNext className="relative w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-300 flex items-center justify-center shadow-lg">
            <ChevronDown className="h-6 w-6" />
          </CarouselNext>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-40">
          {animes.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                current === index ? "w-8 bg-white" : "w-2 bg-gray-400",
              )}
            />
          ))}
        </div>
      </Carousel>
    </div>
  )
}
