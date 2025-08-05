import { Suspense } from "react"
import { getCatalogData } from "@/lib/data-fetchers"
import { AnimeGrid } from "@/components/anime-grid"
import { AnimeCard } from "@/components/anime-card"
import { CatalogFilters } from "@/components/catalog-filters"
import { PaginationComponent } from "@/components/ui/pagination"
import { Separator } from "@/components/ui/separator"

export const dynamic = "force-dynamic"

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: {
    page?: string
    genre?: string
    year?: string
    type?: string
    status?: string
    studio?: string
    tag?: string
    kind?: string // New search param for anime_kind
    search?: string
    sort?: string
  }
}) {
  const page = Number.parseInt(searchParams.page || "1")
  const limit = 24 // Number of items per page

  const { data, count, totalPages } = await getCatalogData({
    page,
    limit,
    genre: searchParams.genre,
    year: searchParams.year,
    type: searchParams.type,
    status: searchParams.status,
    studio: searchParams.studio,
    tag: searchParams.tag,
    kind: searchParams.kind, // Pass new search param
    search: searchParams.search,
    sort: searchParams.sort,
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Каталог Аниме</h1>

      <Suspense fallback={<div>Загрузка фильтров...</div>}>
        <CatalogFilters />
      </Suspense>

      <Separator className="my-8" />

      {data && data.length > 0 ? (
        <>
          <AnimeGrid>
            {data.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </AnimeGrid>

          <div className="mt-8 flex justify-center">
            <PaginationComponent
              currentPage={page}
              totalPages={totalPages}
              baseUrl="/catalog"
              searchParams={searchParams}
            />
          </div>
        </>
      ) : (
        <div className="text-center text-muted-foreground py-16">
          <p className="text-xl">По вашему запросу ничего не найдено.</p>
          <p className="text-md mt-2">Попробуйте изменить фильтры или поисковый запрос.</p>
        </div>
      )}
    </div>
  )
}
