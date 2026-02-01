// components/anime-grid.tsx

"use client"

import { useState, useEffect } from "react"
import { AnimeCard } from "./anime-card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Star, Calendar } from "lucide-react"
import Link from "next/link"

// Упрощенный интерфейс
interface Anime {
  id: number;
  shikimori_id: string;
}

export function AnimeGrid() {
  const [popularAnime, setPopularAnime] = useState<Anime[]>([])
  const [topRatedAnime, setTopRatedAnime] = useState<Anime[]>([])
  const [newestAnime, setNewestAnime] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAnimeData = async () => {
      setLoading(true)
      try {
        // --- [ИЗМЕНЕНИЕ] Запрашиваем данные через наш быстрый /api/catalog ---
        const [popularResponse, topRatedResponse, newestResponse] = await Promise.all([
          fetch("/api/catalog?limit=12&sort=shikimori_votes"),
          fetch("/api/catalog?limit=8&sort=shikimori_rating"),
          fetch("/api/catalog?limit=8&sort=year"),
        ])
        
        const [popularData, topRatedData, newestData] = await Promise.all([
          popularResponse.json(),
          topRatedResponse.json(),
          newestResponse.json(),
        ])

        setPopularAnime(popularData.results || [])
        setTopRatedAnime(topRatedData.results || [])
        setNewestAnime(newestData.results || [])
      } catch (error) {
        console.error("Error loading anime data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadAnimeData()
  }, [])

  if (loading) {
    return (
        <div className="space-y-16">
            {/* Скелетный загрузчик для секций */}
            <div className="space-y-8">
                <div className="h-8 w-1/3 bg-muted rounded-md animate-pulse" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[2/3] bg-muted rounded-lg animate-pulse" />)}
                </div>
            </div>
            <div className="space-y-8">
                <div className="h-8 w-1/3 bg-muted rounded-md animate-pulse" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[2/3] bg-muted rounded-lg animate-pulse" />)}
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-16">
      {/* Популярные аниме */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-yellow-400" />
            <h2 className="text-3xl font-bold text-foreground">Популярные</h2>
          </div>
          <Button variant="outline" asChild>
            <Link href="/popular">Смотреть все</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {popularAnime.map((anime, i) => (
            <AnimeCard key={anime.shikimori_id} anime={anime} priority={i < 6} />
          ))}
        </div>
      </section>

      {/* Топ рейтинг */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8 text-yellow-400" />
            <h2 className="text-3xl font-bold text-foreground">Топ рейтинг</h2>
          </div>
          <Button variant="outline" asChild>
            <Link href="/popular">Смотреть все</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {topRatedAnime.map((anime, i) => (
            <AnimeCard key={anime.shikimori_id} anime={anime} priority={i < 4} />
          ))}
        </div>
      </section>

      {/* Новинки */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-400" />
            <h2 className="text-3xl font-bold text-foreground">Новинки</h2>
          </div>
          <Button variant="outline" asChild>
            <Link href="/catalog">Каталог</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {newestAnime.map((anime, i) => (
            <AnimeCard key={anime.shikimori_id} anime={anime} priority={i < 4} />
          ))}
        </div>
      </section>
    </div>
  )
}
