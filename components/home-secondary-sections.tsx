"use client"

import { useEffect, useState } from "react"
import { AnimatedSection } from "@/components/animated-section"
import { AnimeCarousel } from "@/components/anime-carousel"

type SectionItem = {
  id: number
  shikimori_id: string
  title: string
  poster_url?: string | null
  year?: number | null
  type?: string
}

type HomeSectionsPayload = {
  trending: SectionItem[]
  popular: SectionItem[]
  latestUpdates: SectionItem[]
}

const EMPTY_SECTIONS: HomeSectionsPayload = {
  trending: [],
  popular: [],
  latestUpdates: [],
}

export function HomeSecondarySections() {
  const [sections, setSections] = useState<HomeSectionsPayload>(EMPTY_SECTIONS)

  useEffect(() => {
    let isMounted = true

    const loadSections = async () => {
      try {
        const response = await fetch("/api/home/sections", { cache: "force-cache" })
        if (!response.ok) return
        const data = (await response.json()) as HomeSectionsPayload
        if (isMounted) {
          setSections(data)
        }
      } catch (error) {
        console.error("Не удалось загрузить вторичные секции:", error)
      }
    }

    loadSections()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <>
      {sections.popular.length > 0 ? (
        <AnimatedSection>
          <AnimeCarousel title="Популярное" items={sections.popular} viewAllLink="/catalog?sort=popular" />
        </AnimatedSection>
      ) : null}

      {sections.trending.length > 0 ? (
        <AnimatedSection delay={100}>
          <AnimeCarousel title="В тренде" items={sections.trending} viewAllLink="/catalog?sort=trending" />
        </AnimatedSection>
      ) : null}

      {sections.latestUpdates.length > 0 ? (
        <AnimatedSection delay={200}>
          <AnimeCarousel title="Последние обновления" items={sections.latestUpdates} viewAllLink="/catalog?sort=updated" />
        </AnimatedSection>
      ) : null}
    </>
  )
}
