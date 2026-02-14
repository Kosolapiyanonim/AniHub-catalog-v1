"use client"

import Image from "next/image"
import Link from "next/link"
import { type TouchEvent, useEffect, useMemo, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookmarkX, Loader2, Search } from "lucide-react"

type ListStatus = "watching" | "planned" | "completed" | "dropped" | "on_hold"
type StatusFilter = ListStatus | "all"
type SortBy = "updated_desc" | "title_asc" | "my_rating_desc"

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
  user_anime_rating?: number | null
}

const statusOrder: StatusFilter[] = ["all", "watching", "planned", "completed", "dropped", "on_hold"]

const statusMeta: Record<StatusFilter, { label: string; empty: string }> = {
  all: { label: "Все", empty: "Список пуст." },
  watching: { label: "Смотрю", empty: "Нет тайтлов в «Смотрю»." },
  planned: { label: "Запланировано", empty: "Нет тайтлов в «Запланировано»." },
  completed: { label: "Просмотрено", empty: "Нет завершённых тайтлов." },
  dropped: { label: "Брошено", empty: "Нет тайтлов в «Брошено»." },
  on_hold: { label: "Отложено", empty: "Нет тайтлов в «Отложено»." },
}

function AnimeCardCompact({ item }: { item: ListItem }) {
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
              sizes="(max-width: 640px) 44vw, (max-width: 1024px) 28vw, 180px"
            />
          ) : null}
        </div>
        <div>
          <p className="text-sm font-medium line-clamp-2 leading-tight">{item.anime.title}</p>
          <p className="text-xs text-muted-foreground">{item.anime.year ?? "—"}</p>
          {item.user_anime_rating ? <p className="text-xs text-amber-400">Моя оценка: {item.user_anime_rating}/10</p> : null}
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
  const [sortBy, setSortBy] = useState<SortBy>("updated_desc")
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

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

  const counts = useMemo(() => {
    const result: Record<StatusFilter, number> = {
      all: items.length,
      watching: 0,
      planned: 0,
      completed: 0,
      dropped: 0,
      on_hold: 0,
    }

    for (const item of items) result[item.status] += 1
    return result
  }, [items])

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()

    const statusFiltered = items.filter((item) => {
      if (activeStatus === "all") return true
      return item.status === activeStatus
    })

    const searched = statusFiltered.filter((item) =>
      query.length === 0 ? true : item.anime.title.toLowerCase().includes(query)
    )

    return [...searched].sort((a, b) => {
      if (sortBy === "title_asc") return a.anime.title.localeCompare(b.anime.title, "ru")
      if (sortBy === "my_rating_desc") return (b.user_anime_rating ?? 0) - (a.user_anime_rating ?? 0)
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })
  }, [activeStatus, items, search, sortBy])

  const switchStatusBySwipe = (direction: "next" | "prev") => {
    const currentIndex = statusOrder.indexOf(activeStatus)
    if (currentIndex === -1) return

    const nextIndex = direction === "next"
      ? Math.min(statusOrder.length - 1, currentIndex + 1)
      : Math.max(0, currentIndex - 1)

    if (nextIndex !== currentIndex) setActiveStatus(statusOrder[nextIndex])
  }

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0].clientX)
  }

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return

    const deltaX = event.changedTouches[0].clientX - touchStartX
    const threshold = 50

    if (deltaX <= -threshold) switchStatusBySwipe("next")
    else if (deltaX >= threshold) switchStatusBySwipe("prev")

    setTouchStartX(null)
  }

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
            <CardDescription>Войдите, чтобы открыть списки.</CardDescription>
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
    <div className="container mx-auto px-4 py-5 md:py-7 space-y-3">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Мои списки</h1>
        <p className="text-sm text-muted-foreground">Свайп по карточкам: влево/вправо для смены вкладки.</p>
      </div>

      <div className="space-y-3">
        <div className="-mx-4 px-4 overflow-x-auto">
          <div className="flex gap-2 w-max pb-1">
            {statusOrder.map((status) => (
              <Button
                key={status}
                variant={activeStatus === status ? "default" : "outline"}
                size="sm"
                className="whitespace-nowrap"
                onClick={() => setActiveStatus(status)}
              >
                {statusMeta[status].label} {counts[status]}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию"
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              size="sm"
              variant={sortBy === "updated_desc" ? "default" : "outline"}
              onClick={() => setSortBy("updated_desc")}
              className="flex-1"
            >
              Сначала новые
            </Button>
            <Button
              size="sm"
              variant={sortBy === "title_asc" ? "default" : "outline"}
              onClick={() => setSortBy("title_asc")}
              className="flex-1"
            >
              По названию
            </Button>
            <Button
              size="sm"
              variant={sortBy === "my_rating_desc" ? "default" : "outline"}
              onClick={() => setSortBy("my_rating_desc")}
              className="flex-1"
            >
              По оценке
            </Button>
          </div>
        </div>

        <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                <BookmarkX className="h-6 w-6" />
                <p>{statusMeta[activeStatus].empty}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredItems.map((item) => (
                <AnimeCardCompact key={`${item.status}-${item.anime.id}`} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
