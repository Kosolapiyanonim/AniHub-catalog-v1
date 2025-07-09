"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Star, Calendar, Play, Clock, Users } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"

interface AnimeData {
  id: number
  shikimori_id: string
  title: string
  description?: string
  poster_url?: string
  year?: number
  rating?: number
  status?: string
  episodes_count?: number
  genres: Array<{ name: string }>
  studios: Array<{ name: string }>
  translations: Array<{
    id: number
    title: string
    type: string
    episodes_count: number
  }>
}

export default function AnimePage() {
  const params = useParams()
  const router = useRouter()
  const [anime, setAnime] = useState<AnimeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/anime/${params.id}`)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        console.log("Anime data:", data)
        setAnime(data)
      } catch (error) {
        console.error("Error fetching anime:", error)
        setError("Ошибка загрузки данных аниме")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchAnime()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Ошибка загрузки</h1>
          <p className="text-gray-400 mb-6">{error || "Аниме не найдено"}</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </div>
      </div>
    )
  }

  const hasTranslations = anime.translations && anime.translations.length > 0

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Кнопка назад */}
        <Button onClick={() => router.back()} variant="ghost" className="mb-6 text-gray-300 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Постер */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-0">
                <div className="aspect-[3/4] relative">
                  <Image
                    src={anime.poster_url || "/placeholder.svg?height=600&width=450"}
                    alt={anime.title}
                    fill
                    className="object-cover rounded-lg"
                    priority
                  />
                </div>
              </CardContent>
            </Card>

            {/* Информация под постером */}
            <Card className="bg-slate-800 border-slate-700 mt-4">
              <CardContent className="p-4 space-y-3">
                {anime.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-white font-medium">{anime.rating}</span>
                    <span className="text-gray-400">/ 10</span>
                  </div>
                )}

                {anime.year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{anime.year} г.</span>
                  </div>
                )}

                {anime.episodes_count && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{anime.episodes_count} эп.</span>
                  </div>
                )}

                {anime.status && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-300">{anime.status}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Основная информация */}
          <div className="lg:col-span-3 space-y-6">
            {/* Заголовок и кнопка просмотра */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{anime.title}</h1>

                {/* Жанры */}
                {anime.genres && anime.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {anime.genres.map((genre, index) => (
                      <Badge key={index} variant="secondary" className="bg-slate-700 text-gray-300">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Кнопка смотреть */}
              {hasTranslations ? (
                <Link href={`/anime/${params.id}/watch`}>
                  <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
                    <Play className="w-5 h-5 mr-2" />
                    Смотреть сейчас
                  </Button>
                </Link>
              ) : (
                <Button size="lg" disabled className="bg-gray-600 text-gray-400 cursor-not-allowed">
                  <Clock className="w-5 h-5 mr-2" />
                  Скоро будет доступно
                </Button>
              )}
            </div>

            {/* Описание */}
            {anime.description && (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Описание</h2>
                  <p className="text-gray-300 leading-relaxed">{anime.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Студии */}
            {anime.studios && anime.studios.length > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Студия</h2>
                  <div className="flex flex-wrap gap-2">
                    {anime.studios.map((studio, index) => (
                      <Badge key={index} variant="outline" className="border-slate-600 text-gray-300">
                        {studio.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Информация об озвучках */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Озвучки</h2>

                {hasTranslations ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-400">
                      <Users className="w-4 h-4" />
                      <span>Всего доступно: {anime.translations.length} озвучек</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {anime.translations.slice(0, 6).map((translation) => (
                        <div key={translation.id} className="bg-slate-700 rounded-lg p-3">
                          <p className="text-white font-medium text-sm">{translation.title}</p>
                          <p className="text-gray-400 text-xs">
                            {translation.episodes_count} эп. • {translation.type}
                          </p>
                        </div>
                      ))}
                    </div>

                    {anime.translations.length > 6 && (
                      <p className="text-gray-400 text-sm">И еще {anime.translations.length - 6} озвучек...</p>
                    )}

                    <div className="bg-slate-700 rounded-lg p-4 mt-4">
                      <p className="text-gray-300 text-sm">💡 Выбор озвучки и серий доступен на странице просмотра</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-gray-300 text-sm mb-2">⏳ Озвучки для этого аниме пока не добавлены</p>
                    <p className="text-gray-400 text-xs">
                      Мы работаем над добавлением озвучек. Следите за обновлениями!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
