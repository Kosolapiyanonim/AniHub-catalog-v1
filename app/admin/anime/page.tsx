"use client"

import { useState, useEffect } from "react"
import { AdminTable } from "@/components/admin/admin-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Film } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Anime {
  id: number
  shikimori_id: string
  title: string
  year: number | null
  poster_url: string | null
  status: string | null
  shikimori_rating: number | null
  episodes_total: number | null
}

export default function AnimeListPage() {
  const router = useRouter()
  const [animes, setAnimes] = useState<Anime[]>([])
  const [filteredAnimes, setFilteredAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    const fetchAnimes = async () => {
      try {
        const response = await fetch("/api/catalog?limit=1000")
        if (!response.ok) {
          throw new Error("Failed to fetch animes")
        }
        const data = await response.json()
        setAnimes(data.animes || [])
        setFilteredAnimes(data.animes || [])
      } catch (err) {
        console.error("Error fetching animes:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnimes()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAnimes(animes)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredAnimes(
        animes.filter(
          (anime) =>
            anime.title.toLowerCase().includes(query) ||
            anime.shikimori_id.toLowerCase().includes(query)
        )
      )
    }
    setPage(1)
  }, [searchQuery, animes])

  const paginatedAnimes = filteredAnimes.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )

  const totalPages = Math.ceil(filteredAnimes.length / itemsPerPage)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Управление аниме</h1>
          <p className="text-slate-400">Всего аниме: {filteredAnimes.length}</p>
        </div>
        <Link href="/admin/anime/bulk">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Массовое редактирование
          </Button>
        </Link>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Поиск по названию или Shikimori ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-900 border-slate-700"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AdminTable
            data={paginatedAnimes}
            columns={[
              {
                key: "id",
                label: "ID",
              },
              {
                key: "title",
                label: "Название",
                render: (value, row) => (
                  <div className="flex items-center gap-2">
                    <Film className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">{value}</span>
                  </div>
                ),
              },
              {
                key: "shikimori_id",
                label: "Shikimori ID",
              },
              {
                key: "year",
                label: "Год",
                render: (value) => value || "-",
              },
              {
                key: "status",
                label: "Статус",
                render: (value) => (
                  <Badge variant="outline" className="border-slate-600">
                    {value || "Не указан"}
                  </Badge>
                ),
              },
              {
                key: "shikimori_rating",
                label: "Рейтинг",
                render: (value) => value ? value.toFixed(1) : "-",
              },
              {
                key: "actions",
                label: "Действия",
                render: (_, row) => (
                  <Link href={`/admin/anime/${row.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Редактировать
                    </Button>
                  </Link>
                ),
              },
            ]}
            onRowClick={(row) => router.push(`/admin/anime/${row.id}/edit`)}
            pagination={{
              page,
              totalPages,
              onPageChange: setPage,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}





