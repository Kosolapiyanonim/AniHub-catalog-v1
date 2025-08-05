"use client"

import { useEffect, useState } from "react"
import { AnimeCarousel } from "@/components/AnimeCarousel"
import { LoadingSpinner } from "@/components/loading-spinner"
import type { Anime } from "@/lib/types"

interface AnimeCarouselClientProps {
  animeList: Anime[]
}

export function AnimeCarouselClient({ animeList }: AnimeCarouselClientProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="flex justify-center items-center h-48">
        <LoadingSpinner />
      </div>
    )
  }

  return <AnimeCarousel title="" animeList={animeList} />
}
