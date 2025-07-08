"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Star, Calendar, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/loading-spinner"

interface Translation {
  id: number
  title: string
  link: string
  quality?: string
}

interface AnimeData {
  id: number
  shikimori_id: string
  title: string
  description?: string
  poster_url?: string
  rating?: number
  year?: number
  status?: string
  genres?: string[]
  studios?: string[]
  translations: Translation[]
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
        console.log("Fetching anime with ID:", params.id)

        const response = await fetch(`/api/anime/${params.id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log("Anime data received:", data)

        if (!data || !data.translations || data.translations.length === 0) {
          throw new Error("Нет доступных озвучек для этого аниме")
        }

        setAnime(data)
      } catch (err) {
        console.error("Error fetching anime:", err)
        setError(err instanceof Error ? err.message : "Ошибка загрузки аниме")
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
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

  const firstTranslation = anime.translations[0]

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Кнопка назад */}
        <Button onClick={() => router.back()} variant="ghost" className="mb-6 text-gray-300 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Левая колонка - Постер и информация */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <div className="aspect-[3/4] relative mb-4">
                  <Image
                    src={anime.poster_url || "/placeholder.svg?height=400&width=300"}
                    alt={anime.title}
                    fill
                    className="object-cover rounded-lg"
                    priority
                  />
                </div>

                <h1 className="text-xl font-bold text-white mb-4">{anime.title}</h1>

                <div className="space-y-3">
                  {anime.rating && (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-300">{anime.rating}</span>
                    </div>
                  )}

                  {anime.year && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{anime.year}</span>
                    </div>
                  )}

                  {anime.status && (
                    <div>
                      <Badge variant="secondary">{anime.status}</Badge>
                    </div>
                  )}

                  {anime.genres && anime.genres.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-2">Жанры</h3>
                      <div className="flex flex-wrap gap-1">
                        {anime.genres.map((genre, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {anime.studios && anime.studios.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-2">Студии</h3>
                      <div className="flex flex-wrap gap-1">
                        {anime.studios.map((studio, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {studio}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Правая колонка - Плеер и описание */}
          <div className="lg:col-span-3">
            {/* Плеер */}
            <Card className="bg-slate-900 border-slate-800 mb-6">
              <CardContent className="p-6">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  {firstTranslation ? (
                    <iframe
                      key={firstTranslation.id}
                      src={firstTranslation.link}
                      title={`${anime.title} - ${firstTranslation.title}`}
                      className="w-full h-full"
                      allowFullScreen
                      allow="autoplay; fullscreen; picture-in-picture"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Плеер недоступен</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Информация об озвучках */}
                {anime.translations.length > 0 && (
                  <div className="mt-4 p-4 bg-slate-800 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-300 mb-2">
                      Доступные озвучки ({anime.translations.length})
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {anime.translations.slice(0, 5).map((translation, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {translation.title}
                          {translation.quality && ` (${translation.quality})`}
                        </Badge>
                      ))}
                      {anime.translations.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{anime.translations.length - 5} ещё
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">Выбор озвучки доступен в плеере</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Описание */}
            {anime.description && (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Описание</h2>
                  <p className="text-gray-300 leading-relaxed">{anime.description}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
