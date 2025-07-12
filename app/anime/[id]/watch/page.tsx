import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, SkipBack, SkipForward, Settings, Maximize, Volume2 } from "lucide-react"

interface WatchPageProps {
  params: {
    id: string
  }
}

interface AnimeData {
  id: number
  shikimori_id: string
  title: string
  poster_url?: string
  episodes_count?: number
}

interface Translation {
  id: number
  anime_id: number
  translation_id: string
  title: string
  type: string
  episodes_count: number
}

async function getAnimeData(id: string): Promise<AnimeData | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"}/api/anime/${id}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.anime
  } catch (error) {
    console.error("Error fetching anime:", error)
    return null
  }
}

async function getTranslations(id: string): Promise<Translation[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"}/api/anime/translation/${id}`,
      {
        cache: "no-store",
      },
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.translations || []
  } catch (error) {
    console.error("Error fetching translations:", error)
    return []
  }
}

export default async function WatchPage({ params }: WatchPageProps) {
  const anime = await getAnimeData(params.id)
  const translations = await getTranslations(params.id)

  if (!anime) {
    notFound()
  }

  const hasTranslations = translations.length > 0

  if (!hasTranslations) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Озвучки недоступны</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-400">К сожалению, для этого аниме пока нет доступных переводов.</p>
            <Link href={`/anime/${params.id}`}>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Вернуться к аниме
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Генерируем список эпизодов для первой озвучки
  const firstTranslation = translations[0]
  const episodes = Array.from({ length: firstTranslation.episodes_count }, (_, i) => i + 1)

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Навигация */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/anime/${params.id}`}>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
            </Link>
            <div>
              <h1 className="text-white font-semibold">{anime.title}</h1>
              <p className="text-gray-400 text-sm">Эпизод 1</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-slate-600 text-gray-300">
              {firstTranslation.title}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Видеоплеер */}
          <div className="xl:col-span-3">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-0">
                {/* Плеер */}
                <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                      <p className="text-white text-lg mb-2">Видеоплеер</p>
                      <p className="text-gray-400 text-sm">Здесь будет интегрирован плеер Kodik</p>
                    </div>
                  </div>

                  {/* Контролы плеера */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                          <SkipBack className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                          <SkipForward className="w-4 h-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-white" />
                          <div className="w-20 h-1 bg-white/30 rounded-full">
                            <div className="w-3/4 h-full bg-white rounded-full"></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm">00:00 / 24:00</span>
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                          <Maximize className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Прогресс бар */}
                    <div className="w-full h-1 bg-white/30 rounded-full mt-3">
                      <div className="w-1/4 h-full bg-purple-500 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Настройки под плеером */}
                <div className="p-4 border-t border-slate-700">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">Озвучка:</span>
                      <Select defaultValue={firstTranslation.id.toString()}>
                        <SelectTrigger className="w-48 bg-slate-700 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          {translations.map((translation) => (
                            <SelectItem key={translation.id} value={translation.id.toString()}>
                              {translation.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">Качество:</span>
                      <Select defaultValue="720p">
                        <SelectTrigger className="w-24 bg-slate-700 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="480p">480p</SelectItem>
                          <SelectItem value="720p">720p</SelectItem>
                          <SelectItem value="1080p">1080p</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Список эпизодов */}
          <div className="xl:col-span-1">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Эпизоды ({firstTranslation.episodes_count})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {episodes.map((episode) => (
                    <button
                      key={episode}
                      className={`w-full text-left p-3 hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0 ${
                        episode === 1 ? "bg-slate-700" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">Эпизод {episode}</span>
                        {episode === 1 && <div className="w-2 h-2 bg-purple-500 rounded-full"></div>}
                      </div>
                      <p className="text-gray-400 text-sm mt-1">24 мин</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Информация об аниме */}
            <Card className="bg-slate-800 border-slate-700 mt-4">
              <CardHeader>
                <CardTitle className="text-white text-lg">О сериале</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400 text-sm">Эпизодов:</span>
                    <span className="text-white ml-2">{anime.episodes_count || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Озвучек:</span>
                    <span className="text-white ml-2">{translations.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Статус:</span>
                    <span className="text-white ml-2">Онгоинг</span>
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
