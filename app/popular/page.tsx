// app/popular/page.tsx

"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Calendar, Flame } from "lucide-react"
import { AnimeCard } from "@/components/anime-card"

// Интерфейс для данных аниме
interface Anime {
  id: number;
  shikimori_id: string;
  // ... и другие поля, которые приходят от /api/catalog
}

export default function PopularPage() {
  const [topRated, setTopRated] = useState<Anime[]>([])
  const [newest, setNewest] = useState<Anime[]>([])
  const [trending, setTrending] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPopularData = async () => {
      setLoading(true)
      try {
        // --- [ИЗМЕНЕНИЕ] Запрашиваем данные через наш быстрый /api/catalog ---
        const [ratedResponse, newestResponse, trendingResponse] = await Promise.all([
          fetch("/api/catalog?limit=20&sort=shikimori_rating"),
          fetch("/api/catalog?limit=20&sort=year"),
          fetch("/api/catalog?limit=20&sort=shikimori_votes"), // Тренды = самые популярные по голосам
        ])

        const [ratedData, newestData, trendingData] = await Promise.all([
          ratedResponse.json(),
          newestResponse.json(),
          trendingResponse.json(),
        ])

        setTopRated(ratedData.results || [])
        setNewest(newestData.results || [])
        setTrending(trendingData.results || [])
      } catch (error) {
        console.error("Error loading popular data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadPopularData()
  }, [])

  const renderAnimeGrid = (animeList: Anime[]) => {
    if (loading) {
      // Скелетный загрузчик для единообразия
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
      )
    }
    if (animeList.length === 0) {
      return <p className="text-center text-muted-foreground py-8">Не удалось загрузить данные.</p>
    }
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
        {animeList.map((anime, index) => (
          <AnimeCard key={anime.shikimori_id} anime={anime} priority={index < 10} />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-16 pb-16">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="flex items-center gap-3 mb-5 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-white">Популярное аниме</h1>
        </div>

        <Tabs defaultValue="rating" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-5 sm:mb-8 h-10 sm:h-11">
            <TabsTrigger value="rating" className="flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-3 text-[0.65rem] sm:text-sm">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="truncate">Топ рейтинг</span>
            </TabsTrigger>
            <TabsTrigger value="newest" className="flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-3 text-[0.65rem] sm:text-sm">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="truncate">Новинки</span>
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-3 text-[0.65rem] sm:text-sm">
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="truncate">В тренде</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rating">
            {renderAnimeGrid(topRated)}
          </TabsContent>
          <TabsContent value="newest">
            {renderAnimeGrid(newest)}
          </TabsContent>
          <TabsContent value="trending">
            {renderAnimeGrid(trending)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
