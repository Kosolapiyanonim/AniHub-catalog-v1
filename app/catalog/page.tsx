import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { CatalogFilters } from '@/components/catalog-filters'
import { AnimeGrid } from '@/components/anime-grid'
import { getCatalogAnime, getGenres, getStudios, getYears, getStatuses, getTypes } from '@/lib/data-fetchers'
import { Suspense } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

interface CatalogPageProps {
  searchParams: {
    page?: string
    limit?: string
    search?: string
    genres?: string
    years?: string
    statuses?: string
    types?: string
    studios?: string
    sort?: string
  }
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  const page = parseInt(searchParams.page || '1')
  const limit = parseInt(searchParams.limit || '24')
  const search = searchParams.search || ''
  const genres = searchParams.genres?.split(',') || []
  const years = searchParams.years?.split(',').map(Number).filter(Boolean) || []
  const statuses = searchParams.statuses?.split(',') || []
  const types = searchParams.types?.split(',') || []
  const studios = searchParams.studios?.split(',') || []
  const sort = searchParams.sort || 'shikimori_rating.desc'

  const [
    catalogData,
    allGenres,
    allStudios,
    allYears,
    allStatuses,
    allTypes
  ] = await Promise.all([
    getCatalogAnime(page, limit, search, genres, years, statuses, types, studios, sort),
    getGenres(),
    getStudios(),
    getYears(),
    getStatuses(),
    getTypes()
  ])

  return (
    <main className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Каталог аниме</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-1/4">
          <CatalogFilters
            initialSearch={search}
            initialGenres={genres}
            initialYears={years}
            initialStatuses={statuses}
            initialTypes={types}
            initialStudios={studios}
            initialSort={sort}
            availableGenres={allGenres.genres}
            availableStudios={allStudios.studios}
            availableYears={allYears.years}
            availableStatuses={allStatuses.statuses}
            availableTypes={allTypes.types}
          />
        </aside>

        <section className="lg:w-3/4">
          <Suspense fallback={<p>Загрузка аниме...</p>}>
            <AnimeGrid
              animes={catalogData.results}
              total={catalogData.total}
              hasMore={catalogData.hasMore}
              page={catalogData.page}
              limit={catalogData.limit}
              searchParams={searchParams}
              user={user}
            />
          </Suspense>
        </section>
      </div>
    </main>
  )
}
