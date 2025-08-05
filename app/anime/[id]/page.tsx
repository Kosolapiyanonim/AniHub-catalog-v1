import { Suspense } from "react"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getAnimeById, getAnimeTranslations } from "@/lib/data-fetchers"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AnimePageListButton } from "@/components/anime-page-list-button"
import { PlayerClient } from "@/components/player-client"
import { Separator } from "@/components/ui/separator"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { AnimeCarousel } from "@/components/AnimeCarousel"
import { AnimeCard } from "@/components/anime-card"

export default async function AnimePage({ params }: { params: { id: string } }) {
  const animeId = Number.parseInt(params.id)
  if (isNaN(animeId)) {
    notFound()
  }

  const anime = await getAnimeById(animeId)

  if (!anime) {
    notFound()
  }

  const translations = await getAnimeTranslations(anime.kodik_id)

  const genres = anime.anime_genres?.map((ag) => ag.genres?.name).filter(Boolean) || []
  const studios = anime.anime_studios?.map((as) => as.studios?.name).filter(Boolean) || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
            <Image
              src={anime.poster_url || "/placeholder.svg?height=600&width=400&query=anime poster"}
              alt={anime.title || "Anime poster"}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <AnimePageListButton animeId={anime.id} initialStatus={anime.user_list_status} />
            <Button variant="secondary" className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Добавить в список
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h1 className="text-4xl font-bold mb-2">{anime.title}</h1>
          <p className="text-xl text-muted-foreground mb-4">{anime.russian}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {anime.type && <Badge variant="outline">{anime.type}</Badge>}
            {anime.year && <Badge variant="outline">{anime.year}</Badge>}
            {anime.episodes_total && <Badge variant="outline">{anime.episodes_total} эп.</Badge>}
            {anime.shikimori_rating && <Badge variant="outline">Рейтинг: {anime.shikimori_rating}</Badge>}
            {anime.status && <Badge variant="outline">{anime.status}</Badge>}
          </div>

          <p className="text-muted-foreground mb-4">{anime.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <h3 className="font-semibold">Жанры:</h3>
              <p>{genres.join(", ") || "Не указаны"}</p>
            </div>
            <div>
              <h3 className="font-semibold">Студии:</h3>
              <p>{studios.join(", ") || "Не указаны"}</p>
            </div>
            <div>
              <h3 className="font-semibold">Продолжительность серии:</h3>
              <p>{anime.duration || "Не указана"}</p>
            </div>
            <div>
              <h3 className="font-semibold">Возрастной рейтинг:</h3>
              <p>{anime.rating_mpaa || "Не указан"}</p>
            </div>
          </div>

          <Separator className="my-6" />

          <h2 className="text-2xl font-bold mb-4">Смотреть аниме</h2>
          {translations && translations.length > 0 ? (
            <Suspense fallback={<div>Загрузка плеера...</div>}>
              <PlayerClient translations={translations} />
            </Suspense>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>Извините, для этого аниме пока нет доступных переводов.</p>
              <p>Попробуйте проверить позже или выберите другое аниме.</p>
            </div>
          )}
        </div>
      </div>

      {anime.related_anime && anime.related_anime.length > 0 && (
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6">Похожие аниме</h2>
          <ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <div className="flex w-max space-x-4 p-4">
              {anime.related_anime.map((related) => (
                <div key={related.id} className="inline-block w-[180px]">
                  <AnimeCard anime={related.anime_by_related_id} />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      {anime.similar_anime && anime.similar_anime.length > 0 && (
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6">Вам также может понравиться</h2>
          <AnimeCarousel title="" animeList={anime.similar_anime.map((s) => s.anime_by_similar_id)} />
        </div>
      )}
    </div>
  )
}
