import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import createClient from "@/lib/supabase/server"
import {
  ArrowLeft,
  Play,
  Settings,
  Volume2,
  Maximize,
  MoreHorizontal,
  Star,
  Clock,
  Users,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import KodikPlayer from "../../../../components/kodik-player"

export default async function WatchPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Получаем данные аниме
  const { data: animeData } = await supabase
    .from("animes")
    .select(`
      id, 
      title, 
      title_orig,
      poster_url,
      description,
      year,
      shikimori_rating,
      episodes_total,
      episodes_aired,
      status,
      genres:anime_genres(genres(name)),
      studios:anime_studios(studios(name))
    `)
    .eq("shikimori_id", params.id)
    .single()

  if (!animeData) {
    notFound()
  }

  // Получаем озвучки
  const { data: translations } = await supabase
    .from("translations")
    .select("*")
    .eq("anime_id", animeData.id)
    .order("title")

  if (!translations || translations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm max-w-md w-full">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Озвучки не найдены</h2>
                <p className="text-slate-400 mb-6">К сожалению, для этого аниме пока нет доступных плееров.</p>
                <Link href={`/anime/${params.id}`}>
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Вернуться к описанию
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Верхняя навигация */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href={`/anime/${params.id}`}
                className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Назад</span>
              </Link>
              <Separator orientation="vertical" className="h-6 bg-slate-600" />
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 relative rounded overflow-hidden">
                  <Image
                    src={animeData.poster_url || "/placeholder.svg"}
                    alt={animeData.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-white font-semibold text-sm sm:text-base line-clamp-1">{animeData.title}</h1>
                  <p className="text-slate-400 text-xs">
                    {animeData.episodes_aired} / {animeData.episodes_total || "??"} эп.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Основной плеер */}
          <div className="xl:col-span-3 space-y-6">
            {/* Видео плеер */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video bg-black relative group">
                  <KodikPlayer src={(translations?.[0] as any)?.player_link || ""} />

                  {/* Контролы плеера (overlay) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center space-x-3">
                          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                            <Volume2 className="w-4 h-4" />
                          </Button>
                          <span className="text-sm">00:00 / 24:00</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                            <Maximize className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Информация об эпизоде */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">Эпизод 1</h2>
                    <p className="text-slate-400">Первая серия</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 bg-transparent">
                      <Star className="w-4 h-4 mr-1" />
                      Оценить
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    24 мин
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {animeData.year}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {translations[0]?.title || "Неизвестно"}
                  </div>
                </div>

                {animeData.description && (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-slate-300 leading-relaxed">{animeData.description.slice(0, 200)}...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Боковая панель */}
          <div className="xl:col-span-1 space-y-6">
            {/* Список эпизодов */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="p-4 border-b border-slate-700">
                  <h3 className="font-semibold text-white">Эпизоды</h3>
                  <p className="text-sm text-slate-400">
                    {animeData.episodes_aired} из {animeData.episodes_total || "??"}
                  </p>
                </div>
                <ScrollArea className="h-64">
                  <div className="p-2">
                    {Array.from({ length: Math.min(animeData.episodes_aired || 1, 12) }, (_, i) => (
                      <button
                        key={i}
                        className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                          i === 0
                            ? "bg-purple-600/20 border border-purple-500/30 text-purple-300"
                            : "hover:bg-slate-700/50 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Эпизод {i + 1}</span>
                          <span className="text-xs text-slate-500">24:00</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Серия {i + 1}</p>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Озвучки */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="p-4 border-b border-slate-700">
                  <h3 className="font-semibold text-white">Озвучки</h3>
                  <p className="text-sm text-slate-400">{translations.length} доступно</p>
                </div>
                <ScrollArea className="h-48">
                  <div className="p-2">
                    {translations.slice(0, 8).map((translation, index) => (
                      <button
                        key={translation.id}
                        className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                          index === 0
                            ? "bg-blue-600/20 border border-blue-500/30 text-blue-300"
                            : "hover:bg-slate-700/50 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{translation.title}</span>
                          <Badge variant="secondary" className="text-xs">
                            {translation.quality}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{translation.type}</p>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Информация об аниме */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold text-white mb-3">Об аниме</h3>
                <div className="space-y-3">
                  {animeData.shikimori_rating && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Рейтинг</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-white font-medium">{animeData.shikimori_rating}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Статус</span>
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      {animeData.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Год</span>
                    <span className="text-white">{animeData.year}</span>
                  </div>
                </div>

                {animeData.genres && animeData.genres.length > 0 && (
                  <div className="mt-4">
                    <p className="text-slate-400 text-sm mb-2">Жанры</p>
                    <div className="flex flex-wrap gap-1">
                      {animeData.genres.slice(0, 4).map((genre: any) => (
                        <Badge key={genre.genres.name} variant="secondary" className="text-xs">
                          {genre.genres.name}
                        </Badge>
                      ))}
                    </div>
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
