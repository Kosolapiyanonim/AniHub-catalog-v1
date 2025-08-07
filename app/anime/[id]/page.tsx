import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { Play, Star, Calendar, Users, Film, Clock, BookOpen, List, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AnimeListPopover } from "@/components/AnimeListPopover"
import { getAnimeById, getAnimeTranslations } from "@/lib/data-fetchers"

export default async function AnimeDetailPage({ params }: { params: { id: string } }) {
  const animeData = await getAnimeById(params.id)

  if (!animeData) {
    notFound()
  }

  const translations = await getAnimeTranslations(animeData.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero Section */}
      <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        <Image
          src={animeData.poster_url || "/placeholder.svg"}
          alt={animeData.title}
          fill
          className="object-cover object-center blur-sm scale-110"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent" />
        <div className="absolute inset-0 flex items-end pb-8 md:pb-16 lg:pb-24 px-4 md:px-8 lg:px-12">
          <div className="max-w-4xl w-full mx-auto flex flex-col md:flex-row items-center md:items-end gap-6">
            <div className="relative w-36 h-52 md:w-48 md:h-72 lg:w-64 lg:h-96 shrink-0 rounded-lg overflow-hidden shadow-lg border-2 border-purple-500">
              <Image
                src={animeData.poster_url || "/placeholder.svg"}
                alt={animeData.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-bold mb-2 drop-shadow-lg">
                {animeData.title}
              </h1>
              {animeData.title_orig && animeData.title_orig !== animeData.title && (
                <p className="text-lg md:text-xl text-slate-300 mb-3 drop-shadow-md">
                  {animeData.title_orig}
                </p>
              )}
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                {animeData.shikimori_rating && (
                  <Badge className="bg-yellow-500/80 text-white text-base px-3 py-1">
                    <Star className="w-4 h-4 mr-1" /> {animeData.shikimori_rating}
                  </Badge>
                )}
                {animeData.status && (
                  <Badge variant="secondary" className="bg-purple-600/80 text-white text-base px-3 py-1">
                    {animeData.status}
                  </Badge>
                )}
                {animeData.year && (
                  <Badge variant="secondary" className="bg-slate-700/80 text-white text-base px-3 py-1">
                    <Calendar className="w-4 h-4 mr-1" /> {animeData.year}
                  </Badge>
                )}
              </div>
              <div className="flex justify-center md:justify-start gap-4 mt-4">
                <Link href={`/anime/${animeData.shikimori_id}/watch`}>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-6 py-3 rounded-full shadow-lg">
                    <Play className="w-5 h-5 mr-2" />
                    Смотреть
                  </Button>
                </Link>
                <AnimeListPopover anime={animeData} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Description and Details */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Описание</h2>
                <p className="text-slate-300 leading-relaxed">
                  {animeData.description || "Описание отсутствует."}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Детали</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-300">
                  <div className="flex items-center">
                    <Film className="w-5 h-5 mr-2 text-purple-400" />
                    <span>Тип: {animeData.kind || "Неизвестно"}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-purple-400" />
                    <span>Эпизоды: {animeData.episodes_aired} / {animeData.episodes_total || "??"}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-purple-400" />
                    <span>Год: {animeData.year || "Неизвестно"}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-purple-400" />
                    <span>Статус: {animeData.status || "Неизвестно"}</span>
                  </div>
                  {animeData.studios && animeData.studios.length > 0 && (
                    <div className="flex items-center col-span-1 sm:col-span-2">
                      <BookOpen className="w-5 h-5 mr-2 text-purple-400" />
                      <span>Студии: {animeData.studios.map(s => s.studios.name).join(", ")}</span>
                    </div>
                  )}
                </div>
                {animeData.genres && animeData.genres.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Жанры:</h3>
                    <div className="flex flex-wrap gap-2">
                      {animeData.genres.map((genre: any) => (
                        <Badge key={genre.genres.name} variant="secondary" className="bg-slate-700 text-slate-200">
                          {genre.genres.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Translations and Episodes */}
          <div className="lg:col-span-1 space-y-6">
            {translations.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-4">
                  <h3 className="text-xl font-bold text-white mb-3">Озвучки ({translations.length})</h3>
                  <ScrollArea className="h-48">
                    <div className="space-y-2 pr-2">
                      {translations.map((translation) => (
                        <Link key={translation.id} href={`/anime/${animeData.shikimori_id}/watch?translation=${translation.id}`}>
                          <Button variant="ghost" className="w-full justify-between text-slate-300 hover:bg-slate-700/50">
                            <span className="font-medium">{translation.title}</span>
                            <Badge variant="secondary" className="bg-blue-600/80 text-white">
                              {translation.quality}
                            </Badge>
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </ScrollArea>
                  {translations.length > 8 && (
                    <div className="mt-4 text-center">
                      <Link href={`/anime/${animeData.shikimori_id}/watch`}>
                        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent">
                          Все озвучки <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-4">
                <h3 className="text-xl font-bold text-white mb-3">Похожее аниме</h3>
                <p className="text-slate-400">Здесь будут рекомендации похожего аниме.</p>
                {/* Placeholder for similar anime */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-slate-700/50 flex items-center justify-center text-slate-400 text-sm">
                    <Image src="/placeholder.svg?height=150&width=100" alt="Placeholder" width={100} height={150} className="object-cover" />
                  </div>
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-slate-700/50 flex items-center justify-center text-slate-400 text-sm">
                    <Image src="/placeholder.svg?height=150&width=100" alt="Placeholder" width={100} height={150} className="object-cover" />
                  </div>
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-slate-700/50 flex items-center justify-center text-slate-400 text-sm">
                    <Image src="/placeholder.svg?height=150&width=100" alt="Placeholder" width={100} height={150} className="object-cover" />
                  </div>
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-slate-700/50 flex items-center justify-center text-slate-400 text-sm">
                    <Image src="/placeholder.svg?height=150&width=100" alt="Placeholder" width={100} height={150} className="object-cover" />
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
