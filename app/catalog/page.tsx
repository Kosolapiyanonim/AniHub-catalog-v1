"use client"

import { useEffect, useState } from "react"
import { CatalogFilters, type FiltersState } from "@/components/catalog-filters"
import { AnimeCard } from "@/components/anime-card"
import { Button } from "@/components/ui/button"

interface Anime {
  id: number
  shikimori_id: string
  title: string
  poster_url?: string | null
  year?: number | null
}

export default function CatalogPage() {
  /* ---------------- Состояние фильтров ---------------- */
  const [filters, setFilters] = useState<FiltersState>({
    genres: [],
    yearFrom: "",
    yearTo: "",
    episodesFrom: "",
    episodesTo: "",
    type: [],
    status: "all",
    sort: "popularity",
  })

  /* ---------------- Данные каталога ---------------- */
  const [data, setData] = useState<Anime[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.genres.length) params.append("genres", filters.genres.join(","))
      if (filters.yearFrom) params.append("year_from", filters.yearFrom)
      if (filters.yearTo) params.append("year_to", filters.yearTo)
      if (filters.type.length) params.append("type", filters.type.join(","))
      params.append("status", filters.status)
      params.append("sort", filters.sort)

      const res = await fetch(`/api/catalog?${params}`)
      const json = await res.json()
      setData(json.items ?? [])
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }

  /* первый рендер */
  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ---------------- Рендер ---------------- */
  return (
    <main className="flex">
      {/* контент каталога */}
      <section className="flex-1 p-4">
        {loading && <p>Загрузка…</p>}

        {!loading && data.length === 0 && <p>Ничего не найдено</p>}

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {data.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>

        {/* пример кнопки пагинации */}
        {data.length > 0 && (
          <div className="mt-6 flex justify-center">
            <Button variant="outline">Загрузить ещё</Button>
          </div>
        )}
      </section>

      {/* фильтры справа */}
      <CatalogFilters
        filters={filters}
        onFiltersChange={setFilters}
        onApply={fetchData}
        onReset={() =>
          setFilters({
            genres: [],
            yearFrom: "",
            yearTo: "",
            episodesFrom: "",
            episodesTo: "",
            type: [],
            status: "all",
            sort: "popularity",
          })
        }
      />
    </main>
  )
}
