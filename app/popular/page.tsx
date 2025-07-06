"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Star, Calendar, Users, FlameIcon as Fire } from "lucide-react"
import { AnimeCard } from "@/components/anime-card"

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
  year: number
  poster_url: string
  rating: number
  shikimori_votes: number
  genres: string[]
  translations: Translation[]
  episodes_total?: number
  status: string
}

export default function PopularPage() {
  const [topRated, setTopRated] = useState<Anime[]>([])
  const [newest, setNewest] = useState<Anime[]>([])
  const [trending, setTrending] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("rating")

  useEffect(() => {
    loadPopularData()
  }, [])

  async function loadPopularData() {
    setLoading(true)
    try {
      // Загружаем разные категории популярного контента
      const [ratedResponse, newestResponse, trendingResponse] = await Promise.all([
        fetch("/api/anime/popular?limit=20&sort=rating"),
        fetch("/api/anime/popular?limit=20&sort=year"),
        fetch("/api/anime/popular?limit=20&sort=trending"),
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

  const formatVotes = (votes: number) => {
    if (votes >= 1000000) return `${(votes / 1000000).toFixed(1)}M`
    if (votes >= 1000) return `${(votes / 1000).toFixed(1)}K`
    return votes.toString()
  }

  const renderAnimeGrid = (animeList: Anime[], emptyMessage: string) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      )
    }

    if (animeList.length === 0) {
      return <p className="text-center text-muted-foreground py-8">{emptyMessage}</p>
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {animeList.map((anime, index) => (
          <div key={anime.id} className="relative">
            {/* Позиция в топе */}
            <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded-full text-sm font-bold z-10">
              #{index + 1}
            </div>
            <AnimeCard anime={anime} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 pb-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-8 h-8 text-yellow-400" />
          <h1 className="text-4xl font-bold text-white">Популярное аниме</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="rating" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Топ рейтинг
            </TabsTrigger>
            <TabsTrigger value="newest" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Новинки
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <Fire className="w-4 h-4" />
              Популярные
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rating">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Лучшие по рейтингу Shikimori
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Аниме с самыми высокими оценками на Shikimori. Проверенное качество от сообщества.
                </p>
              </CardContent>
            </Card>
            {renderAnimeGrid(topRated, "Не удалось загрузить топ аниме")}
          </TabsContent>

          <TabsContent value="newest">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  Новые поступления
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Свежие аниме и последние сезоны. Будьте в курсе новинок индустрии.
                </p>
              </CardContent>
            </Card>
            {renderAnimeGrid(newest, "Новинки не найдены")}
          </TabsContent>

          <TabsContent value="trending">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fire className="w-5 h-5 text-red-400" />
                  Самые популярные
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Аниме с наибольшим количеством голосов на Shikimori. Настоящие хиты среди фанатов.
                </p>
              </CardContent>
            </Card>
            {renderAnimeGrid(trending, "Популярные аниме не найдены")}
          </TabsContent>
        </Tabs>

        {/* Статистика */}
        <Card className="mt-12 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Users className="w-5 h-5" />О системе рейтингов
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">📊 Источники данных:</h4>
                <ul className="space-y-1 text-sm">
                  <li>
                    • <strong>Shikimori рейтинг</strong> - средняя оценка от 1 до 10
                  </li>
                  <li>
                    • <strong>Shikimori голоса</strong> - количество пользователей, оценивших аниме
                  </li>
                  <li>
                    • <strong>Фильтрация</strong> - только качественные аниме
                  </li>
                  <li>
                    • <strong>Актуальность</strong> - регулярное обновление данных
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🏆 Критерии популярности:</h4>
                <ul className="space-y-1 text-sm">
                  <li>
                    • <strong>Топ рейтинг:</strong> высокие оценки (8.0+)
                  </li>
                  <li>
                    • <strong>Новинки:</strong> год выпуска (новые первыми)
                  </li>
                  <li>
                    • <strong>Популярные:</strong> количество голосов (1000+)
                  </li>
                  <li>
                    • <strong>Качество:</strong> - только проверенные аниме
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
