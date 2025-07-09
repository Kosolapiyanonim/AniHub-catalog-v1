"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, Loader2 } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"

interface Translation {
  id: number
  title: string
  type: string
  quality: string
  episodes_count: number
  link: string
}

interface AnimeData {
  id: number
  shikimori_id: string
  title: string
  translations: Translation[]
}

export default function WatchPage() {
  const params = useParams()
  const router = useRouter()
  const [anime, setAnime] = useState<AnimeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTranslation, setActiveTranslation] = useState<Translation | null>(null)
  const [currentEpisode, setCurrentEpisode] = useState(1)

  const animeId = params.id as string

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/anime/${animeId}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Ошибка загрузки аниме")
        }

        const data = await response.json()
        setAnime(data)

        // Устанавливаем первую доступную озвучку
        if (data.translations && data.translations.length > 0) {
          setActiveTranslation(data.translations[0])
        }
      } catch (error) {
        console.error("Error fetching anime:", error)
        setError(error instanceof Error ? error.message : "Неизвестная ошибка")
      } finally {
        setLoading(false)
      }
    }

    if (animeId) {
      fetchAnime()
    }
  }, [animeId])

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

  if (!activeTranslation) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Нет доступных озвучек</h1>
          <p className="text-gray-400 mb-6">Озвучки для этого аниме пока недоступны</p>
          <Button onClick={() => router.push(`/anime/${animeId}`)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />К описанию
          </Button>
        </div>
      </div>
    )
  }

  const episodes = Array.from({ length: activeTranslation.episodes_count }, (_, i) => i + 1)

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-4">
        {/* Навигация */}
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={() => router.push(`/anime/${animeId}`)}
            variant="ghost"
            className="text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />К описанию
          </Button>
          <h1 className="text-xl font-bold text-white truncate ml-4">{anime.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Плеер */}
          <div className="lg:col-span-3">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-0">
                <div className="aspect-video relative bg-black rounded-lg overflow-hidden">
                  {activeTranslation ? (
                    <iframe
                      key={`${activeTranslation.id}-${currentEpisode}`}
                      src={`${activeTranslation.link}?episode=${currentEpisode}`}
                      title={`${anime.title} - Эпизод ${currentEpisode}`}
                      className="w-full h-full"
                      allowFullScreen
                      allow="autoplay; fullscreen; picture-in-picture"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Выбор эпизодов */}
            {episodes.length > 1 && (
              <Card className="bg-slate-800 border-slate-700 mt-4">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Эпизоды ({episodes.length})</h3>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {episodes.map((episode) => (
                      <Button
                        key={episode}
                        variant={currentEpisode === episode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentEpisode(episode)}
                        className={
                          currentEpisode === episode
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "border-slate-600 text-gray-300 hover:bg-slate-700"
                        }
                      >
                        {episode}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Боковая панель с озвучками */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Озвучки ({anime.translations.length})</h3>
                <div className="space-y-2">
                  {anime.translations.map((translation) => (
                    <button
                      key={translation.id}
                      onClick={() => {
                        setActiveTranslation(translation)
                        setCurrentEpisode(1) // Сбрасываем на первый эпизод при смене озвучки
                      }}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        activeTranslation?.id === translation.id
                          ? "bg-purple-600 text-white"
                          : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{translation.title}</span>
                        <Badge
                          variant="secondary"
                          className={
                            activeTranslation?.id === translation.id
                              ? "bg-purple-700 text-white"
                              : "bg-slate-600 text-gray-300"
                          }
                        >
                          {translation.quality}
                        </Badge>
                      </div>
                      <div className="flex items-center text-xs opacity-75">
                        <Play className="w-3 h-3 mr-1" />
                        <span>{translation.episodes_count} эп.</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Информация о текущем эпизоде */}
            <Card className="bg-slate-800 border-slate-700 mt-4">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Сейчас смотрите</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Эпизод:</span>
                    <span className="text-white">{currentEpisode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Озвучка:</span>
                    <span className="text-white">{activeTranslation.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Качество:</span>
                    <span className="text-white">{activeTranslation.quality}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
