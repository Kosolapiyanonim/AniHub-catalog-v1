import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { notFound } from "next/navigation"
import { Play, Star, Calendar, Clock, Users } from "lucide-react"
import type { Metadata } from "next"
import type { CatalogAnime } from "@/lib/types"

interface AnimePageProps {
  params: {
    id: string
  }
}

async function getAnimeData(shikimoriId: string): Promise<CatalogAnime | null> {
  try {
    console.log("🎬 Fetching anime data for shikimori_id:", shikimoriId)

    // Ищем по shikimori_id в нашем VIEW
    const { data, error } = await supabase
      .from("animes_with_relations")
      .select("*")
      .eq("shikimori_id", shikimoriId)
      .single()

    if (error) {
      console.error(`❌ Anime with shikimori_id ${shikimoriId} not found:`, error)
      return null
    }

    console.log("✅ Anime found:", data.title)
    return data as CatalogAnime
  } catch (error) {
    console.error("❌ Error fetching anime:", error)
    return null
  }
}

export async function generateMetadata({ params }: AnimePageProps): Promise<Metadata> {
  const anime = await getAnimeData(params.id)

  return {
    title: anime ? `${anime.title} - Смотреть онлайн` : "Аниме не найдено",
    description: anime?.description || "Смотреть аниме онлайн бесплатно",
  }
}

export default async function AnimePage({ params }: AnimePageProps) {
  const anime = await getAnimeData(params.id)

  if (!anime) {
    notFound()
  }

  const posterUrl = anime.poster_url || "/placeholder.svg?height=600&width=400"
  const playerUrl = anime.player_link?.startsWith("http") ? anime.player_link : `https:${anime.player_link}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Постер */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <div className="relative aspect-[3/4]">
                <Image
                  src={posterUrl || "/placeholder.svg"}
                  alt={anime.title}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
              </div>
            </Card>
          </div>

          {/* Информация и плеер */}
          <div className="lg:col-span-2 space-y-6">
            {/* Заголовок и метаданные */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{anime.title}</h1>
              {anime.title_orig && <p className="text-xl text-gray-300 mb-4">{anime.title_orig}</p>}

              <div className="flex flex-wrap gap-4 mb-6">
                {anime.shikimori_rating && anime.shikimori_rating > 0 && (
                  <div className="flex items-center gap-1 bg-yellow-500 text-black px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-semibold">{anime.shikimori_rating}</span>
                  </div>
                )}

                {anime.year && (
                  <div className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-full">
                    <Calendar className="w-4 h-4" />
                    <span>{anime.year}</span>
                  </div>
                )}

                {anime.episodes_count && (
                  <div className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4" />
                    <span>{anime.episodes_count} эп.</span>
                  </div>
                )}

                {anime.shikimori_votes && anime.shikimori_votes > 0 && (
                  <div className="flex items-center gap-1 bg-purple-500 text-white px-3 py-1 rounded-full">
                    <Users className="w-4 h-4" />
                    <span>{anime.shikimori_votes.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Жанры */}
              {anime.genres && anime.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {anime.genres.slice(0, 8).map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Плеер */}
            {playerUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Смотреть онлайн
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      src={playerUrl}
                      className="w-full h-full"
                      allowFullScreen
                      title={anime.title}
                      frameBorder="0"
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <p>Качество: HD</p>
                      <p>Озвучка: Русская</p>
                    </div>
                    <Button size="lg">
                      <Play className="w-4 h-4 mr-2" />
                      Смотреть
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Описание */}
            {anime.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Описание</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{anime.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Дополнительная информация */}
            <Card>
              <CardHeader>
                <CardTitle>Дополнительная информация</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {anime.status && (
                    <div>
                      <span className="font-semibold">Статус:</span>
                      <span className="ml-2">{anime.status}</span>
                    </div>
                  )}

                  {anime.studios && anime.studios.length > 0 && (
                    <div>
                      <span className="font-semibold">Студия:</span>
                      <span className="ml-2">{anime.studios.join(", ")}</span>
                    </div>
                  )}

                  {anime.countries && anime.countries.length > 0 && (
                    <div>
                      <span className="font-semibold">Страна:</span>
                      <span className="ml-2">{anime.countries.join(", ")}</span>
                    </div>
                  )}

                  {anime.episodes_count && (
                    <div>
                      <span className="font-semibold">Эпизоды:</span>
                      <span className="ml-2">{anime.episodes_count}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
