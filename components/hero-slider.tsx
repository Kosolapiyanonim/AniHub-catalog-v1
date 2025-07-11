"use client"

import Image from "next/image"
import Link from "next/link"
import type { Anime } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

interface HeroSliderProps {
  items?: Anime[] | null
}

export function HeroSlider({ items }: HeroSliderProps) {
  const [index, setIndex] = useState(0)
  const current = items ? items[index % items.length] : null

  const next = () => {
    if (items) {
      setIndex((i) => (i + 1) % items.length)
    }
  }
  const prev = () => {
    if (items) {
      setIndex((i) => (i - 1 + items.length) % items.length)
    }
  }

  return (
    <section className="relative h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden">
      {current ? (
        <Link href={`/anime/${current.id}`} className="block h-full w-full">
          <Image
            src={current.poster_url || "/placeholder.svg?width=1280&height=720"}
            alt={current.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/0" />
          <h2 className={cn("absolute bottom-8 left-8 text-2xl md:text-4xl font-bold max-w-lg drop-shadow")}>
            {current.title}
          </h2>
        </Link>
      ) : (
        <div className="h-[300px] md:h-[400px] lg:h-[500px] bg-slate-800 flex items-center justify-center text-muted-foreground">
          Нет данных
        </div>
      )}

      {items && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 hover:bg-black/80 transition"
            aria-label="Предыдущий"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 hover:bg-black/80 transition"
            aria-label="Следующий"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </section>
  )
}
