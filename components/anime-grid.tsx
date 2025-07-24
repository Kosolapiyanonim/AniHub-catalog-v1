"use client"

import { useState, useEffect } from "react"
import { AnimeCard } from "./anime-card"
import { LoadingSpinner } from "./loading-spinner"
import { Button } from "@/components/ui/button"
import { TrendingUp, Star, Calendar } from "lucide-react"

interface Translation {
  id: string
  title: string
  type: string
  quality: string
  link: string
}

interface Anime {
  id: string
  title: string
  title_orig?: string
  other_title?: string
  year: number
  poster_url: string
  description: string
  rating: number
  genres: string[]
  episodes_total?: number
  status: string
  translations: Translation[]
  screenshots: string[]
}

export function AnimeGrid() {
  const [popularAnime, setPopularAnime] = useState<Anime[]>([])
  const [topRatedAnime, setTopRatedAnime] = useState<Anime[]>([])
  const [newestAnime, setNewestAnime] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnimeData()
  }, [])

  async function loadAnimeData() {
    setLoading(true)
    try {
      // Загружаем популярные аниме
      const popularResponse = await fetch("/api/anime/popular?limit=12")
      const popularData = await popularResponse.json()
      setPopularAnime(popularData.results || [])

      // Загружаем топ рейтинг (можно использовать тот же API с другими параметрами)
      const topRatedResponse = await fetch("/api/anime/popular?limit=8&sort=rating")
      const topRatedData = await topRatedResponse.json()
      setTopRatedAnime(topRatedData.results || [])

      // Загружаем новинки
      const newestResponse = await fetch("/api/anime/popular?limit=8&sort=year")
      const newestData = await newestResponse.json()
      setNewestAnime(newestData.results || [])
    } catch (error) {
      console.error("Error loading anime data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
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
            <h2 className="text-3xl font-bold text-white">Популярные</h2>
          </div>
          <Button variant="outline" asChild>
            <a href="/popular">Смотреть все</a>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {popularAnime.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </section>

      {/* Топ рейтинг */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8 text-yellow-400" />
            <h2 className="text-3xl font-bold text-white">Топ рейтинг</h2>
          </div>
          <Button variant="outline" asChild>
            <a href="/popular">Смотреть все</a>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {topRatedAnime.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </section>

      {/* Новинки */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-400" />
            <h2 className="text-3xl font-bold text-white">Новинки</h2>
          </div>
          <Button variant="outline" asChild>
            <a href="/catalog">Каталог</a>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {newestAnime.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </section>
    </div>
  )
}
