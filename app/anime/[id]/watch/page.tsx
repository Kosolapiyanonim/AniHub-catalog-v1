"use client"

import { useState, useEffect, useMemo } from "react"
import { notFound, useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Tv } from "lucide-react"

// --- Типы данных ---
interface Translation {
  id: number
  kodik_id: string
  title: string
  type: string
  quality: string
  player_link: string
}

interface AnimeDetails {
  id: number
  title: string
  episodes_count?: number
  translations: Translation[]
}

// --- Основной компонент страницы просмотра ---
export default function AnimeWatchPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [anime, setAnime] = useState<AnimeDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Состояние для активной озвучки и эпизода
  const [activeTranslation, setActiveTranslation] = useState<Translation | null>(null)
  const [activeEpisode, setActiveEpisode] = useState(1)

  // Загрузка данных об аниме
  useEffect(() => {
    if (params.id) {
      fetch(`/api/anime/${params.id}`)
        .then((res) => {
          if (res.status === 404) notFound()
          if (!res.ok) throw new Error(`Ошибка сети: ${res.status}`)
          return res.json()
        })
        .then((data: AnimeDetails) => {
          setAnime(data)
          // Устанавливаем первую озвучку как активную по умолчанию
          if (data.translations && data.translations.length > 0) {
            setActiveTranslation(data.translations[0])
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [params.id])

  // Генерируем URL для плеера на основе активной озвучки и эпизода
  const playerUrl = useMemo(() => {
    if (!activeTranslation) return ""
    const url = new URL(`https:${activeTranslation.player_link}`)
    url.searchParams.set("episode", activeEpisode.toString())
    return url.toString()
  }, [activeTranslation, activeEpisode])

  // Создаем массив номеров эпизодов для удобного рендеринга
  const episodes = useMemo(() => {
    const count = anime?.episodes_count || 1
    return Array.from({ length: count }, (_, i) => i + 1)
  }, [anime?.episodes_count])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !anime) {
    return <div className="text-center py-20">Ошибка: {error || "Не удалось загрузить данные"}</div>
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок и кнопка "Назад" */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 min-w-0">
            <Button onClick={() => router.back()} variant="ghost" className="mb-2 text-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />К описанию
            </Button>
            <h1 className="text-2xl lg:text-3xl font-bold truncate" title={anime.title}>
              {anime.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Левая часть: Плеер и переключатель серий */}
          <div className="flex-1">
            <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
              {playerUrl ? (
                <iframe
                  key={playerUrl} // Ключ для перезагрузки iframe при смене URL
                  src={playerUrl}
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; fullscreen; picture-in-picture"
                  className="w-full h-full"
                  title={`Плеер для ${anime.title}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Tv className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Выберите озвучку для начала просмотра</p>
                  </div>
                </div>
              )}
            </div>

            {/* Переключатель серий */}
            {episodes.length > 1 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-3">Эпизоды</h3>
                <div className="pb-2 overflow-x-auto whitespace-nowrap">
                  {episodes.map((episodeNum) => (
                    <Button
                      key={episodeNum}
                      variant={activeEpisode === episodeNum ? "default" : "outline"}
                      size="sm"
                      className="mr-2 shrink-0"
                      onClick={() => setActiveEpisode(episodeNum)}
                    >
                      {episodeNum} серия
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Правая часть: Выбор озвучки */}
          <aside className="w-full lg:w-80 lg:max-w-xs shrink-0">
            <div className="bg-slate-800/50 rounded-lg p-4 h-full">
              <h3 className="text-lg font-semibold mb-4">Озвучка</h3>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {anime.translations.length > 0 ? (
                  anime.translations.map((translation) => (
                    <Button
                      key={translation.id}
                      variant={activeTranslation?.id === translation.id ? "secondary" : "ghost"}
                      className="w-full justify-start text-left h-auto py-2"
                      onClick={() => setActiveTranslation(translation)}
                    >
                      <div className="flex flex-col">
                        <span>{translation.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {translation.type} / {translation.quality}
                        </span>
                      </div>
                    </Button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Озвучки не найдены.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
