"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Play, Star, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

interface HeroAnime {
  id: number
  title: string
  description: string
  poster_url: string
  year: number
  rating: number
  genres: string[]
  status: string
  episodes_count?: number
}

interface HeroSliderProps {
  animes: HeroAnime[]
}

export function HeroSlider({ animes }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying || animes.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % animes.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [animes.length, isAutoPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % animes.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + animes.length) % animes.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  if (!animes.length) return null

  const currentAnime = animes[currentSlide]

  return (
    <div
      className="relative w-full h-[70vh] md:h-[80vh] lg:h-[85vh] overflow-hidden rounded-xl shadow-2xl"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background Image with Parallax Effect */}
      <div className="absolute inset-0 transition-transform duration-700 ease-out hover:scale-105">
        <Image
          src={currentAnime.poster_url || "/placeholder.jpg"}
          alt={currentAnime.title}
          fill
          className="object-cover"
          priority
        />

        {/* Multi-layer Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
      </div>

      {/* Content Container */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-2xl lg:max-w-3xl">
            {/* Animated Content */}
            <div className="space-y-4 md:space-y-6 animate-in slide-in-from-bottom-8 duration-700">
              {/* Title */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">
                  {currentAnime.title}
                </span>
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm md:text-base">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                  <Calendar className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-medium">{currentAnime.year}</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-full border border-yellow-400/30">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-medium">{currentAnime.rating}</span>
                </div>

                {currentAnime.episodes_count && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 backdrop-blur-md rounded-full border border-blue-400/30">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-medium">{currentAnime.episodes_count} эп.</span>
                  </div>
                )}

                <Badge
                  variant="outline"
                  className="px-3 py-1.5 bg-green-500/20 border-green-400/30 text-green-300 font-medium hover:bg-green-500/30 transition-colors"
                >
                  {currentAnime.status}
                </Badge>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {currentAnime.genres.slice(0, 4).map((genre, index) => (
                  <Badge
                    key={genre}
                    variant="secondary"
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-purple-200 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 hover:scale-105"
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>

              {/* Description */}
              <p className="text-gray-200 text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl line-clamp-3 md:line-clamp-4">
                {currentAnime.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4">
                <Button
                  asChild
                  size="lg"
                  className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold"
                >
                  <Link href={`/anime/${currentAnime.id}`}>
                    <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Смотреть
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="group bg-white/10 hover:bg-white/20 border-white/30 hover:border-white/50 text-white backdrop-blur-md transition-all duration-300 hover:scale-105 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold"
                >
                  <Link href={`/anime/${currentAnime.id}`}>Подробнее</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {animes.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-black/30 hover:bg-black/50 border border-white/20 hover:border-white/40 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 rounded-full"
            onClick={prevSlide}
          >
            <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-black/30 hover:bg-black/50 border border-white/20 hover:border-white/40 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 rounded-full"
            onClick={nextSlide}
          >
            <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
          </Button>
        </>
      )}

      {/* Slide Indicators */}
      {animes.length > 1 && (
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3">
          {animes.map((_, index) => (
            <button
              key={index}
              className={`h-1.5 md:h-2 rounded-full transition-all duration-300 hover:scale-110 ${
                index === currentSlide
                  ? "w-8 md:w-12 bg-gradient-to-r from-red-500 to-red-600 shadow-lg"
                  : "w-1.5 md:w-2 bg-white/40 hover:bg-white/60"
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {isAutoPlaying && animes.length > 1 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-100 ease-linear"
            style={{
              width: `${((Date.now() % 5000) / 5000) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  )
}
