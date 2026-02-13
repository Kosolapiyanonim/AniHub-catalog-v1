"use client"

import { useEffect, useState } from "react"
import { HeroSlider } from "@/components/HeroSlider"
import type { Anime } from "@/lib/types"

interface HomeHeroEnhancerProps {
  items: Anime[]
}

export function HomeHeroEnhancer({ items }: HomeHeroEnhancerProps) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsReady(true)
    }, 1200)

    return () => window.clearTimeout(timer)
  }, [])

  if (!isReady || items.length === 0) {
    return null
  }

  return (
    <div className="absolute inset-0 z-20">
      <HeroSlider items={items} />
    </div>
  )
}
