"use client"

import React, { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { Button } from "@/components/ui/button"
import { Play, Info, Star, Clapperboard, Calendar, Maximize, Minimize } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import type { Anime } from "@/lib/types"

interface HeroSlide {
  id: number
  title: string
  description: string
  imageUrl: string
  link: string
}

const slides: HeroSlide[] = [
  {
    id: 1,
    title: 'Откройте для себя мир аниме',
    description: 'Тысячи аниме-сериалов и фильмов ждут вас.',
    imageUrl: '/placeholder.jpg?height=1080&width=1920&query=anime+hero+1',
    link: '/catalog',
  },
  {
    id: 2,
    title: 'Следите за любимыми сериалами',
    description: 'Добавляйте аниме в списки и никогда не пропускайте новые эпизоды.',
    imageUrl: '/placeholder.jpg?height=1080&width=1920&query=anime+hero+2',
    link: '/register',
  },
  {
    id: 3,
    title: 'Будьте в курсе новостей',
    description: 'Последние новости и обзоры из мира аниме.',
    imageUrl: '/placeholder.jpg?height=1080&width=1920&query=anime+hero+3',
    link: '/blog',
  },
]

interface HeroSliderProps {
  items?: Anime[] | null
}

export function HeroSlider({ items }: HeroSliderProps) {
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
  )
  const validItems = items?.filter(Boolean) as Anime[]
  const [isFullscreen, setIsFullscreen] = useState(true)

  // Динамическое количество строк описания
  const getDescriptionLines = () => {
    if (isFullscreen) {
      return "line-clamp-4 sm:line-clamp-5 md:line-clamp-6 lg:line-clamp-7 xl:line-clamp-8"
    } else {
      return "line-clamp-3 sm:line-clamp-4 md:line-clamp-5"
    }
  }

  if (!validItems || validItems.length === 0) {
    return (
      <div
        className={`relative w-full ${isFullscreen ? "h-[calc(100vh-4rem)]" : "h-[70vh] min-h-[500px]"} flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950 text-white ${!isFullscreen ? "container mx-auto px-4 rounded-lg" : ""}`}
      >
        <p className="text-xl text-center px-4">Отметьте аниме в базе для отображения в Hero-секции...</p>
      </div>
    )
  }

  return (
    <div
      className={`relative w-full ${isFullscreen ? "h-[calc(100vh-4rem)]" : "h-[70vh] min-h-[500px]"} overflow-hidden ${!isFullscreen ? "container mx-auto px-4" : ""}`}
    >
      {/* Кнопка переключения режима - только на десктопе */}
      <Button
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="hidden md:flex absolute top-4 right-4 z-50 bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm rounded-full w-10 h-10 p-0 transition-all duration-300 hover:scale-110"
        size="sm"
      >
        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
      </Button>

      <Carousel
        plugins={[plugin.current]}
        className="w-full max-w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.play}
      >
        <CarouselContent>
          {validItems.map((anime, index) => {
            const backgroundImageUrl =
              anime.background_image_url || anime.poster_url || "/placeholder.svg?height=1080&width=1920"

            let episodeStatusText = ""
            if (anime.episodes_total === 1 && anime.episodes_aired === 1) {
              episodeStatusText = "Полнометражное"
            } else if (anime.episodes_total != null && anime.episodes_aired != null) {
              if (anime.episodes_aired < anime.episodes_total) {
                episodeStatusText = `${anime.episodes_aired} из ${anime.episodes_total} эп.`
              } else {
                episodeStatusText = `${anime.episodes_total} эп.`
              }
            } else if (anime.episodes_aired != null) {
              episodeStatusText = `${anime.episodes_aired} эп.`
            }

            return (
              <CarouselItem key={anime.id}>
                <div className="relative w-full h-[calc(100vh-64px)]">
                  <Image
                    src={backgroundImageUrl || "/placeholder.svg"}
                    alt={`Фон для ${anime.title}`}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col items-center justify-end p-8 text-center text-white">
                    <Badge
                      variant="secondary"
                      className="mb-2 text-[0.6rem] sm:text-xs bg-white/10 text-purple-300 border border-purple-500/30 backdrop-blur-sm"
                    >
                      #{index + 1} В центре внимания
                    </Badge>
                    <h2 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                      {anime.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 text-gray-300 mb-2 text-[0.65rem] sm:text-xs">
                      {anime.shikimori_rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span>{anime.shikimori_rating.toFixed(1)}</span>
                        </div>
                      )}
                      {anime.year && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{anime.year}</span>
                        </div>
                      )}
                      {episodeStatusText && (
                        <div className="flex items-center gap-1">
                          <Clapperboard className="w-3 h-3" />
                          <span>{episodeStatusText}</span>
                        </div>
                      )}
                    </div>
                    {anime.description && (
                      <p className={`text-gray-300 mb-4 sm:mb-6 ${getDescriptionLines()} text-xs sm:text-sm md:text-base opacity-90 drop-shadow-md`}>
                        {anime.description}
                      </p>
                    )}
                    <div className="flex gap-3 w-full justify-center">
                      <Link href={`/anime/${anime.shikimori_id}/watch`} className="flex-1 max-w-[45%]">
                        <Button
                          size="lg"
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Смотреть
                        </Button>
                      </Link>
                      <Link href={`/anime/${anime.shikimori_id}`} className="flex-1 max-w-[45%]">
                        <Button
                          size="lg"
                          variant="outline"
                          className="bg-white/10 hover:bg-white/20 border-white/30 text-white"
                        >
                          <Info className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Подробнее
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            )
          })}
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className="relative w-full h-[calc(100vh-64px)]">
                <Image
                  src={slide.imageUrl || "/placeholder.svg"}
                  alt={slide.title}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col items-center justify-end p-8 text-center text-white">
                  <h2 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                    {slide.title}
                  </h2>
                  <p className="text-lg md:text-xl mb-8 max-w-2xl drop-shadow-md">
                    {slide.description}
                  </p>
                  <Link href={slide.link} passHref>
                    <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
                      Узнать больше
                    </Button>
                  </Link>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-20" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-20" />
      </Carousel>
    </div>
  )
}
