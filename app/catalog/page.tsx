"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AnimeCard } from "@/components/anime-card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Button } from "@/components/ui/button"
import { CatalogFilters, type FiltersState, DEFAULT_FILTERS } from "@/components/catalog-filters"

interface Anime {
  id: number
  title: string
  poster: string
  year: number
  rating: number
  genres: string[]
  status: string
  episodes_count?: number
  description?: string
}

const parseUrlToFilters = (params: URLSearchParams): FiltersState => ({
  ...DEFAULT_FILTERS,
  title: params.get("title") || "",
  sort: params.get("sort") || "shikimori_votes",
  genres: params.get("genres")?.split(",").filter(Boolean) || [],
  years: params.get("years")?.split(",").filter(Boolean) || [],
  studios: params.get("studios")?.split(",").filter(Boolean) || [],
  types: params.get("types")?.split(",").filter(Boolean) || [],
  statuses: params.get("statuses")?.split(",").filter(Boolean) || [],
  user_list_status: params.get("user_list_status") || "",
})

function CatalogView() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [anime, setAnime] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [currentFilters, setCurrentFilters] = useState<FiltersState>(() => parseUrlToFilters(searchParams))

  const fetchData = useCallback(async (filters: FiltersState, page = 1) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()

      // Добавляем все фильтры в параметры запроса
      if (filters.title) params.set("title", filters.title)
      if (filters.sort) params.set("sort", filters.sort)
      if (filters.genres.length > 0) params.set("genres", filters.genres.join(","))
      if (filters.years.length > 0) params.set("years", filters.years.join(","))
      if (filters.studios.length > 0) params.set("studios", filters.studios.join(","))
      if (filters.types.length > 0) params.set("types", filters.types.join(","))
      if (filters.statuses.length > 0) params.set("statuses", filters.statuses.join(","))
      if (filters.user_list_status) params.set("user_list_status", filters.user_list_status)

      params.set("page", page.toString())
      params.set("limit", "20")

      const response = await fetch(`/api/catalog?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setAnime(data.anime || [])
      setTotalPages(data.totalPages || 1)
      setCurrentPage(page)
    } catch (err) {
      console.error("Error fetching catalog:", err)
      setError(err instanceof Error ? err.message : "Произошла ошибка при загрузке каталога")
      setAnime([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleApplyFilters = useCallback(
    (newFilters: FiltersState) => {
      setCurrentFilters(newFilters)

      // Обновляем URL
      const params = new URLSearchParams()
      Object.entries(newFilters).forEach(([key, value]) => {
        const filterKey = key as keyof FiltersState
        if (JSON.stringify(value) !== JSON.stringify(DEFAULT_FILTERS[filterKey])) {
          if (Array.isArray(value) && value.length > 0) {
            params.set(key, value.join(","))
          } else if (typeof value === "string" && value) {
            params.set(key, value)
          }
        }
      })

      const newUrl = params.toString() ? `/catalog?${params.toString()}` : "/catalog"
      router.push(newUrl, { scroll: false })

      // Загружаем данные с новыми фильтрами
      fetchData(newFilters, 1)
    },
    [fetchData, router],
  )

  const handlePageChange = useCallback(
    (page: number) => {
      fetchData(currentFilters, page)
      window.scrollTo({ top: 0, behavior: "smooth" })
    },
    [fetchData, currentFilters],
  )

  // Загружаем данные при изменении URL параметров
  useEffect(() => {
    const urlFilters = parseUrlToFilters(searchParams)
    setCurrentFilters(urlFilters)
    fetchData(urlFilters, 1)
  }, [searchParams, fetchData])

  return (
    <div className="container mx-auto px-4 pt-20">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Боковая панель с фильтрами */}
        <aside className="w-full lg:w-80 lg:max-w-xs shrink-0">
          <CatalogFilters initialFilters={currentFilters} onApply={handleApplyFilters} />
        </aside>

        {/* Основной контент */}
        <main className="flex-1">
          {/* Заголовок и информация */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Каталог аниме</h1>
            {!loading && (
              <p className="text-muted-foreground">
                Найдено {anime.length} аниме
                {totalPages > 1 && ` (страница ${currentPage} из ${totalPages})`}
              </p>
            )}
          </div>

          {/* Состояния загрузки и ошибок */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => fetchData(currentFilters, currentPage)} variant="outline">
                Попробовать снова
              </Button>
            </div>
          )}

          {/* Сетка аниме */}
          {!loading && !error && (
            <>
              {anime.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                  {anime.map((item) => (
                    <AnimeCard key={item.id} anime={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">По вашему запросу ничего не найдено</p>
                  <Button onClick={() => handleApplyFilters(DEFAULT_FILTERS)} variant="outline">
                    Сбросить фильтры
                  </Button>
                </div>
              )}

              {/* Пагинация */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    variant="outline"
                    size="sm"
                  >
                    Назад
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          className="w-10"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Вперёд
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default function CatalogPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 pt-20">
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        </div>
      }
    >
      <CatalogView />
    </Suspense>
  )
}
