import { AnimeGrid } from "@/components/anime-grid"
import { getCatalogAnime } from "@/lib/data-fetchers"
import { PaginationControls } from "@/components/pagination-controls"

interface PopularPageProps {
  searchParams: {
    page?: string
    limit?: string
  }
}

export default async function PopularPage({ searchParams }: PopularPageProps) {
  const page = Number.parseInt(searchParams.page || "1")
  const limit = Number.parseInt(searchParams.limit || "24")

  // Fetch popular anime by default sorting by shikimori_rating in descending order
  const { anime, total } = await getCatalogAnime(page, limit, {
    sort: "shikimori_rating",
    order: "desc",
  })
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Популярное Аниме</h1>

      {anime.length === 0 ? (
        <div className="text-center text-muted-foreground text-lg">Популярное аниме не найдено.</div>
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
