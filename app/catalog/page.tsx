"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AnimeCard } from "@/components/anime-card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Button } from "@/components/ui/button"
import { CatalogFilters, type FiltersState } from "@/components/catalog-filters"

interface Anime {
  id: number
  shikimori_id: string
  title: string
  poster_url?: string
  year?: number
}

const INITIAL_FILTERS: Omit<FiltersState, "page" | "limit" | "title"> = {
  sort: "shikimori_rating",
  yearFrom: "",
  yearTo: "",
  type: [],
}

function CatalogView() {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)

  const searchParams = useSearchParams()
  const titleFromUrl = searchParams.get("title") || ""

  const [filters, setFilters] = useState<FiltersState>({
    ...INITIAL_FILTERS,
    page: 1,
    limit: 24,
    title: "",
  })

  const fetchCatalogData = useCallback(async (currentFilters: FiltersState, isNewSearch: boolean) => {
    if (isNewSearch) setLoading(true)
    else setLoadingMore(true)

    const params = new URLSearchParams()
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          if (value.length > 0) params.append(key, value.join(","))
        } else {
          params.append(key, String(value))
        }
      }
    })

    try {
      const response = await fetch(`/api/catalog?${params.toString()}`)
      if (!response.ok) throw new Error("Ошибка сети")
      const data = await response.json()
      setAnimes((prev) => (isNewSearch ? data.results : [...prev, ...data.results]))
      setHasMore(data.hasMore)
      if (isNewSearch) setTotal(data.total || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  // Начальная загрузка
  useEffect(() => {
    const initialFilters = {
      ...INITIAL_FILTERS,
      page: 1,
      limit: 24,
      title: titleFromUrl,
    }
    setFilters(initialFilters)
    fetchCatalogData(initialFilters, true)
  }, []) // Только при монтировании

  // Обновление при изменении URL
  useEffect(() => {
    if (filters.title !== titleFromUrl) {
      const newFilters = {
        ...INITIAL_FILTERS,
        page: 1,
        limit: 24,
        title: titleFromUrl,
      }
      setFilters(newFilters)
      fetchCatalogData(newFilters, true)
    }
  }, [titleFromUrl, filters.title, fetchCatalogData])

  const handleApplyFilters = () => {
    const newFilters = { ...filters, page: 1 }
    fetchCatalogData(newFilters, true)
  }

  const handleResetFilters = () => {
    const newFilters = { ...INITIAL_FILTERS, page: 1, limit: 24, title: "" }
    setFilters(newFilters)
    fetchCatalogData(newFilters, true)
  }

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const newFilters = { ...filters, page: filters.page + 1 }
      setFilters(newFilters)
      fetchCatalogData(newFilters, false)
    }
  }

  return (
    <div className="container mx-auto px-4 pt-20">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-80 lg:sticky top-20 h-full">
          <CatalogFilters
            filters={filters}
            onFiltersChange={setFilters}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />
        </aside>

        <main className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Каталог</h1>
            {!loading && <span className="text-muted-foreground text-sm">Найдено: {total}</span>}
          </div>

          {loading && animes.length === 0 ? (
            <div className="flex justify-center items-center h-96">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {animes.map((anime) => (
                  <AnimeCard key={`${anime.shikimori_id}-${anime.id}`} anime={anime} />
                ))}
              </div>
              {hasMore && (
                <div className="text-center mt-8">
                  <Button onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? <LoadingSpinner /> : "Загрузить еще"}
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
    <Suspense fallback={<div>Загрузка...</div>}>
      <CatalogView />
    </Suspense>
  )
}
