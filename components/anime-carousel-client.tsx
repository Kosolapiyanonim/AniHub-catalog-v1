"use client"

import { useEffect, useState } from "react"
import { AnimeCarousel } from "@/components/AnimeCarousel"
import { LoadingSpinner } from "@/components/loading-spinner"
import { fetchHomepageSection } from "@/lib/data-fetchers"
import type { Anime } from "@/lib/types"

interface AnimeCarouselClientProps {
  section: "trending" | "popular" | "latestUpdates"
  title: string
}

export function AnimeCarouselClient({ section, title }: AnimeCarouselClientProps) {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getAnimes = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchHomepageSection(section)
        if (data && Array.isArray(data)) {
          setAnimes(data)
        } else {
          setAnimes([])
          setError(`No data found for ${section} section or data format is incorrect.`)
          console.warn(`Unexpected data format for ${section}:`, data)
        }
      } catch (err) {
        console.error(`Failed to fetch ${section} animes:`, err)
        setError(`Failed to load ${section} animes. Please try again later.`)
        setAnimes([])
      } finally {
        setLoading(false)
      }
    }

    getAnimes()
  }, [section])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
      </div>
    )
  }

  if (!animes || animes.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        <p>Нет данных для отображения в секции "{title}".</p>
      </div>
    )
  }

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-4 px-4">{title}</h2>
      <AnimeCarousel animes={animes} />
    </section>
  )
}
