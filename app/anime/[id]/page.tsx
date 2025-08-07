import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getAnimeById } from '@/lib/data-fetchers'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AnimePageListButton } from '@/components/anime-page-list-button'
import { SubscribeButton } from '@/components/SubscribeButton'

interface AnimePageProps {
  params: {
    id: string
  }
}

export default async function AnimePage({ params }: AnimePageProps) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  const anime = await getAnimeById(params.id)

  if (!anime) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-8 mt-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
            <Image
              src={anime.poster_url || '/placeholder.svg?height=600&width=400&text=No+Poster'}
              alt={anime.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="mt-4 space-y-2">
            {user && <AnimePageListButton animeId={anime.id} userId={user.id} />}
            {user && <SubscribeButton animeId={anime.id} userId={user.id} />}
            <a
              href={`/anime/${anime.id}/watch`}
              className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Смотреть
            </a>
          </div>
        </div>

        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold mb-2">{anime.title}</h1>
          {anime.title_orig && <h2 className="text-xl text-muted-foreground mb-4">{anime.title_orig}</h2>}

          <div className="flex flex-wrap gap-2 mb-4">
            {anime.genres?.map((genre) => (
              <Badge key={genre} variant="secondary">{genre}</Badge>
            ))}
            {anime.studios?.map((studio) => (
              <Badge key={studio} variant="outline">{studio}</Badge>
            ))}
            {anime.countries?.map((country) => (
              <Badge key={country} variant="outline">{country}</Badge>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
            {anime.year && <span>Год: {anime.year}</span>}
            {anime.status && <span>Статус: {anime.status}</span>}
            {anime.episodes_count && <span>Эпизоды: {anime.episodes_count}</span>}
            {anime.shikimori_rating && (
              <span>Рейтинг Shikimori: {anime.shikimori_rating} ({anime.shikimori_votes || 0} голосов)</span>
            )}
          </div>

          <Separator className="my-6" />

          <h3 className="text-2xl font-semibold mb-3">Описание</h3>
          <p className="text-muted-foreground leading-relaxed">
            {anime.description || 'Описание отсутствует.'}
          </p>

          {/* Дополнительные секции, например, скриншоты, похожие аниме */}
          {anime.screenshots && anime.screenshots.length > 0 && (
            <>
              <Separator className="my-6" />
              <h3 className="text-2xl font-semibold mb-3">Скриншоты</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {anime.screenshots.map((screenshot: string, index: number) => (
                  <div key={index} className="relative w-full aspect-video rounded-md overflow-hidden">
                    <Image
                      src={screenshot || "/placeholder.svg"}
                      alt={`Screenshot ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
