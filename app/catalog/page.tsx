import { Suspense } from "react"
import { AnimeGrid } from "@/components/anime-grid"
import { CatalogFilters } from "@/components/catalog-filters"
import { getCatalogAnime } from "@/lib/data-fetchers"
import { PaginationControls } from "@/components/pagination-controls"
import { Skeleton } from "@/components/ui/skeleton"

interface CatalogPageProps {
  searchParams: {
    page?: string
    limit?: string
    genres?: string
    years?: string
    statuses?: string
    types?: string
    studios?: string
    tags?: string
    search?: string
    sort?: string
    order?: string
    anime_kind?: string // New search param
  }
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const page = Number.parseInt(searchParams.page || "1")
  const limit = Number.parseInt(searchParams.limit || "24")
  const filters = {
    genres: searchParams.genres?.split(",").filter(Boolean) || [],
    years: searchParams.years?.split(",").filter(Boolean) || [],
    statuses: searchParams.statuses?.split(",").filter(Boolean) || [],
    types: searchParams.types?.split(",").filter(Boolean) || [],
    studios: searchParams.studios?.split(",").filter(Boolean) || [],
    tags: searchParams.tags?.split(",").filter(Boolean) || [],
    search: searchParams.search || "",
    sort: searchParams.sort || "shikimori_rating",
    order: searchParams.order || "desc",
    anime_kind: searchParams.anime_kind || "", // Pass new filter
  }

  const { anime, total } = await getCatalogAnime(page, limit, filters)
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Каталог Аниме</h1>

      <div className="mb-8">
        <Suspense fallback={<Skeleton className="h-20 w-full" />}>
          <CatalogFilters currentFilters={filters} />
        </Suspense>
      </div>

      {anime.length === 0 ? (
        <div className="text-center text-muted-foreground text-lg">
          По вашему запросу ничего не найдено. Попробуйте изменить фильтры.
        </div>
      ) : (
        <>
          <AnimeGrid animeList={anime} />
          <div className="mt-8 flex justify-center">
            <PaginationControls currentPage={page} totalPages={totalPages} />
          </div>
        </>
      )}
    </div>
  )
}
