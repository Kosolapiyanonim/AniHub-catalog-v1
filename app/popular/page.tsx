import { getCatalogData } from "@/lib/data-fetchers"
import { AnimeGrid } from "@/components/anime-grid"
import { AnimeCard } from "@/components/anime-card"
import { PaginationComponent } from "@/components/ui/pagination"
import { Separator } from "@/components/ui/separator"

export const dynamic = "force-dynamic"

export default async function PopularPage({
  searchParams,
}: {
  searchParams: {
    page?: string
  }
}) {
  const page = Number.parseInt(searchParams.page || "1")
  const limit = 24 // Number of items per page

  const { data, count, totalPages } = await getCatalogData({
    page,
    limit,
    sort: "shikimori_rating.desc", // Default sort for popular page
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Популярное Аниме</h1>

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
              baseUrl="/popular"
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
