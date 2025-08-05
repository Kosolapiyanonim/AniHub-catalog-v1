"use client"

import { useRef, useState } from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Play, Info, Star, Clapperboard, Calendar, Maximize, Minimize } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Anime } from "@/lib/types"

interface HeroSliderProps {
  items?: Anime[] | null
}

export function HeroSlider({ items }: HeroSliderProps) {
  const plugin = useRef(Autoplay({ delay: 7000, stopOnInteraction: true }))
  const validItems = items?.filter(Boolean) as Anime[]
  const [isFullscreen, setIsFullscreen] = useState(true)

  if (!validItems || validItems.length === 0) {
    return (
      <div
        className={`relative w-full ${isFullscreen ? "h-screen" : "h-[70vh] min-h-[500px]"} flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950 text-white ${!isFullscreen ? "container mx-auto px-4 rounded-lg" : ""}`}
      >
        <p className="text-xl text-center px-4">Отметьте аниме в базе для отображения в Hero-секции...</p>
      </div>
    )
  }

  return (
    <div
      className={`relative w-full ${isFullscreen ? "h-screen" : "h-[70vh] min-h-[500px]"} overflow-hidden ${!isFullscreen ? "container mx-auto px-4" : ""}`}
    >
      {/* Кнопка переключения режима */}
      <Button
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="absolute top-4 right-4 z-50 bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm rounded-full w-10 h-10 p-0 transition-all duration-300 hover:scale-110"
        size="sm"
      >
        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
      </Button>

      <Carousel
        className="w-full h-full"
        opts={{
          loop: true,
          duration: 30, // Увеличиваем длительность анимации для плавности
          dragFree: false,
          containScroll: "trimSnaps", // Предотвращает показ частей соседних слайдов
        }}
        plugins={[plugin.current]}
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent className="flex h-full -ml-0">
          {" "}
          {/* Убираем отрицательный отступ */}
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

            // Динамическое количество строк описания
            const getDescriptionLines = () => {
              if (isFullscreen) {
                return "line-clamp-4 sm:line-clamp-5 md:line-clamp-6 lg:line-clamp-7 xl:line-clamp-8"
              } else {
                return "line-clamp-3 sm:line-clamp-4 md:line-clamp-5"
              }
            }

            return (
              <CarouselItem key={anime.id} className="w-full min-w-full pl-0 pr-0 overflow-hidden h-full">
                {" "}
                {/* Убираем все отступы */}
                {/* --- МОБИЛЬНАЯ АДАПТАЦИЯ --- */}
                <div
                  className={`md:hidden relative w-full ${isFullscreen ? "h-screen" : "h-[70vh] min-h-[500px]"} ${!isFullscreen ? "rounded-lg overflow-hidden" : ""}`}
                >
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={backgroundImageUrl || "/placeholder.svg"}
                      alt={`Фон для ${anime.title}`}
                      fill
                      className={`object-cover transition-transform duration-1000 ease-in-out ${!isFullscreen ? "rounded-lg" : ""}`}
                      priority={index === 0}
                      sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-900 to-transparent"></div>
                  </div>

                  <div className="relative z-10 h-full w-full flex flex-col justify-end p-4 sm:p-6 pb-8">
                    <div className="text-white mb-6">
                      <Badge
                        variant="secondary"
                        className="mb-2 text-[0.6rem] sm:text-xs bg-white/10 text-purple-300 border border-purple-500/30 backdrop-blur-sm"
                      >
                        #{index + 1} В центре внимания
                      </Badge>
                      <h1 className="text-xl sm:text-2xl font-bold mb-2 leading-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                        {anime.title}
                      </h1>

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
                        <p
                          className={`text-gray-300 mb-3 ${getDescriptionLines()} text-[0.7rem] sm:text-xs opacity-90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]`}
                        >
                          {anime.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <div className="relative w-28 h-42 sm:w-32 sm:h-48 rounded-lg overflow-hidden shadow-xl ring-1 ring-white/20">
                        {anime.poster_url ? (
                          <Image
                            src={anime.poster_url || "/placeholder.svg"}
                            alt={`Постер для ${anime.title}`}
                            fill
                            className="object-cover transition-transform duration-500 ease-in-out"
                            sizes="(max-width: 640px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="bg-slate-800 w-full h-full flex items-center justify-center">
                            <span className="text-slate-500 text-[0.6rem]">Нет постера</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 w-full justify-center">
                        <Link href={`/anime/${anime.shikimori_id}/watch`} className="flex-1 max-w-[45%]">
                          <Button
                            size="sm"
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white shadow-md h-8 sm:h-10 text-[0.7rem] sm:text-sm transition-all duration-300"
                          >
                            <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="truncate">Смотреть</span>
                          </Button>
                        </Link>
                        <Link href={`/anime/${anime.shikimori_id}`} className="flex-1 max-w-[45%]">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm shadow-md h-8 sm:h-10 text-[0.7rem] sm:text-sm transition-all duration-300"
                          >
                            <Info className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="truncate">Подробнее</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                {/* --- КОНЕЦ МОБИЛЬНОЙ АДАПТАЦИИ --- */}
                {/* --- ДЕСКТОПНАЯ ВЕРСИЯ --- */}
                <div
                  className={`hidden md:block relative w-full ${isFullscreen ? "h-screen" : "h-[70vh] min-h-[500px]"} ${!isFullscreen ? "rounded-lg overflow-hidden" : ""}`}
                >
                  <div className="absolute inset-0 z-0">
                    <div className="absolute inset-y-0 left-0 w-1/2 filter blur-md scale-110">
                      <Image
                        src={backgroundImageUrl || "/placeholder.svg"}
                        alt={`Фон для ${anime.title}`}
                        fill
                        className={`object-cover transition-transform duration-1000 ease-in-out ${!isFullscreen ? "rounded-lg" : ""}`}
                        priority={index === 0}
                        sizes="(max-width: 1200px) 50vw, 50vw"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/70 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-900 to-transparent"></div>
                  </div>

                  <div className="relative z-10 h-full w-full flex flex-row items-center p-8 lg:p-12 xl:p-16">
                    <div className="w-1/2 text-left text-white pr-6">
                      <div className="max-w-2xl">
                        <Badge
                          variant="secondary"
                          className="mb-3 sm:mb-4 text-[0.7rem] sm:text-xs md:text-sm bg-white/10 text-purple-300 border border-purple-500/30 backdrop-blur-sm transition-all duration-300"
                        >
                          #{index + 1} В центре внимания
                        </Badge>
                        <h1
                          className={`${isFullscreen ? "text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl" : "text-xl sm:text-2xl md:text-3xl lg:text-4xl"} font-bold mb-3 sm:mb-4 leading-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] transition-all duration-500`}
                        >
                          {anime.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-gray-300 mb-3 sm:mb-4 text-xs sm:text-sm md:text-base">
                          {anime.shikimori_rating && (
                            <div className="flex items-center gap-1 transition-all duration-300">
                              <Star className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-400 fill-current" />
                              <span>{anime.shikimori_rating.toFixed(1)}</span>
                            </div>
                          )}
                          {anime.year && (
                            <div className="flex items-center gap-1 transition-all duration-300">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                              <span>{anime.year}</span>
                            </div>
                          )}
                          {anime.type && (
                            <Badge
                              variant="outline"
                              className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs border-gray-600 px-1.5 py-0.5 transition-all duration-300"
                            >
                              {anime.type.replace(/_/g, " ")}
                            </Badge>
                          )}
                          {episodeStatusText && (
                            <div className="flex items-center gap-1 transition-all duration-300">
                              <Clapperboard className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                              <span>{episodeStatusText}</span>
                            </div>
                          )}
                          {anime.status && (
                            <Badge
                              variant="outline"
                              className="text-[0.6rem] xs:text-[0.65rem] sm:text-xs border-purple-500 text-purple-400 px-1.5 py-0.5 transition-all duration-300"
                            >
                              {anime.status}
                            </Badge>
                          )}
                        </div>

                        {anime.description && (
                          <p
                            className={`text-gray-300 mb-4 sm:mb-6 ${getDescriptionLines()} text-xs sm:text-sm md:text-base opacity-90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] transition-all duration-500`}
                          >
                            {anime.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-3 sm:gap-4">
                          <Link href={`/anime/${anime.shikimori_id}/watch`}>
                            <Button
                              size="sm"
                              className="sm:size-md lg:size-lg bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl h-8 sm:h-10 md:h-12 px-3 sm:px-4 md:px-6 text-xs sm:text-sm md:text-base"
                            >
                              <Play className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-2" />
                              Смотреть
                            </Button>
                          </Link>
                          <Link href={`/anime/${anime.shikimori_id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="sm:size-md lg:size-lg bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm shadow-lg transform transition-all duration-300 hover:scale-105 h-8 sm:h-10 md:h-12 px-3 sm:px-4 md:px-6 text-xs sm:text-sm md:text-base"
                            >
                              <Info className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-2" />
                              Подробнее
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* ПОСТЕР */}
                    <div className="w-1/2 h-full flex items-center justify-center pl-6">
                      <div
                        className={`relative ${isFullscreen ? "w-40 h-60 sm:w-48 sm:h-72 md:w-56 md:h-80 lg:w-64 lg:h-96 xl:w-72 xl:h-[32rem] 2xl:w-80 2xl:h-[36rem]" : "w-32 h-48 sm:w-40 sm:h-60 md:w-48 md:h-72 lg:w-56 lg:h-80"} rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/20 transform transition-all duration-700 hover:scale-105 group`}
                      >
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/20 via-transparent to-cyan-500/20 pointer-events-none z-10 opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
                        {anime.poster_url ? (
                          <Image
                            src={anime.poster_url || "/placeholder.svg"}
                            alt={`Постер для ${anime.title}`}
                            fill
                            className="object-cover transition-transform duration-700 ease-in-out"
                            sizes="(max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                          />
                        ) : (
                          <div className="bg-slate-800 w-full h-full flex items-center justify-center">
                            <span className="text-slate-500 text-xs">Нет постера</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* --- КОНЕЦ ДЕСКТОПНОЙ ВЕРСИИ --- */}
              </CarouselItem>
            )
          })}
        </CarouselContent>

        {/* --- СТРЕЛОЧКИ ДЛЯ ДЕСКТОПА --- */}
        <CarouselPrevious className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm w-10 h-10 rounded-full shadow-lg transition-all duration-300 hover:scale-110" />
        <CarouselNext className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm w-10 h-10 rounded-full shadow-lg transition-all duration-300 hover:scale-110" />
        {/* --- КОНЕЦ СТРЕЛОЧЕК ДЛЯ ДЕСКТОПА --- */}
      </Carousel>
    </div>
  )
}
