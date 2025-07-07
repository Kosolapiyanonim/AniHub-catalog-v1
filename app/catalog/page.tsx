"use client"

import { useState, useEffect, useCallback } from "react"
import { AnimeCard } from "@/components/anime-card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { CatalogFilters } from "@/components/catalog-filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, X } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

interface Anime {
  id: number
  shikimori_id: string
  title: string
  poster_url?: string
  year?: number
  shikimori_rating?: number
  episodes_count?: number
  status?: string
}

export default function CatalogPage() {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [showFilters, setShowFilters] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentFilters, setCurrentFilters] = useState<any>({})
  const [page, setPage] = useState(1)

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const buildApiParams = useCallback((filters: any, searchQuery: string, pageNum: number) => {
    const params = new URLSearchParams({
      page: pageNum.toString(),
      limit: "24",
      sort: "shikimori_rating",
      order: "desc",
    })

    if (searchQuery) {
      params.append("title", searchQuery)
    }

    // Применяем фильтры
    if (filters.yearFrom || filters.yearTo) {
      if (filters.yearFrom) params.append("year_from", filters.yearFrom)
      if (filters.yearTo) params.append("year_to", filters.yearTo)
    }

    if (filters.episodesFrom || filters.episodesTo) {
      if (filters.episodesFrom) params.append("episodes_from", filters.episodesFrom)
      if (filters.episodesTo) params.append("episodes_to", filters.episodesTo)
    }

    if (filters.ratingFrom || filters.ratingTo) {
      if (filters.ratingFrom) params.append("rating_from", filters.ratingFrom)
      if (filters.ratingTo) params.append("rating_to", filters.ratingTo)
    }

    if (filters.votesFrom || filters.votesTo) {
      if (filters.votesFrom) params.append("votes_from", filters.votesFrom)
      if (filters.votesTo) params.append("votes_to", filters.votesTo)
    }

    if (filters.genres && filters.genres !== "any") {
      params.append("genres", filters.genres)
    }

    if (filters.status && filters.status !== "any") {
      params.append("status", filters.status)
    }

    if (filters.type && filters.type.length > 0) {
      params.append("type", filters.type.join(","))
    }

    if (filters.ageRating && filters.ageRating.length > 0) {
      params.append("age_rating", filters.ageRating.join(","))
    }

    return params
  }, [])

  const fetchCatalogData = useCallback(
    async (isNewSearch = false) => {
      if (isNewSearch) {
        setLoading(true)
        setAnimes([])
        setPage(1)
      } else {
        setLoadingMore(true)
      }
      setError(null)

      const currentPage = isNewSearch ? 1 : page
      const params = buildApiParams(currentFilters, debouncedSearchTerm, currentPage)

      try {
        const response = await fetch(`/api/catalog?${params.toString()}`)
        if (!response.ok) throw new Error(`Ошибка сети: ${response.statusText}`)

        const data = await response.json()

        if (isNewSearch) {
          setAnimes(data.results || [])
          setTotal(data.total || 0)
        } else {
          setAnimes((prev) => [...prev, ...(data.results || [])])
        }

        setHasMore(data.hasMore || false)

        if (!isNewSearch) {
          setPage((prev) => prev + 1)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Неизвестная ошибка")
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [currentFilters, debouncedSearchTerm, page, buildApiParams],
  )

  // Загрузка данных при изменении поиска
  useEffect(() => {
    fetchCatalogData(true)
  }, [debouncedSearchTerm])

  const handleFiltersChange = (filters: any) => {
    setCurrentFilters(filters)
  }

  const handleApplyFilters = () => {
    fetchCatalogData(true)
  }

  const handleResetFilters = () => {
    setCurrentFilters({})
    fetchCatalogData(true)
  }

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchCatalogData(false)
    }
  }

  return (
    <div className="flex min-h-screen pt-16">
      {/* Основной контент */}
      <div className="flex-1 p-6 min-w-0">
        {/* Заголовок и поиск */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Каталог аниме</h1>
            {!loading && <span className="text-muted-foreground">({total})</span>}
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
            {showFilters ? <X className="h-4 w-4 mr-2" /> : <Filter className="h-4 w-4 mr-2" />}
            {showFilters ? "Скрыть" : "Фильтры"}
          </Button>
        </div>

        {/* Поиск */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Поиск аниме..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Контент */}
        {loading && animes.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-16">{error}</div>
        ) : animes.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">По вашему запросу ничего не найдено.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {animes.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
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
      </div>

      {/* Правая боковая панель фильтров */}
      {showFilters && (
        <CatalogFilters
          onFiltersChange={handleFiltersChange}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
        />
      )}
    </div>
  )
}
