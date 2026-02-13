"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookmarkX, Loader2 } from "lucide-react"

type ListStatus = "watching" | "planned" | "completed" | "dropped" | "on_hold"

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

const statusMeta: Record<ListStatus, { label: string; empty: string }> = {
  watching: { label: "Смотрю", empty: "Вы ещё ничего не добавили в «Смотрю»." },
  planned: { label: "В планах", empty: "Пока нет тайтлов в «В планах»." },
  completed: { label: "Просмотрено", empty: "Пока нет завершённых тайтлов." },
  dropped: { label: "Брошено", empty: "Вы ещё ничего не бросили." },
  on_hold: { label: "Отложено", empty: "Нет отложенных тайтлов." },
}

function AnimeMiniCard({ item }: { item: ListItem }) {
  return (
    <Link href={`/anime/${item.anime.shikimori_id}`} className="block">
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardContent className="p-4 space-y-2">
          <p className="font-medium line-clamp-2">{item.anime.title}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {item.anime.year ? <span>{item.anime.year}</span> : null}
            {item.anime.type ? <span>• {item.anime.type}</span> : null}
          </div>
          <Badge variant="outline">Открыть /anime/{item.anime.shikimori_id}</Badge>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function ProfileListsPage() {
  const { session, loading } = useSupabase()
  const [items, setItems] = useState<ListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  const grouped = useMemo(() => {
    const base: Record<ListStatus, ListItem[]> = {
      watching: [],
      planned: [],
      completed: [],
      dropped: [],
      on_hold: [],
    }

    for (const item of items) {
      if (base[item.status]) {
        base[item.status].push(item)
      }
    }

    return base
  }, [items])

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
        <p className="text-sm text-muted-foreground">Карточки разделены по статусам и ведут на страницу аниме (/anime/id).</p>
      </div>

      <Tabs defaultValue="watching" className="space-y-4">
        <TabsList className="flex w-full flex-wrap h-auto">
          {(Object.keys(statusMeta) as ListStatus[]).map((status) => (
            <TabsTrigger key={status} value={status} className="capitalize">
              {statusMeta[status].label} ({grouped[status].length})
            </TabsTrigger>
          ))}
        </TabsList>

        {(Object.keys(statusMeta) as ListStatus[]).map((status) => (
          <TabsContent key={status} value={status}>
            {grouped[status].length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                  <BookmarkX className="h-6 w-6" />
                  <p>{statusMeta[status].empty}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {grouped[status].map((item) => (
                  <AnimeMiniCard key={`${status}-${item.anime.id}`} item={item} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
