import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { AnimeGrid } from '@/components/anime-grid'
import { getCatalogAnime } from '@/lib/data-fetchers'
import { Suspense } from 'react'

interface PopularPageProps {
  searchParams: {
    page?: string
    limit?: string
  }
}

export default async function PopularPage({ searchParams }: PopularPageProps) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  const page = parseInt(searchParams.page || '1')
  const limit = parseInt(searchParams.limit || '24')

  // Fetch popular anime (e.g., sorted by shikimori_rating descending)
  const popularAnimeData = await getCatalogAnime(page, limit, '', [], [], [], [], [], 'shikimori_rating.desc')

  return (
    <main className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Популярное аниме</h1>

      <Suspense fallback={<p>Загрузка популярных аниме...</p>}>
        <AnimeGrid
          animes={popularAnimeData.results}
          total={popularAnimeData.total}
          hasMore={popularAnimeData.hasMore}
          page={popularAnimeData.page}
          limit={popularAnimeData.limit}
          searchParams={{ sort: 'shikimori_rating.desc' }} // Pass sort param for pagination
          user={user}
        />
      </Suspense>
    </main>
  )
}
