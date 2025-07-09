import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Calendar, Star, Clock, Users, Heart, Share2, Bookmark } from "lucide-react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

interface AnimePageProps {
  params: {
    id: string
  }
}

interface AnimeData {
  id: number
  shikimori_id: string
  title: string
  title_english?: string
  title_japanese?: string
  description?: string
  poster_url?: string
  year?: number
  status?: string
  episodes_count?: number
  duration?: number
  rating?: number
  genres?: string[]
  studios?: string[]
  score?: number
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

export default async function AnimePage({ params }: AnimePageProps) {
  const anime = await getAnimeData(params.id)
  const translations = await getTranslations(params.id)

  if (!anime) {
    notFound()
  }

  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const hasTranslations = translations.length > 0
  const statusColors = {
    ongoing: "bg-green-500/20 text-green-400 border-green-500/30",
    completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    announced: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  }

  const statusLabels = {
    ongoing: "Онгоинг",
    completed: "Завершен",
    announced: "Анонсирован",
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero секция */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent z-10" />
        <div
          className="h-96 bg-cover bg-center bg-slate-800"
          style={{
            backgroundImage: anime.poster_url ? `url(${anime.poster_url})` : "none",
          }}
        />

        <div className="absolute inset-0 z-20 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Постер */}
              <div className="flex-shrink-0">
                <div className="w-64 h-96 rounded-lg overflow-hidden shadow-2xl">
                  <Image
                    src={anime.poster_url || "/placeholder.svg?height=384&width=256"}
                    alt={anime.title}
                    width={256}
                    height={384}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
              </div>

              {/* Информация */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">{anime.title}</h1>
                  {anime.title_english && <p className="text-xl text-gray-300 mb-1">{anime.title_english}</p>}
                  {anime.title_japanese && <p className="text-lg text-gray-400">{anime.title_japanese}</p>}
                </div>

                {/* Статусы и рейтинг */}
                <div className="flex flex-wrap gap-3 items-center">
                  {anime.status && (
                    <Badge
                      className={
                        statusColors[anime.status as keyof typeof statusColors] || "bg-gray-500/20 text-gray-400"
                      }
                    >
                      {statusLabels[anime.status as keyof typeof statusLabels] || anime.status}
                    </Badge>
                  )}
                  {anime.year && (
                    <Badge variant="outline" className="border-slate-600 text-gray-300">
                      {anime.year}
                    </Badge>
                  )}
                  {anime.score && (
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium">{anime.score}</span>
                    </div>
                  )}
                </div>

                {/* Жанры */}
                {anime.genres && anime.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map((genre) => (
                      <Badge key={genre} variant="secondary" className="bg-slate-700 text-gray-300">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Кнопки действий */}
                <div className="flex flex-wrap gap-3 pt-4">
                  {hasTranslations ? (
                    <Link href={`/anime/${params.id}/watch`}>
                      <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                        <Play className="w-5 h-5 mr-2" />
                        Смотреть
                      </Button>
                    </Link>
                  ) : (
                    <Button size="lg" disabled className="bg-gray-600 cursor-not-allowed">
                      <Play className="w-5 h-5 mr-2" />
                      Недоступно для просмотра
                    </Button>
                  )}

                  {user && (
                    <>
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent"
                      >
                        <Heart className="w-5 h-5 mr-2" />В избранное
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent"
                      >
                        <Bookmark className="w-5 h-5 mr-2" />В список
                      </Button>
                    </>
                  )}

                  <Button
                    variant="outline"
                    size="lg"
                    className="border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent"
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Поделиться
                  </Button>
                </div>

                {/* Предупреждение о недоступности */}
                {!hasTranslations && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-4">
                    <p className="text-yellow-400 text-sm">
                      <strong>Озвучки недоступны:</strong> К сожалению, для этого аниме пока нет доступных переводов. Мы
                      работаем над добавлением новых озвучек.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-6">
            {/* Описание */}
            {anime.description && (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Описание</h2>
                  <p className="text-gray-300 leading-relaxed">{anime.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Доступные озвучки */}
            {hasTranslations && (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Доступные озвучки</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {translations.map((translation) => (
                      <div key={translation.id} className="bg-slate-700 rounded-lg p-4">
                        <h3 className="font-medium text-white mb-2">{translation.title}</h3>
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span>Тип: {translation.type}</span>
                          <span>Эпизодов: {translation.episodes_count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Информация</h2>
                <div className="space-y-4">
                  {anime.episodes_count && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Эпизодов
                      </span>
                      <span className="text-white">{anime.episodes_count}</span>
                    </div>
                  )}

                  {anime.duration && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Длительность
                      </span>
                      <span className="text-white">{anime.duration} мин</span>
                    </div>
                  )}

                  {anime.year && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Год выпуска
                      </span>
                      <span className="text-white">{anime.year}</span>
                    </div>
                  )}

                  {anime.studios && anime.studios.length > 0 && (
                    <div>
                      <span className="text-gray-400 block mb-2">Студия</span>
                      <div className="flex flex-wrap gap-2">
                        {anime.studios.map((studio) => (
                          <Badge key={studio} variant="outline" className="border-slate-600 text-gray-300">
                            {studio}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Статистика */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Статистика</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Рейтинг</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white">{anime.score || "N/A"}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">В избранном</span>
                    <span className="text-white">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Просмотров</span>
                    <span className="text-white">0</span>
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
