"use client"

import { useState, useEffect, useCallback } from "react"
import { AnimeCard } from "@/components/anime-card"
import { CatalogFilters, type FiltersState, DEFAULT_FILTERS } from "@/components/catalog-filters"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useSupabase } from "@/components/supabase-provider"

interface Anime {
  id: number
  shikimori_id: number
  title: string
  poster_url: string | null
  year: number | null
  type: string | null
  user_list_status?: string | null
}

interface CatalogResponse {
  data: Anime[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const ITEMS_PER_PAGE = 24

export default function CatalogPage() {
  const { session } = useSupabase()
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const fetchAnimes = useCallback(async (page: number, currentFilters: FiltersState) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...Object.fromEntries(
          Object.entries(currentFilters).filter(([_, value]) => {
            if (Array.isArray(value)) return value.length > 0
            return value !== "" && value !== null && value !== undefined
          }),
        ),
      })

      const response = await fetch(`/api/catalog?${params}`)
      if (!response.ok) throw new Error("Failed to fetch animes")

      const data: CatalogResponse = await response.json()
      setAnimes(data.data)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (error) {
      console.error("Error fetching animes:", error)
      setAnimes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnimes(currentPage, filters)
  }, [currentPage, filters, fetchAnimes])

  const handleFiltersApply = (newFilters: FiltersState) => {
    setFilters(newFilters)
    setCurrentPage(1)
    setMobileFiltersOpen(false)
  }

  const handleStatusChange = (animeId: number, newStatus: string | null) => {
    setAnimes((prev) => prev.map((anime) => (anime.id === animeId ? { ...anime, user_list_status: newStatus } : anime)))
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const getVisiblePages = () => {
      const delta = 2
      const range = []
      const rangeWithDots = []

      for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i)
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, "...")
      } else {
        rangeWithDots.push(1)
      }

      rangeWithDots.push(...range)

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push("...", totalPages)
      } else {
        rangeWithDots.push(totalPages)
      }

      return rangeWithDots
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 px-4">
        <p className="text-sm text-slate-400 order-2 sm:order-1">
          Показано {animes.length} из {total} аниме
        </p>

        <div className="flex items-center gap-2 order-1 sm:order-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="border-slate-700 hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Назад</span>
          </Button>

          <div className="hidden sm:flex items-center gap-1">
            {getVisiblePages().map((page, index) => (
              <Button
                key={index}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => typeof page === "number" && handlePageChange(page)}
                disabled={typeof page !== "number"}
                className={`min-w-[40px] ${
                  page === currentPage ? "bg-purple-600 hover:bg-purple-700" : "border-slate-700 hover:bg-slate-800"
                }`}
              >
                {page}
              </Button>
            ))}
          </div>

          <div className="sm:hidden flex items-center gap-2 text-sm text-slate-400">
            <span>
              {currentPage} из {totalPages}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="border-slate-700 hover:bg-slate-800"
          >
            <span className="hidden sm:inline mr-1">Вперед</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile Filters */}
          <div className="lg:hidden">
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Фильтры
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[300px] sm:w-[350px] bg-slate-900 border-slate-800 overflow-y-auto"
              >
                <SheetHeader>
                  <SheetTitle className="text-white">Фильтры</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <CatalogFilters initialFilters={filters} onApply={handleFiltersApply} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Filters */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <CatalogFilters initialFilters={filters} onApply={handleFiltersApply} />
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Каталог аниме</h1>
              <p className="text-slate-400 text-sm sm:text-base">
                {loading ? "Загрузка..." : `Найдено ${total} аниме`}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="aspect-[2/3] w-full bg-slate-800" />
                    <Skeleton className="h-4 w-full bg-slate-800" />
                    <Skeleton className="h-3 w-2/3 bg-slate-800" />
                  </div>
                ))}
              </div>
            ) : animes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg mb-4">Аниме не найдено</p>
                <p className="text-slate-500 text-sm">Попробуйте изменить фильтры поиска</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
                  {animes.map((anime, index) => (
                    <AnimeCard key={anime.id} anime={anime} priority={index < 12} onStatusChange={handleStatusChange} />
                  ))}
                </div>
                {renderPagination()}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
