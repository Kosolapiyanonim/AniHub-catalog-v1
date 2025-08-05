"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import type { Anime } from "@/lib/types"
import { Flame, Clock, Sparkles } from "lucide-react"

const DynamicAnimeCarousel = dynamic(() => import("./AnimeCarousel").then((mod) => mod.AnimeCarousel), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-64" />,
})

interface AnimeCarouselClientProps {
  title: string
  animeList: Anime[]
  type: "popular" | "recentlyUpdated" | "new"
}

const icons = {
  popular: <Flame className="w-7 h-7" />,
  recentlyUpdated: <Clock className="w-7 h-7" />,
  new: <Sparkles className="w-7 h-7" />,
}

export function AnimeCarouselClient({ title, animeList, type }: AnimeCarouselClientProps) {
  return <DynamicAnimeCarousel title={title} animeList={animeList} icon={icons[type]} />
}
