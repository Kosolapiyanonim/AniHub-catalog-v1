import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAnimeList } from '@/lib/data-fetchers'
import { AnimeGrid } from '@/components/anime-grid'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function FavoritesPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const favoriteList = await getAnimeList(user.id, 'Избранное') // Assuming 'Избранное' is the name for favorites

  return (
    <main className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Мои избранные аниме</h1>

      {favoriteList && favoriteList.animes.length > 0 ? (
        <AnimeGrid
          animes={favoriteList.animes}
          total={favoriteList.animes.length}
          hasMore={false}
          page={1}
          limit={favoriteList.animes.length}
          user={user}
        />
      ) : (
        <Card className="w-full max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle>Список избранного пуст</CardTitle>
            <CardDescription>
              Вы пока не добавили ни одного аниме в избранное.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Начните добавлять аниме, которые вам нравятся, чтобы они появились здесь.
            </p>
            <Link href="/catalog" passHref>
              <Button>Перейти в каталог</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
