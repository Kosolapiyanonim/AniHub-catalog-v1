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
import Comments from "@/components/Comments"
import WatchControls from "@/components/watch-controls"

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
                <div className="aspect-video bg-black relative">
                  <KodikPlayer src={(translations?.[0] as any)?.player_link || ""} />
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
            <WatchControls translations={translations as any} episodesAired={animeData.episodes_aired} episodesTotal={animeData.episodes_total} />

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

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-4">
                <Comments animeId={animeData.id} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
