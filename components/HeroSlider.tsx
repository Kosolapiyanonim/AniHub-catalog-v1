"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Info, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface HeroAnime {
  id: number
  shikimori_id: number
  title: string
  description: string | null
  poster_url: string | null
  year: number | null
  type: string | null
  genres: string[]
  shikimori_rating: number | null
}

export function HeroSlider() {
  const [animes, setAnimes] = useState<HeroAnime[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHeroAnimes = async () => {
      try {
        const response = await fetch("/api/homepage-sections?section=hero&limit=5")
        if (response.ok) {
          const data = await response.json()
          setAnimes(data)
        }
      } catch (error) {
        console.error("Failed to fetch hero animes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHeroAnimes()
  }, [])

  useEffect(() => {
    if (animes.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % animes.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [animes.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + animes.length) % animes.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % animes.length)
  }

  if (loading) {
    return (
      <div className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] bg-slate-800 rounded-lg overflow-hidden animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
      </div>
    )
  }

  if (animes.length === 0) {
    return (
      <div className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
        <p className="text-slate-400">Нет данных для отображения</p>
      </div>
    )
  }

  const currentAnime = animes[currentIndex]

  return (
    <div className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] rounded-lg overflow-hidden group">
      {/* Background Image */}
      <div className="absolute inset-0">
        {currentAnime.poster_url ? (
          <Image
            src={currentAnime.poster_url || "/placeholder.svg"}
            alt={currentAnime.title}
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-slate-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-slate-900/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-transparent to-transparent" />
      </div>

      {/* Navigation Arrows */}
      {animes.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Предыдущий слайд"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Следующий слайд"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Content */}
      <div className="absolute inset-0 flex items-end">
        <div className="w-full p-4 sm:p-6 lg:p-8">
          <div className="max-w-2xl space-y-3 sm:space-y-4">
            {/* Genres */}
            {currentAnime.genres && currentAnime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {currentAnime.genres.slice(0, 3).map((genre) => (
                  <Badge key={genre} variant="secondary" className="bg-purple-600/80 text-white text-xs px-2 py-1">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight">
              {currentAnime.title}
            </h1>

            {/* Meta Info */}
            <div className="flex items-center gap-2 sm:gap-4 text-sm text-slate-300">
              {currentAnime.year && <span>{currentAnime.year}</span>}
              {currentAnime.type && (
                <>
                  <span>•</span>
                  <span className="capitalize">{currentAnime.type}</span>
                </>
              )}
              {currentAnime.shikimori_rating && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">⭐ {currentAnime.shikimori_rating.toFixed(1)}</span>
                </>
              )}
            </div>

            {/* Description */}
            {currentAnime.description && (
              <p className="text-slate-200 text-sm sm:text-base line-clamp-2 sm:line-clamp-3 max-w-xl">
                {currentAnime.description}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
              <Link href={`/anime/${currentAnime.shikimori_id}`}>
                <Button size="lg" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white">
                  <Play className="w-4 h-4 mr-2" />
                  Смотреть
                </Button>
              </Link>
              <Link href={`/anime/${currentAnime.shikimori_id}`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 bg-transparent"
                >
                  <Info className="w-4 h-4 mr-2" />
                  Подробнее
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      {animes.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {animes.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all",
                index === currentIndex ? "bg-white" : "bg-white/50 hover:bg-white/70",
              )}
              aria-label={`Перейти к слайду ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
