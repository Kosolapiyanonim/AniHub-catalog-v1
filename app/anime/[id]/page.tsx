import { notFound } from "next/navigation"
import Image from "next/image"
import { getAnimeById, getAnimeTranslations } from "@/lib/data-fetchers"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import Link from "next/link"
import { AddToListButton } from "@/components/AddToListButtonOnCard"

export default async function AnimePage({ params }: { params: { id: string } }) {
  const animeId = Number.parseInt(params.id)
  if (isNaN(animeId)) {
    notFound()
  }

  const anime = await getAnimeById(animeId)
  if (!anime) {
    notFound()
  }

  const translations = await getAnimeTranslations(anime.shikimori_id)

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden mb-8">
        <Image
          src={anime.poster_url || "/placeholder.svg?height=500&width=900&text=Anime+Poster"}
          alt={anime.title || "Anime Poster"}
          fill
          style={{ objectFit: "cover" }}
          className="brightness-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <h1 className="text-3xl md:text-5xl font-bold mb-2 drop-shadow-lg">{anime.title}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {anime.genres?.map((genre) => (
              <Badge key={genre} variant="secondary" className="bg-purple-500 text-white">
                {genre}
              </Badge>
            ))}
            {anime.year && <Badge variant="secondary">{anime.year}</Badge>}
            {anime.type && <Badge variant="secondary">{anime.type}</Badge>}
          </div>
          <div className="flex gap-4">
            {translations && translations.length > 0 ? (
              <Link href={`/anime/${anime.id}/watch?translationId=${translations[0].id}`} passHref>
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Play className="mr-2 h-5 w-5" />
                  Смотреть
                </Button>
              </Link>
            ) : (
              <Button size="lg" disabled className="bg-gray-600 text-white">
                <Play className="mr-2 h-5 w-5" />
                Нет доступных переводов
              </Button>
            )}
            <AddToListButton animeId={anime.id} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Описание</h2>
          <p className="text-muted-foreground leading-relaxed">{anime.description}</p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {anime.status && (
              <div>
                <span className="font-semibold">Статус:</span> {anime.status}
              </div>
            )}
            {anime.episodes && (
              <div>
                <span className="font-semibold">Эпизоды:</span> {anime.episodes}
              </div>
            )}
            {anime.aired_on && (
              <div>
                <span className="font-semibold">Дата выхода:</span> {new Date(anime.aired_on).toLocaleDateString()}
              </div>
            )}
            {anime.rating && (
              <div>
                <span className="font-semibold">Рейтинг:</span> {anime.rating}
              </div>
            )}
            {anime.studios && anime.studios.length > 0 && (
              <div>
                <span className="font-semibold">Студии:</span> {anime.studios.join(", ")}
              </div>
            )}
            {anime.tags && anime.tags.length > 0 && (
              <div>
                <span className="font-semibold">Теги:</span> {anime.tags.join(", ")}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Дополнительная информация</h2>
          <div className="space-y-4">
            {anime.screenshots && anime.screenshots.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Скриншоты:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {anime.screenshots.slice(0, 4).map((screenshot, index) => (
                    <Image
                      key={index}
                      src={screenshot || "/placeholder.svg"}
                      alt={`Screenshot ${index + 1}`}
                      width={200}
                      height={120}
                      className="rounded-md object-cover"
                    />
                  ))}
                </div>
              </div>
            )}
            {translations && translations.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Доступные переводы:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {translations.map((translation) => (
                    <li key={translation.id}>
                      <Link
                        href={`/anime/${anime.id}/watch?translationId=${translation.id}`}
                        className="text-primary hover:underline"
                      >
                        {translation.title} ({translation.type})
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
