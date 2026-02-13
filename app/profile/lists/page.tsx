"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BookmarkX, Grid3X3, List, Loader2, Search } from "lucide-react"

type ListStatus = "watching" | "planned" | "completed" | "dropped" | "on_hold"
type StatusFilter = ListStatus | "all"
type ViewMode = "grid" | "list"
type SortBy = "updated_desc" | "updated_asc" | "title_asc"

type ListItem = {
  status: ListStatus
  updated_at: string
  anime: {
    id: number
    shikimori_id: string
    title: string
    poster_url: string | null
    year: number | null
    type: string | null
  }
}

const statusMeta: Record<StatusFilter, { label: string; empty: string }> = {
  all: { label: "Все", empty: "Список пуст. Добавьте тайтлы в любой статус." },
  watching: { label: "Смотрю", empty: "Вы ещё ничего не добавили в «Смотрю»." },
  planned: { label: "Запланировано", empty: "Пока нет тайтлов в «Запланировано»." },
  completed: { label: "Просмотрено", empty: "Пока нет завершённых тайтлов." },
  dropped: { label: "Брошено", empty: "Вы ещё ничего не бросили." },
  on_hold: { label: "Отложено", empty: "Нет отложенных тайтлов." },
}

function AnimeCompactCard({ item, viewMode }: { item: ListItem; viewMode: ViewMode }) {
  if (viewMode === "list") {
    return (
      <Link href={`/anime/${item.anime.shikimori_id}`} className="block">
        <Card className="transition-colors hover:border-primary/50">
          <CardContent className="p-3 flex gap-3 items-center">
            <div className="relative h-16 w-12 overflow-hidden rounded-md bg-muted shrink-0">
              {item.anime.poster_url ? (
                <Image
                  src={item.anime.poster_url}
                  alt={item.anime.title}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm line-clamp-1">{item.anime.title}</p>
              <p className="text-xs text-muted-foreground">
                {item.anime.year ?? "—"} {item.anime.type ? `• ${item.anime.type}` : ""}
              </p>
            </div>
            <Badge variant="outline" className="ml-auto">{statusMeta[item.status].label}</Badge>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/anime/${item.anime.shikimori_id}`} className="block group">
      <div className="space-y-2">
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted border border-border group-hover:border-primary/50 transition-colors">
          {item.anime.poster_url ? (
            <Image
              src={item.anime.poster_url}
              alt={item.anime.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 96px, (max-width: 1024px) 120px, 140px"
            />
          ) : null}
        </div>
        <div>
          <p className="text-sm font-medium line-clamp-2 leading-tight">{item.anime.title}</p>
          <p className="text-xs text-muted-foreground">{item.anime.year ?? "—"}</p>
        </div>
      </div>
    </Link>
  )
}

export default function ProfileListsPage() {
  const { session, loading } = useSupabase()
  const [items, setItems] = useState<ListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("all")
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [sortBy, setSortBy] = useState<SortBy>("updated_desc")

  useEffect(() => {
    if (!session?.user?.id) {
      setItems([])
      setIsLoading(false)
      return
    }

    fetch("/api/lists", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => setItems(Array.isArray(data.items) ? data.items : []))
      .catch(() => setItems([]))
      .finally(() => setIsLoading(false))
  }, [session?.user?.id])

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      all: items.length,
      watching: 0,
      planned: 0,
      completed: 0,
      dropped: 0,
      on_hold: 0,
    }

    for (const item of items) {
      counts[item.status] += 1
    }

    return counts
  }, [items])

  const filteredItems = useMemo(() => {
    const normalized = search.trim().toLowerCase()

    let result = items.filter((item) => {
      const statusOk = activeStatus === "all" ? true : item.status === activeStatus
      const searchOk = normalized.length === 0 ? true : item.anime.title.toLowerCase().includes(normalized)
      return statusOk && searchOk
    })

    result = [...result].sort((a, b) => {
      if (sortBy === "title_asc") {
        return a.anime.title.localeCompare(b.anime.title, "ru")
      }

      const aTime = new Date(a.updated_at).getTime()
      const bTime = new Date(b.updated_at).getTime()
      return sortBy === "updated_asc" ? aTime - bTime : bTime - aTime
    })

    return result
  }, [activeStatus, items, search, sortBy])

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!session?.user?.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Мои списки</CardTitle>
            <CardDescription>Авторизуйтесь, чтобы видеть персональные списки.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/login?redirectTo=%2Fprofile%2Flists">Войти</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Мои списки</h1>
        <p className="text-sm text-muted-foreground">Панель фильтрации + компактные карточки для меньшего трафика. Клик ведёт на /anime/id.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Списки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {(Object.keys(statusMeta) as StatusFilter[]).map((status) => (
              <button
                key={status}
                className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                  activeStatus === status ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60"
                }`}
                onClick={() => setActiveStatus(status)}
              >
                <span>{statusMeta[status].label}</span>
                <span>{statusCounts[status]}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Фильтр по названию"
                className="pl-9"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="updated_desc">Сначала новые</option>
              <option value="updated_asc">Сначала старые</option>
              <option value="title_asc">По названию</option>
            </select>

            <div className="inline-flex rounded-md border border-input p-1">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className="h-8"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="h-8"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                <BookmarkX className="h-6 w-6" />
                <p>{statusMeta[activeStatus].empty}</p>
              </CardContent>
            </Card>
          ) : viewMode === "list" ? (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <AnimeCompactCard key={`${item.status}-${item.anime.id}`} item={item} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
              {filteredItems.map((item) => (
                <AnimeCompactCard key={`${item.status}-${item.anime.id}`} item={item} viewMode={viewMode} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
