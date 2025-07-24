"use client"

import dynamic from "next/dynamic"
import type { ComponentProps } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"

// Dynamically load the real carousel once we're on the client
const DynamicAnimeCarousel = dynamic(() => import("@/components/AnimeCarousel").then((mod) => mod.AnimeCarousel), {
  // Nice loading state while JS bundles
  loading: () => (
    <div className="h-64 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  ),
  ssr: false, // turn off server-side render for this heavy interactive widget
})

// Re-export as a plain functional component
export function AnimeCarouselClient(props: ComponentProps<typeof DynamicAnimeCarousel>) {
  return <DynamicAnimeCarousel {...props} />
}

export default AnimeCarouselClient
