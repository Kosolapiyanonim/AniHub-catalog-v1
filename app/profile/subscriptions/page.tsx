"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { BellOff, Loader2, Search } from "lucide-react"

type SubscriptionItem = {
  created_at: string
  anime: {
    id: number
    shikimori_id: string
    title: string
    poster_url: string | null
    year: number | null
    type: string | null
  }
}

export default function ProfileSubscriptionsPage() {
  const { session, loading } = useSupabase()
  const [items, setItems] = useState<SubscriptionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!session?.user?.id) {
      setItems([])
      setIsLoading(false)
      return
    }

    fetch("/api/subscriptions", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => setItems(Array.isArray(data.items) ? data.items : []))
      .catch(() => setItems([]))
      .finally(() => setIsLoading(false))
  }, [session?.user?.id])

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return items.filter((item) =>
      query.length === 0 ? true : item.anime.title.toLowerCase().includes(query)
    )
  }, [items, search])

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
            <CardTitle>Подписки</CardTitle>
            <CardDescription>Войдите, чтобы видеть подписки.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/login?redirectTo=%2Fprofile%2Fsubscriptions">Войти</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Подписки</h1>
        <p className="text-sm text-muted-foreground">Следите за тайтлами и открывайте их страницу в один тап.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по подпискам" className="pl-9" />
      </div>

      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
            <BellOff className="h-6 w-6" />
            <p>{items.length === 0 ? "У вас пока нет подписок." : "Ничего не найдено."}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <Link key={`subscription-${item.anime.id}`} href={`/anime/${item.anime.shikimori_id}`} className="block">
              <Card className="transition-colors hover:border-primary/50">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="relative h-16 w-12 rounded-md overflow-hidden bg-muted shrink-0">
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
                    <p className="text-sm font-medium line-clamp-1">{item.anime.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.anime.year ?? "—"} {item.anime.type ? `• ${item.anime.type}` : ""}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
