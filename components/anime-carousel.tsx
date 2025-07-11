"use client"

import type React from "react"

import { AnimeCard } from "@/components/anime-card"
import type { Anime } from "@/lib/types"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface AnimeCarouselProps {
  title: string
  items?: Anime[] | null
  viewAllLink: string
  icon?: React.ReactNode
}

export function AnimeCarousel({ title, items, viewAllLink, icon }: AnimeCarouselProps) {
  if (!items?.length) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          {icon} {title}
        </h3>
        <Link href={viewAllLink} className="text-sm hover:underline">
          Смотреть все →
        </Link>
      </div>
      <div className={cn("flex gap-4 overflow-x-auto pb-2")}>
        {items.map((anime) => (
          <AnimeCard key={anime.id} anime={anime} className="min-w-[150px] max-w-[150px]" />
        ))}
      </div>
    </section>
  )
}
